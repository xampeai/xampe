import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {}

  let clean = String(body.shop || '').trim().toLowerCase().replace(/^https?:\/\//, '');
  const slash = clean.indexOf('/');
  if (slash !== -1) clean = clean.slice(0, slash);
  if (clean && !clean.includes('.')) clean = clean + '.myshopify.com';

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(clean)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: 'Enter a valid .myshopify.com store domain.' }));
    return;
  }

  const products = Array.isArray(body.products) ? body.products : [];
  if (products.length === 0) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: 'No products found to push.' }));
    return;
  }

  const clientId = (process.env.SHOPIFY_CLIENT_ID || '').trim();
  const clientSecret = (process.env.SHOPIFY_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, error: 'Shopify keys missing on Vercel.' }));
    return;
  }

  const baseUrl = (process.env.APP_URL || 'https://xampe.com').trim().replace(/\/+$/, '');
  const compactPayload = Buffer.from(
    JSON.stringify({
      storeName: String(body.storeName || 'Xampe Store').trim(),
      products: products.slice(0, 6).map((p: Record<string, unknown>) => ({
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

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      shop: clean,
      authUrl: 'https://' + clean + '/admin/oauth/authorize?' + params.toString(),
      redirectUri,
    })
  );
}
