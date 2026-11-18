import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

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

function getShopifyCredentials() {
  const rawId = (process.env.SHOPIFY_CLIENT_ID || '').trim();
  const rawSecret = (process.env.SHOPIFY_CLIENT_SECRET || '').trim();
  return {
    clientId: rawId && rawId !== 'MY_SHOPIFY_CLIENT_ID' ? rawId : '',
    clientSecret: rawSecret && rawSecret !== 'MY_SHOPIFY_CLIENT_SECRET' ? rawSecret : '',
  };
}

function normalizeShopDomain(input: string): string | null {
  let clean = input.trim().toLowerCase().replace(/^https?:\/\//, '');
  const slashIdx = clean.indexOf('/');
  if (slashIdx !== -1) clean = clean.slice(0, slashIdx);
  const qIdx = clean.indexOf('?');
  if (qIdx !== -1) clean = clean.slice(0, qIdx);
  clean = clean.trim();
  if (!clean) return null;
  if (!clean.includes('.')) clean = clean + '.myshopify.com';
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(clean)) return null;
  return clean;
}

function verifyShopifyHmac(params: URLSearchParams, clientSecret: string): boolean {
  const hmac = params.get('hmac') || '';
  if (!hmac || !clientSecret) return false;
  const keys: string[] = [];
  params.forEach((_v, k) => {
    if (k !== 'hmac' && k !== 'signature') keys.push(k);
  });
  keys.sort();
  const message = keys.map((k) => k + '=' + (params.get(k) || '')).join('&');
  const generated = crypto.createHmac('sha256', clientSecret).update(message).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(generated, 'utf8'), Buffer.from(hmac, 'utf8'));
  } catch {
    return false;
  }
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
async function shopifyGraphql(shop: string, accessToken: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch('https://' + shop + '/admin/api/' + SHOPIFY_API_VERSION + '/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as Record<string, unknown>;
}

async function injectProductToShopify(shop: string, accessToken: string, storeName: string, p: ShopifySessionProduct): Promise<boolean> {
  const desc = (p.shortDescription || '').replace(/[<>]/g, '');
  const bullets = (p.benefits || []).map((b) => '<li>' + b.replace(/[<>]/g, '') + '</li>').join('');
  const descriptionHtml = bullets ? '<p>' + desc + '</p><ul>' + bullets + '</ul>' : '<p>' + (desc || 'Curated everyday essential.') + '</p>';

  const createRes = await shopifyGraphql(
    shop,
    accessToken,
    'mutation productCreate($input: ProductCreateInput!) { productCreate(input: $input) { product { id variants(first: 1) { edges { node { id } } } } } }',
    {
      input: {
        title: p.name,
        descriptionHtml,
        vendor: storeName || 'Xampe Brand',
        productType: p.category || 'Featured',
        status: 'ACTIVE',
        tags: ['Xampe Curated', p.category || 'Featured'],
      },
    }
  );

  const data = createRes.data as { productCreate?: { product?: { id?: string; variants?: { edges?: Array<{ node?: { id?: string } }> } } } } | undefined;
  const productId = data?.productCreate?.product?.id || '';
  if (!productId) return false;

  const firstEdge = (data?.productCreate?.product?.variants?.edges || []).find((e) => Boolean(e?.node?.id));
  const variantId = firstEdge?.node?.id || '';
  if (variantId) {
    await shopifyGraphql(
      shop,
      accessToken,
      'mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } } }',
      { productId, variants: [{ id: variantId, price: Number(p.retailPrice || 29.99).toFixed(2) }] }
    );
  }

  if (p.imageUrl && /^https?:\/\//i.test(p.imageUrl)) {
    await shopifyGraphql(
      shop,
      accessToken,
      'mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } } }',
      { productId, media: [{ originalSource: p.imageUrl, alt: p.name, mediaContentType: 'IMAGE' }] }
    ).catch(() => {});
  }

  return true;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'https://xampe.com');
  const pathname = url.pathname.replace(/\/+$/, '');

  if (pathname === '/api/health') {
    const serper = Boolean((process.env.SERPER_API_KEY || process.env.VITE_SERPER_API_KEY || '').trim());
    const { clientId, clientSecret } = getShopifyCredentials();
    sendJson(res, 200, { ok: true, envConfigured: { serper, shopify: Boolean(clientId && clientSecret) } });
    return;
  }

  if (pathname === '/api/shopify/session' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const shop = normalizeShopDomain(String(body.shop || ''));
    if (!shop) {
      sendJson(res, 400, { ok: false, error: 'Enter a valid .myshopify.com store domain.' });
      return;
    }
    const products = Array.isArray(body.products) ? (body.products as ShopifySessionProduct[]) : [];
    if (products.length === 0) {
      sendJson(res, 400, { ok: false, error: 'No products found to push.' });
      return;
    }
    const { clientId, clientSecret } = getShopifyCredentials();
    if (!clientId || !clientSecret) {
      sendJson(res, 503, { ok: false, code: 'SHOPIFY_APP_NOT_CONFIGURED', error: 'Shopify keys missing on server.' });
      return;
    }

    const baseUrl = (process.env.APP_URL || 'https://xampe.com').trim().replace(/\/+$/, '');
    const compactPayload = Buffer.from(
      JSON.stringify({
        storeName: String(body.storeName || 'Xampe Store').trim(),
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
      state: crypto.randomUUID() + '.' + compactPayload,
    });

    sendJson(res, 200, {
      ok: true,
      shop,
      authUrl: 'https://' + shop + '/admin/oauth/authorize?' + params.toString(),
      redirectUri,
    });
    return;
  }

  if (pathname === '/api/shopify/callback') {
    const shop = normalizeShopDomain(url.searchParams.get('shop') || '');
    const code = (url.searchParams.get('code') || '').trim();
    const rawState = (url.searchParams.get('state') || '').trim();
    const dotIdx = rawState.indexOf('.');
    const encodedPayload = dotIdx !== -1 ? rawState.slice(dotIdx + 1) : '';
    const { clientId, clientSecret } = getShopifyCredentials();

    const sendError = (msg: string) => {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html');
      res.end('<script>if(window.opener){window.opener.postMessage({type:"SHOPIFY_INJECT_ERROR",message:' + JSON.stringify(msg) + '},"*");window.close();}else{window.location.replace("/?shopify_error="+' + JSON.stringify(encodeURIComponent(msg)) + ');}</script><p>' + msg + '</p>');
    };

    if (!shop || !code || !clientId || !clientSecret) {
      sendError('Could not complete Shopify authorization.');
      return;
    }
    if (url.searchParams.get('hmac') && !verifyShopifyHmac(url.searchParams, clientSecret)) {
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end('<script>var p=' + payload + ';if(window.opener){window.opener.postMessage(p,"*");window.close();}else{window.location.replace(' + JSON.stringify(fallbackUrl) + ');}</script><p>Store pushed to Shopify!</p>');
    } catch {
      sendError('Issue pushing products to Shopify.');
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}
