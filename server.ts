import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware
  app.use(express.json());

  // API Route for creating Mercado Pago payment preference
  app.post("/api/create-preference", async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({
        error: 'MERCADOPAGO_ACCESS_TOKEN is missing in the backend environment. Please set it via settings or env.'
      });
    }

    try {
      const { items, payer, orderId } = req.body || {};

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Os itens do carrinho são obrigatórios.' });
      }

      // Format items as required by Mercado Pago
      const formattedItems = items.map((item: any) => {
        const price = parseFloat(item.price || item.unit_price);
        return {
          id: item.productId || item.id || '',
          title: item.title || item.name,
          quantity: parseInt(item.quantity, 10) || 1,
          unit_price: Math.round(price * 100) / 100, // precise rounding to two decimals
          currency_id: 'BRL',
          picture_url: item.imageUrl || undefined
        };
      });

      // Detect host and protocol dynamically from incoming headers
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'site-de-loja-feminina.vercel.app';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const baseUrl = host.includes('localhost') ? `http://${host}` : `${proto}://${host}`;

      // In case the request host maps to a Vercel domain or similar
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
        console.error('Mercado Pago API failed with error:', errorText);
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
      console.error('Preference router exception:', error);
      return res.status(500).json({
        error: 'Ocorreu um erro interno ao processar a preferência de pagamento.',
        message: error.message
      });
    }
  });

  // Handle local GET probes
  app.get("/api/create-preference", (req, res) => {
    res.json({ status: "ok", service: "Mercado Pago Fullstack Provider" });
  });

  // Base checking route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve Vite assets in development or build files in production mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running globally on port ${PORT}`);
  });
}

startServer();
