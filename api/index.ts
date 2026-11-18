import crypto from 'crypto';
import express from 'express';
import type { Request, Response } from 'express';

const SHOPIFY_API_VERSION = '2025-01';

interface ShopifySessionProduct {
  name: string;
  shortDescription?: string;
  benefits?: string[];
  category?: string;
  sku?: string;
  retailPrice: number;
  supplierCost?: number;
  imageUrl?: string;
}

function resolveSerperKey(req: Request): string {
  const headerKey = req.header('x-serper-key')?.trim();
  if (headerKey) return headerKey;
  return (
    process.env.SERPER_API_KEY?.trim() ||
    process.env.VITE_SERPER_API_KEY?.trim() ||
    ''
  );
}

function getShopifyCredentials(): { clientId: string; clientSecret: string } {
  const rawId = process.env.SHOPIFY_CLIENT_ID?.trim() || '';
  const rawSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || '';
  const clientId = rawId && rawId !== 'MY_SHOPIFY_CLIENT_ID' ? rawId : '';
  const clientSecret =
    rawSecret && rawSecret !== 'MY_SHOPIFY_CLIENT_SECRET' ? rawSecret : '';
  return { clientId, clientSecret };
}

function normalizeShopDomain(input: string): string | null {
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, '').split('/')[0].split('?')[0].trim();
  if (!clean) return null;
  if (!clean.includes('.')) {
    clean = clean + '.myshopify.com';
  }
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(clean)) {
    return null;
  }
  return clean;
}

function resolveAppBaseUrl(req: Request, clientOrigin?: string): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && envUrl !== 'MY_APP_URL' && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/+$/, '');
  }
  if (
    clientOrigin &&
    (/^https:\/\/[a-z0-9.-]+$/i.test(clientOrigin.trim()) ||
      /^http:\/\/localhost:\d+$/i.test(clientOrigin.trim()))
  ) {
    return clientOrigin.trim().replace(/\/+$/, '');
  }
  const forwardedProto = req.header('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwardedProto || 'https';
  const host = req.header('x-forwarded-host') || req.get('host') || 'xampe.com';
  return proto + '://' + host;
}

function verifyShopifyHmac(
  query: Record<string, unknown>,
  clientSecret: string
): boolean {
  const hmac = typeof query.hmac === 'string' ? query.hmac : '';
  if (!hmac || !clientSecret) return false;

  const message = Object.keys(query)
    .filter((k) => k !== 'hmac' && k !== 'signature')
    .sort()
    .map((k) => {
      const val = query[k];
      return k + '=' + (Array.isArray(val) ? val.join(',') : String(val ?? ''));
    })
    .join('&');

  const generated = crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generated, 'utf8'),
      Buffer.from(hmac, 'utf8')
    );
  } catch {
    return false;
  }
}

async function shopifyGraphql<T>(
  shop: string,
  accessToken: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    'https://' + shop + '/admin/api/' + SHOPIFY_API_VERSION + '/graphql.json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || (json.errors && json.errors.length > 0)) {
    const errMsg =
      json.errors?.map((e) => e.message).filter(Boolean).join('; ') ||
      'Shopify GraphQL request failed (' + res.status + ')';
    throw new Error(errMsg);
  }

  if (!json.data) {
    throw new Error('Empty response from Shopify Admin GraphQL API');
  }

  return json.data;
}

function buildProductHtml(p: ShopifySessionProduct): string {
  const desc = (p.shortDescription || '').replace(/[<>]/g, '');
  const bullets = (p.benefits || [])
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => '<li>' + b.replace(/[<>]/g, '') + '</li>')
    .join('');

  if (bullets) {
    return '<p>' + desc + '</p><ul>' + bullets + '</ul>';
  }
  return '<p>' + (desc || 'Curated everyday essential engineered for reliable daily performance.') + '</p>';
}
async function injectProductToShopify(
  shop: string,
  accessToken: string,
  storeName: string,
  product: ShopifySessionProduct
): Promise<boolean> {
  const createMutation =
    'mutation productCreate($input: ProductCreateInput!) { productCreate(input: $input) { product { id variants(first: 1) { edges { node { id } } } } userErrors { message } } }';

  const createData = await shopifyGraphql<{
    productCreate: {
      product?: {
        id: string;
        variants?: { edges: Array<{ node: { id: string } }> };
      };
    };
  }>(shop, accessToken, createMutation, {
    input: {
      title: product.name,
      descriptionHtml: buildProductHtml(product),
      vendor: storeName || 'Xampe Brand',
      productType: product.category || 'Featured',
      status: 'ACTIVE',
      tags: ['Xampe Curated', product.category || 'Featured'],
    },
  });

  const createdProduct = createData.productCreate?.product;
  if (!createdProduct?.id) return false;

  const variantEdges = createdProduct.variants?.edges || [];
  const defaultVariantId = variantEdges.length > 0 ? variantEdges[0].node.id : '';
  if (defaultVariantId) {
    const priceMutation =
      'mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } } }';

    await shopifyGraphql(shop, accessToken, priceMutation, {
      productId: createdProduct.id,
      variants: [
        {
          id: defaultVariantId,
          price: Number(product.retailPrice || 29.99).toFixed(2),
        },
      ],
    });
  }

  if (product.imageUrl && /^https?:\/\//i.test(product.imageUrl)) {
    const mediaMutation =
      'mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } } }';

    await shopifyGraphql(shop, accessToken, mediaMutation, {
      productId: createdProduct.id,
      media: [
        {
          originalSource: product.imageUrl,
          alt: product.name,
          mediaContentType: 'IMAGE',
        },
      ],
    }).catch(() => {});
  }

  return true;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  const serper = Boolean(
    process.env.SERPER_API_KEY?.trim() || process.env.VITE_SERPER_API_KEY?.trim()
  );
  const { clientId, clientSecret } = getShopifyCredentials();
  res.json({
    ok: true,
    envConfigured: { serper, shopify: Boolean(clientId && clientSecret) },
  });
});

