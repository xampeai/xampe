import type { IncomingMessage, ServerResponse } from 'http';

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
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      sendError('Could not obtain Shopify store access.');
      return;
    }

    let storeName = 'Xampe Store';
    let products: Array<Record<string, unknown>> = [];
    if (encodedPayload) {
      try {
        const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        storeName = decoded.storeName || 'Xampe Store';
        products = Array.isArray(decoded.products) ? decoded.products : [];
      } catch {}
    }

    let injectedCount = 0;
    for (const p of products) {
      const gqlRes = await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': tokenJson.access_token },
        body: JSON.stringify({
          query:
            'mutation productCreate($input: ProductCreateInput!) { productCreate(input: $input) { product { id variants(first: 1) { edges { node { id } } } } } }',
          variables: {
            input: {
              title: String(p.name || 'Product'),
              descriptionHtml: '<p>' + String(p.shortDescription || '').replace(/[<>]/g, '') + '</p>',
              vendor: storeName,
              productType: String(p.category || 'Featured'),
              status: 'ACTIVE',
            },
          },
        }),
      });
      const gqlJson = (await gqlRes.json()) as Record<string, unknown>;
      const prod = (gqlJson?.data as Record<string, unknown>)?.productCreate as Record<string, unknown>;
      const prodObj = prod?.product as Record<string, unknown>;
      if (prodObj?.id) {
        injectedCount += 1;
        const edges = ((prodObj.variants as Record<string, unknown>)?.edges as Array<Record<string, unknown>>) || [];
        const variantId = (edges.find((e) => Boolean((e?.node as Record<string, unknown>)?.id))?.node as Record<string, unknown>)?.id;
        if (variantId) {
          await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': tokenJson.access_token },
            body: JSON.stringify({
              query:
                'mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } } }',
              variables: {
                productId: prodObj.id,
                variants: [{ id: variantId, price: Number(p.retailPrice || 29.99).toFixed(2) }],
              },
            }),
          }).catch(() => {});
        }
        if (typeof p.imageUrl === 'string' && /^https?:\/\//i.test(p.imageUrl)) {
          await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': tokenJson.access_token },
            body: JSON.stringify({
              query:
                'mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } } }',
              variables: {
                productId: prodObj.id,
                media: [{ originalSource: p.imageUrl, alt: String(p.name || 'Product'), mediaContentType: 'IMAGE' }],
              },
            }),
          }).catch(() => {});
        }
      }
    }

    const payload = JSON.stringify({
      type: 'SHOPIFY_INJECT_SUCCESS',
      shop,
      storeName,
      injectedCount,
      adminProductsUrl: 'https://' + shop + '/admin/products',
    });
    const fallbackUrl =
      '/?shopify_connected=true&shop=' +
      encodeURIComponent(shop) +
      '&count=' +
      injectedCount +
      '&store=' +
      encodeURIComponent(storeName);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(
      '<script>var p=' +
        payload +
        ';if(window.opener){window.opener.postMessage(p,"*");window.close();}else{window.location.replace(' +
        JSON.stringify(fallbackUrl) +
        ');}</script><p>Store pushed to Shopify!</p>'
    );
  } catch {
    sendError('Issue pushing products to Shopify.');
  }
}
