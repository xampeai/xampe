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
    // 2. Create all 6 products, set retail prices, attach images, and publish to Online Store
    let injectedCount = 0;
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

      const gqlJson = await shopifyGql(
        shop,
        token,
        'mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id variants(first: 1) { edges { node { id } } } } } }',
        {
          product: {
            title: String(p.name || 'Product'),
            descriptionHtml,
            vendor: storeName,
            productType: String(p.category || 'Featured'),
            status: 'ACTIVE',
            tags: ['Xampe Curated', String(p.category || 'Featured')],
          },
          media,
        }
      );

      const prodObj = ((gqlJson?.data as Record<string, unknown>)?.productCreate as Record<string, unknown>)?.product as Record<string, unknown>;
      if (prodObj?.id) {
        injectedCount += 1;
        const edges = ((prodObj.variants as Record<string, unknown>)?.edges as Array<Record<string, unknown>>) || [];
        const firstNode = (edges.find((e) => Boolean((e?.node as Record<string, unknown>)?.id))?.node as Record<string, unknown>) || {};
        if (firstNode.id) {
          await shopifyGql(
            shop,
            token,
            'mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } } }',
            {
              productId: prodObj.id,
              variants: [{ id: firstNode.id, price: Number(p.retailPrice || 29.99).toFixed(2) }],
            }
          ).catch(() => {});
        }
        if (onlineStorePubId) {
          await shopifyGql(
            shop,
            token,
            'mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { publishable { availablePublicationsCount { count } } } }',
            {
              id: prodObj.id,
              input: [{ publicationId: onlineStorePubId }],
            }
          ).catch(() => {});
        }
      }
    }

    // 3. Customize the active Shopify theme homepage (hero headline, subheadline & product showcase)
    try {
      const themesRes = await fetch('https://' + shop + '/admin/api/2025-01/themes.json', {
        headers: { 'X-Shopify-Access-Token': token },
      });
      const themesJson = (await themesRes.json()) as { themes?: Array<{ id: number; role: string }> };
      const mainTheme = (themesJson.themes || []).find((t) => t.role === 'main');

      if (mainTheme?.id) {
        const assetRes = await fetch(
          'https://' + shop + '/admin/api/2025-01/themes/' + mainTheme.id + '/assets.json?asset[key]=templates/index.json',
          { headers: { 'X-Shopify-Access-Token': token } }
        );
        const assetJson = (await assetRes.json()) as { asset?: { value?: string } };
        if (assetJson.asset?.value) {
          const indexTpl = JSON.parse(assetJson.asset.value) as {
            sections?: Record<string, Record<string, unknown>>;
          };
          if (indexTpl.sections) {
            for (const secKey of Object.keys(indexTpl.sections)) {
              const sec = indexTpl.sections[secKey];
              if (sec.type === 'image-banner' || sec.type === 'rich-text') {
                const blocks = (sec.blocks as Record<string, Record<string, unknown>>) || {};
                for (const bKey of Object.keys(blocks)) {
                  const blk = blocks[bKey];
                  const settings = (blk.settings as Record<string, unknown>) || {};
                  if (blk.type === 'heading' && typeof settings.heading === 'string') {
                    settings.heading = heroHeadline;
                  }
                  if (blk.type === 'text' && typeof settings.text === 'string') {
                    settings.text = '<p>' + heroSubheadline.replace(/[<>]/g, '') + '</p>';
                  }
                }
              }
            }
            await fetch('https://' + shop + '/admin/api/2025-01/themes/' + mainTheme.id + '/assets.json', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': token,
              },
              body: JSON.stringify({
                asset: {
                  key: 'templates/index.json',
                  value: JSON.stringify(indexTpl, null, 2),
                },
              }),
            }).catch(() => {});
          }
        }
      }
    } catch {}

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