app.post('/api/serper-shopping', async (req: Request, res: Response) => {
  const apiKey = resolveSerperKey(req);
  if (!apiKey) {
    res.status(401).json({ error: 'Missing Serper.dev API key.', code: 'MISSING_SERPER_KEY' });
    return;
  }
  const rawQ = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
  const num = Math.min(40, Math.max(1, Number(req.body?.num) || 25));
  if (!rawQ) {
    res.status(400).json({ error: 'Search query "q" is required.' });
    return;
  }
  try {
    const upstream = await fetch('https://serper.dev', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: rawQ, num }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Network error' });
  }
});

app.post('/api/serper-images', async (req: Request, res: Response) => {
  const apiKey = resolveSerperKey(req);
  if (!apiKey) {
    res.status(401).json({ error: 'Missing Serper.dev API key.', code: 'MISSING_SERPER_KEY' });
    return;
  }
  const rawQ = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
  const num = Math.min(20, Math.max(1, Number(req.body?.num) || 15));
  if (!rawQ) {
    res.status(400).json({ error: 'Search query "q" is required.' });
    return;
  }
  try {
    const upstream = await fetch('https://serper.dev', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: rawQ, num }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Network error' });
  }
});

app.post('/api/shopify/session', (req: Request, res: Response) => {
  const shop = normalizeShopDomain(String(req.body?.shop || ''));
  if (!shop) {
    res.status(400).json({ ok: false, error: 'Enter a valid .myshopify.com store domain.' });
    return;
  }
  const products = Array.isArray(req.body?.products) ? (req.body.products as ShopifySessionProduct[]) : [];
  if (products.length === 0) {
    res.status(400).json({ ok: false, error: 'No products found to push.' });
    return;
  }
  const { clientId, clientSecret } = getShopifyCredentials();
  if (!clientId || !clientSecret) {
    res.status(503).json({ ok: false, code: 'SHOPIFY_APP_NOT_CONFIGURED', error: 'Shopify keys missing.' });
    return;
  }
  const sessionId = crypto.randomUUID();
  const baseUrl = resolveAppBaseUrl(req, typeof req.body?.origin === 'string' ? req.body.origin : undefined);
  const compactPayload = Buffer.from(
    JSON.stringify({
      storeName: String(req.body?.storeName || 'Xampe Store').trim(),
      products: products.slice(0, 6).map((p) => ({
        name: p.name,
        shortDescription: p.shortDescription,
        benefits: p.benefits,
        category: p.category,
        retailPrice: p.retailPrice,
        imageUrl: p.imageUrl,
      })),
    })
  ).toString('base64url');

  const redirectUri = baseUrl + '/api/shopify/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'write_products,read_products,write_themes,read_themes',
    redirect_uri: redirectUri,
    state: sessionId + '.' + compactPayload,
  });

  res.json({
    ok: true,
    sessionId,
    shop,
    authUrl: 'https://' + shop + '/admin/oauth/authorize?' + params.toString(),
    redirectUri,
  });
});

app.get(['/api/shopify/callback', '/api/shopify/callback/'], async (req: Request, res: Response) => {
  const shop = normalizeShopDomain(String(req.query.shop || ''));
  const code = String(req.query.code || '').trim();
  const [, encodedPayload] = String(req.query.state || '').trim().split('.');
  const { clientId, clientSecret } = getShopifyCredentials();

  const sendError = (msg: string) => {
    res.status(400).send('<script>if(window.opener){window.opener.postMessage({type:"SHOPIFY_INJECT_ERROR",message:' + JSON.stringify(msg) + '},"*");window.close();}else{window.location.replace("/?shopify_error="+' + JSON.stringify(encodeURIComponent(msg)) + ');}</script><p>' + msg + '</p>');
  };

  if (!shop || !code || !clientId || !clientSecret) {
    sendError('Could not complete Shopify authorization.');
    return;
  }
  if (req.query.hmac && !verifyShopifyHmac(req.query as Record<string, unknown>, clientSecret)) {
    sendError('Shopify signature verification failed.');
    return;
  }

  try {
    const tokenRes = await fetch('https://' + shop + '/admin/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      sendError('Could not obtain Shopify store access.');
      return;
    }

    let storeName = 'Xampe Store';
    let products: ShopifySessionProduct[] = [];
    if (encodedPayload) {
      try {
        const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        storeName = decoded.storeName || 'Xampe Store';
        products = Array.isArray(decoded.products) ? decoded.products : [];
      } catch {}
    }

    let injectedCount = 0;
    for (const product of products) {
      const ok = await injectProductToShopify(shop, tokenJson.access_token, storeName, product);
      if (ok) injectedCount += 1;
    }

    const payload = JSON.stringify({
      type: 'SHOPIFY_INJECT_SUCCESS',
      shop,
      storeName,
      injectedCount,
      adminProductsUrl: 'https://' + shop + '/admin/products',
    });
    const fallbackUrl = '/?shopify_connected=true&shop=' + encodeURIComponent(shop) + '&count=' + injectedCount + '&store=' + encodeURIComponent(storeName);

    res.send('<script>var p=' + payload + ';if(window.opener){window.opener.postMessage(p,"*");window.close();}else{window.location.replace(' + JSON.stringify(fallbackUrl) + ');}</script><p>Store pushed to Shopify!</p>');
  } catch {
    sendError('Issue pushing products to Shopify.');
  }
});

export default app;
