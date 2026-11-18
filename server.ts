import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const SHOPIFY_API_VERSION = '2025-01';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const SESSION_STORE_PATH = path.join(os.tmpdir(), 'xampe-shopify-sessions.json');

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

interface ShopifyStoreSession {
  id: string;
  shop: string;
  storeName: string;
  colorTheme: string;
  primaryHex: string;
  products: ShopifySessionProduct[];
  baseUrl: string;
  createdAt: number;
}

const sessionStore = new Map<string, ShopifyStoreSession>();

function hydrateSessionsFromDisk(): void {
  try {
    if (!fs.existsSync(SESSION_STORE_PATH)) return;
    const raw = fs.readFileSync(SESSION_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, ShopifyStoreSession>;
    const now = Date.now();
    for (const [key, val] of Object.entries(parsed)) {
      if (val && now - val.createdAt < SESSION_TTL_MS) {
        sessionStore.set(key, val);
      }
    }
  } catch {
    // Ignore corrupt temp cache
  }
}

function persistSessionsToDisk(): void {
  try {
    const now = Date.now();
    for (const [key, val] of sessionStore.entries()) {
      if (now - val.createdAt >= SESSION_TTL_MS) {
        sessionStore.delete(key);
      }
    }
    const obj: Record<string, ShopifyStoreSession> = {};
    for (const [k, v] of sessionStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(SESSION_STORE_PATH, JSON.stringify(obj), 'utf8');
  } catch {
    // Best-effort temp file sync
  }
}

hydrateSessionsFromDisk();

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
    clean = `${clean}.myshopify.com`;
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
  const proto = forwardedProto || req.protocol || 'https';
  const host = req.header('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
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
      return `${k}=${Array.isArray(val) ? val.join(',') : String(val ?? '')}`;
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
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
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
      `Shopify GraphQL request failed (${res.status})`;
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
    .map((b) => `<li>${b.replace(/[<>]/g, '')}</li>`)
    .join('');

  if (bullets) {
    return `<p>${desc}</p><ul>${bullets}</ul>`;
  }
  return `<p>${desc || 'Curated everyday essential engineered for reliable daily performance.'}</p>`;
}

async function injectProductToShopify(
  shop: string,
  accessToken: string,
  storeName: string,
  product: ShopifySessionProduct
): Promise<boolean> {
  const createMutation = `
    mutation productCreate($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const createData = await shopifyGraphql<{
    productCreate: {
      product?: {
        id: string;
        variants?: { edges: Array<{ node: { id: string } }> };
      };
      userErrors: Array<{ field?: string[]; message: string }>;
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
  if (!createdProduct?.id) {
    return false;
  }

  const defaultVariantId = createdProduct.variants?.edges?.[0]?.node?.id;
  if (defaultVariantId) {
    const priceMutation = `
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants {
            id
            price
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
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

  if (
    product.imageUrl &&
    (product.imageUrl.startsWith('https://') ||
      product.imageUrl.startsWith('http://'))
  ) {
    const mediaMutation = `
      mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media {
            id
          }
          mediaUserErrors {
            field
            message
          }
        }
      }
    `;
    await shopifyGraphql(shop, accessToken, mediaMutation, {
      productId: createdProduct.id,
      media: [
        {
          originalSource: product.imageUrl,
          alt: product.name,
          mediaContentType: 'IMAGE',
        },
      ],
    }).catch(() => {
      // Non-fatal if an external merchant image host blocks Shopify CDN fetch
    });
  }

  return true;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Check whether server-side env keys are configured
  app.get('/api/health', (_req: Request, res: Response) => {
    const serper = Boolean(
      process.env.SERPER_API_KEY?.trim() ||
        process.env.VITE_SERPER_API_KEY?.trim()
    );
    const { clientId, clientSecret } = getShopifyCredentials();
    res.json({
      ok: true,
      envConfigured: {
        serper,
        shopify: Boolean(clientId && clientSecret),
      },
    });
  });

  // Live Serper.dev Google Shopping Proxy
  app.post('/api/serper-shopping', async (req: Request, res: Response) => {
    const apiKey = resolveSerperKey(req);
    if (!apiKey) {
      res.status(401).json({
        error: 'Missing Serper.dev API key. Add it in API Keys settings or SERPER_API_KEY env var.',
        code: 'MISSING_SERPER_KEY',
      });
      return;
    }

    const rawQ = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
    const num = Math.min(40, Math.max(1, Number(req.body?.num) || 25));

    if (!rawQ) {
      res.status(400).json({ error: 'Search query "q" is required.' });
      return;
    }

    try {
      const upstream = await fetch('https://google.serper.dev/shopping', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: rawQ, num }),
      });

      const text = await upstream.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!upstream.ok) {
        const message =
          typeof data === 'object' && data && 'message' in data
            ? String((data as { message: unknown }).message)
            : `Serper API returned ${upstream.status}`;
        res.status(upstream.status).json({ error: message });
        return;
      }

      res.json(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error calling Serper.dev';
      res.status(502).json({ error: msg });
    }
  });

  // Live Serper.dev Images Proxy (Lifestyle Hero Banners)
  app.post('/api/serper-images', async (req: Request, res: Response) => {
    const apiKey = resolveSerperKey(req);
    if (!apiKey) {
      res.status(401).json({
        error: 'Missing Serper.dev API key. Add it in API Keys settings or SERPER_API_KEY env var.',
        code: 'MISSING_SERPER_KEY',
      });
      return;
    }

    const rawQ = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
    const num = Math.min(20, Math.max(1, Number(req.body?.num) || 15));

    if (!rawQ) {
      res.status(400).json({ error: 'Search query "q" is required.' });
      return;
    }

    try {
      const upstream = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: rawQ, num }),
      });

      const text = await upstream.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!upstream.ok) {
        const message =
          typeof data === 'object' && data && 'message' in data
            ? String((data as { message: unknown }).message)
            : `Serper Images API returned ${upstream.status}`;
        res.status(upstream.status).json({ error: message });
        return;
      }

      res.json(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error calling Serper Images API';
      res.status(502).json({ error: msg });
    }
  });

  // Save generated store payload & return Shopify OAuth install URL
  app.post('/api/shopify/session', (req: Request, res: Response) => {
    const shop = normalizeShopDomain(String(req.body?.shop || ''));
    if (!shop) {
      res.status(400).json({
        ok: false,
        error: 'Enter a valid .myshopify.com store domain (for example: my-brand.myshopify.com).',
      });
      return;
    }

    const products = Array.isArray(req.body?.products)
      ? (req.body.products as ShopifySessionProduct[])
      : [];
    if (products.length === 0) {
      res.status(400).json({
        ok: false,
        error: 'No products found to push. Generate a store preview first.',
      });
      return;
    }

    const { clientId, clientSecret } = getShopifyCredentials();
    if (!clientId || !clientSecret) {
      res.status(503).json({
        ok: false,
        code: 'SHOPIFY_APP_NOT_CONFIGURED',
        error:
          '1-Click automatic Shopify sync is awaiting store app activation. Use the Shopify Product CSV button below to import all 6 products immediately.',
      });
      return;
    }

    const sessionId = crypto.randomUUID();
    const baseUrl = resolveAppBaseUrl(
      req,
      typeof req.body?.origin === 'string' ? req.body.origin : undefined
    );

    const session: ShopifyStoreSession = {
      id: sessionId,
      shop,
      storeName: String(req.body?.storeName || 'Xampe Store').trim(),
      colorTheme: String(req.body?.colorTheme || 'orange'),
      primaryHex: String(req.body?.primaryHex || '#EA580C'),
      products: products.slice(0, 6),
      baseUrl,
      createdAt: Date.now(),
    };

    sessionStore.set(sessionId, session);
    persistSessionsToDisk();

    const redirectUri = `${baseUrl}/api/shopify/callback?sessionId=${encodeURIComponent(sessionId)}`;
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'write_products,read_products,write_themes,read_themes',
      redirect_uri: redirectUri,
      state: sessionId,
    });

    const authUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
    res.json({
      ok: true,
      sessionId,
      shop,
      authUrl,
      redirectUri,
    });
  });

  // Shopify OAuth Callback & Automatic 6-Product Store Injection
  const handleShopifyCallback = async (req: Request, res: Response) => {
    const rawShop = String(req.query.shop || '');
    const shop = normalizeShopDomain(rawShop);
    const code = String(req.query.code || '').trim();
    const sessionId = String(req.query.sessionId || req.query.state || '').trim();
    const { clientId, clientSecret } = getShopifyCredentials();

    const sendErrorResult = (message: string) => {
      const safeMsg = JSON.stringify(message);
      const redirectUrl = `/?shopify_error=${encodeURIComponent(message)}`;
      res.status(400).send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 32px; color: #111827;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'SHOPIFY_INJECT_ERROR', message: ${safeMsg} }, '*');
        window.close();
      } else {
        window.location.replace(${JSON.stringify(redirectUrl)});
      }
    </script>
    <p>${message.replace(/[<>]/g, '')}</p>
  </body>
</html>`);
    };

    if (!shop || !code || !clientId || !clientSecret) {
      sendErrorResult('Could not complete Shopify authorization. Please try again or download the Shopify Product CSV.');
      return;
    }

    if (req.query.hmac && !verifyShopifyHmac(req.query as Record<string, unknown>, clientSecret)) {
      sendErrorResult('Shopify authorization signature could not be verified. Please retry.');
      return;
    }

    try {
      const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        error?: string;
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        sendErrorResult('Could not obtain Shopify store access. Please retry authorization.');
        return;
      }

      const accessToken = tokenJson.access_token;
      const session = sessionId ? sessionStore.get(sessionId) : undefined;

      let injectedCount = 0;
      const storeName = session?.storeName || 'Xampe Store';

      if (session && session.products.length > 0) {
        for (const product of session.products) {
          const ok = await injectProductToShopify(
            shop,
            accessToken,
            storeName,
            product
          );
          if (ok) injectedCount += 1;
        }
        sessionStore.delete(sessionId);
        persistSessionsToDisk();
      }

      const adminProductsUrl = `https://${shop}/admin/products`;
      const redirectSuccessUrl = `/?shopify_connected=true&shop=${encodeURIComponent(
        shop
      )}&count=${injectedCount}&store=${encodeURIComponent(storeName)}`;

      res.send(`<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; color: #111827;">
    <script>
      var payload = {
        type: 'SHOPIFY_INJECT_SUCCESS',
        shop: ${JSON.stringify(shop)},
        storeName: ${JSON.stringify(storeName)},
        injectedCount: ${injectedCount},
        adminProductsUrl: ${JSON.stringify(adminProductsUrl)}
      };
      if (window.opener) {
        window.opener.postMessage(payload, '*');
        window.close();
      } else {
        window.location.replace(${JSON.stringify(redirectSuccessUrl)});
      }
    </script>
    <p>Store pushed to Shopify! Redirecting back to Xampe...</p>
  </body>
</html>`);
    } catch {
      sendErrorResult('We encountered an issue pushing products to Shopify. Please retry or use the Shopify CSV download.');
    }
  };

  app.get(['/api/shopify/callback', '/api/shopify/callback/'], handleShopifyCallback);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Xampe server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Xampe server:', err);
  process.exit(1);
});
