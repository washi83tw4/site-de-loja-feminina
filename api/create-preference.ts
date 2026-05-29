export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'Mercado Pago Preference API' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({
      error: 'MERCADOPAGO_ACCESS_TOKEN configuration is missing in Vercel backend environment variables.'
    });
  }

  try {
    const { items, payer, orderId } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Os itens do carrinho são obrigatórios.' });
    }

    // Format items as required by Mercado Pago
    const formattedItems = items.map((item: any) => {
      // Use clean numeric price
      const price = parseFloat(item.unit_price || item.price);
      return {
        id: item.productId || item.id || '',
        title: item.title || item.name,
        quantity: parseInt(item.quantity, 10) || 1,
        unit_price: Math.round(price * 100) / 100, // format to exact cents
        currency_id: 'BRL',
        picture_url: item.imageUrl || undefined
      };
    });

    // Detect environment host dynamically for back redirects (perfect support for local / preview / prod)
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'site-de-loja-feminina.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = host.includes('localhost') ? `http://${host}` : `${proto}://${host}`;

    // Prefer explicit Vercel domain if user requested but maintain dynamic support
    const productionUrl = 'https://site-de-loja-feminina.vercel.app';
    const finalBaseUrl = host.includes('vercel.app') || host.includes('localhost') || host.includes('ais-') 
      ? baseUrl 
      : productionUrl;

    const mpPayload = {
      items: formattedItems,
      payer: payer ? {
        name: payer.name || undefined,
        email: payer.email || undefined,
        phone: payer.phone ? {
          area_code: payer.phone.area_code || '',
          number: payer.phone.number || ''
        } : undefined
      } : undefined,
      external_reference: orderId || '',
      back_urls: {
        success: `${finalBaseUrl}/pagamento/sucesso`,
        failure: `${finalBaseUrl}/pagamento/erro`,
        pending: `${finalBaseUrl}/pagamento/pendente`
      },
      auto_return: 'approved',
      statement_descriptor: 'BARBIEGIRL'
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mpPayload)
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Mercado Pago API failed:', errorText);
      return res.status(mpResponse.status).json({
        error: 'Failed to create preference with Mercado Pago',
        details: errorText
      });
    }

    const mpData = await mpResponse.json();
    return res.status(200).json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    });

  } catch (error: any) {
    console.error('Preference creation route error:', error);
    return res.status(500).json({
      error: 'Ocorreu um erro interno ao criar a preferência de pagamento.',
      message: error.message
    });
  }
}
