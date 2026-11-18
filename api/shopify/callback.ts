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
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        expiring: 1,
      }),
    });
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      sendError('Could not obtain expiring Shopify store access.');
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
    let lastError = '';

    for (const p of products) {
      const desc = String(p.shortDescription || '').replace(/[<>]/g, '');
      const bullets = Array.isArray(p.benefits)
        ? p.benefits.map((b) => '<li>' + String(b).replace(/[<>]/g, '') + '</li>').join('')
        : '';
      const descriptionHtml = bullets
        ? '<p>' + desc + '</p><ul>' + bullets + '</ul>'
        : '<p>' + (desc || 'Curated everyday essential.') + '</p>';

      const hasImage = typeof p.imageUrl === 'string' && /^https?:\/\//i.test(p.imageUrl);
      const media = hasImage
        ? [{ originalSource: p.imageUrl, alt: String(p.name || 'Product'), mediaContentType: 'IMAGE' }]
        : undefined;

      const gqlRes = await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': tokenJson.access_token,
        },
        body: JSON.stringify({
          query:
            'mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id variants(first: 1) { edges { node { id } } } } userErrors { field message } } }',
          variables: {
            product: {
              title: String(p.name || 'Product'),
              descriptionHtml,
              vendor: storeName,
              productType: String(p.category || 'Featured'),
              status: 'ACTIVE',
              tags: ['Xampe Curated', String(p.category || 'Featured')],
            },
            media,
          },
        }),
      });

      const gqlJson = (await gqlRes.json()) as Record<string, unknown>;
      const prodCreate = (gqlJson?.data as Record<string, unknown>)?.productCreate as Record<string, unknown>;
      const prodObj = prodCreate?.product as Record<string, unknown>;

      if (prodObj?.id) {
        injectedCount += 1;
        const edges = ((prodObj.variants as Record<string, unknown>)?.edges as Array<Record<string, unknown>>) || [];
        const firstNode = (edges.find((e) => Boolean((e?.node as Record<string, unknown>)?.id))?.node as Record<string, unknown>) || {};
        if (firstNode.id) {
          await fetch('https://' + shop + '/admin/api/2025-01/graphql.json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': tokenJson.access_token,
            },
            body: JSON.stringify({
              query:
                'mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } } }',
              variables: {
                productId: prodObj.id,
                variants: [{ id: firstNode.id, price: Number(p.retailPrice || 29.99).toFixed(2) }],
              },
            }),
          }).catch(() => {});
        }
      } else {
        lastError = JSON.stringify(gqlJson).slice(0, 220);
      }
    }

    if (injectedCount === 0) {
      sendError('Shopify GraphQL response -> ' + lastError);
      return;
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
  } catch (err) {
    sendError('Callback exception: ' + (err instanceof Error ? err.message : String(err)));
  }
}
