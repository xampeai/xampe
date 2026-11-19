import type { IncomingMessage, ServerResponse } from 'http';

async function shopifyGql(shop: string, token: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as Record<string, unknown>;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'https://xampe.com');
  const shop = (url.searchParams.get('shop') || '').trim().toLowerCase();
  const code = (url.searchParams.get('code') || '').trim();
  const rawState = (url.searchParams.get('state') || '').trim();
  const dotIdx = rawState.indexOf('.');
  const encodedPayload = dotIdx !== -1 ? rawState.slice(dotIdx + 1) : '';

  const clientId = (process.env.SHOPIFY_CLIENT_ID || '').trim();
  const clientSecret = (process.env.SHOPIFY_CLIENT_SECRET || '').trim();

  const sendError = (msg: string) => {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html');
    res.end(
      '<script>if(window.opener){window.opener.postMessage({type:"SHOPIFY_INJECT_ERROR",message:' +
        JSON.stringify(msg) +
        '},"*");window.close();}else{window.location.replace("/?shopify_error="+' +
        JSON.stringify(encodeURIComponent(msg)) +
        ');}</script><p>' +
        msg +
        '</p>'
    );
  };

  if (!shop || !code || !clientId || !clientSecret) {
    sendError('Could not complete Shopify authorization.');
    return;
  }

  try {
    const tokenRes = await fetch('https://' + shop + '/admin/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, expiring: 1 }),
    });
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      sendError('Could not obtain Shopify store access.');
      return;
    }

    const token = tokenJson.access_token;
    let storeName = 'Xampe Store';
    let tagline = 'Curated everyday essentials';
    let heroHeadline = 'Welcome to Our Store';
    let heroSubheadline = 'Engineered for performance, built for everyday life.';
    let products: Array<Record<string, unknown>> = [];

    if (encodedPayload) {
      try {
        const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        storeName = decoded.storeName || storeName;
        tagline = decoded.tagline || tagline;
        heroHeadline = decoded.heroHeadline || 'Welcome to ' + storeName;
        heroSubheadline = decoded.heroSubheadline || heroSubheadline;
        products = Array.isArray(decoded.products) ? decoded.products : [];
      } catch {}
    }

    // 1. Find Online Store publication ID so products appear on the live site automatically
    let onlineStorePubId = '';
    try {
      const pubRes = await shopifyGql(
        shop,
        token,
        'query { publications(first: 10) { edges { node { id name } } } }'
      );
      const edges = (((pubRes?.data as Record<string, unknown>)?.publications as Record<string, unknown>)?.edges as Array<Record<string, unknown>>) || [];
      const onlineNode = edges
        .map((e) => e?.node as Record<string, unknown>)
        .find((n) => String(n?.name || '').toLowerCase().includes('online store'));
      if (onlineNode?.id) onlineStorePubId = String(onlineNode.id);
    } catch {}
