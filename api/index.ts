import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';

const SHOPIFY_API_VERSION = '2025-01';
const SESSION_TTL_MS = 60 * 60 * 1000;
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
  } catch {}
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
  } catch {}
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
  const proto = forwardedProto || 'https';
  const host = req.header('x-forwarded-host') || req.get('host') || 'xampe.com';
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
    }).catch(() => {});
  }

  return true;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

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

app.post('/api/serper-shopping', async (req: Request, res: Response) => {
  const apiKey = resolveSerperKey(req);
  if (!apiKey) {
    res.status(401).json({
      error: 'Missing Serper.dev API key.',
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
      res.status(upstream.status).json({ error: `Serper API returned ${upstream.status}` });
      return;
    }
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Network error' });
  }
});

