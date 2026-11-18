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
    const tokenJson = (await tokenRes.json()) as { access_token?: string; scope?: string };
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

    if (products.length === 0) {
      sendError('Decoded 0 products from session state. State length: ' + rawState.length);
      return;
    }

    let injectedCount = 0;
    let lastError = '';

    for (const p of products) {
      const desc = String(p.shortDescription || '').replace(/[<>]/g, '');
      const bullets = Array.isArray(p.benefits)
        ? p.benefits.map((b) => '<li>' + String(b).replace(/[<>]/g, '') + '</li>').join('')
        : '';
      const bodyHtml = bullets
        ? '<p>' + desc + '</p><ul>' + bullets + '</ul>'
        : '<p>' + (desc || 'Curated everyday essential.') + '</p>';

      const hasImage = typeof p.imageUrl === 'string' && /^https?:\/\//i.test(p.imageUrl);

      const restRes = await fetch('https://' + shop + '/admin/api/2025-01/products.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': tokenJson.access_token,
        },
        body: JSON.stringify({
          product: {
            title: String(p.name || 'Product'),
            body_html: bodyHtml,
            vendor: storeName,
            product_type: String(p.category || 'Featured'),
            status: 'active',
            variants: [{ price: Number(p.retailPrice || 29.99).toFixed(2) }],
            ...(hasImage ? { images: [{ src: p.imageUrl }] } : {}),
          },
        }),
      });

      if (restRes.ok) {
        injectedCount += 1;
      } else {
        const errText = await restRes.text();
        lastError = 'HTTP ' + restRes.status + ' (scopes: ' + (tokenJson.scope || 'none') + '): ' + errText.slice(0, 180);
      }
    }

    if (injectedCount === 0) {
      sendError('Shopify rejected product upload -> ' + lastError);
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
