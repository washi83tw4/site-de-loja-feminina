import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/create-preference')) {
              // CORS Headers
              res.setHeader('Access-Control-Allow-Credentials', 'true');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
              res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
              }

              if (req.method === 'GET') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok', service: 'Dev Mercado Pago Preference API' }));
                return;
              }

              if (req.method === 'POST') {
                let bodyStr = '';
                req.on('data', chunk => {
                  bodyStr += chunk;
                });
                req.on('end', async () => {
                  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
                  if (!token) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: 'MERCADOPAGO_ACCESS_TOKEN is missing in the local environment.'
                    }));
                    return;
                  }

                  try {
                    const parsedBody = JSON.parse(bodyStr || '{}');
                    const { items, payer, orderId } = parsedBody;

                    const formattedItems = (items || []).map((item: any) => {
                      const price = parseFloat(item.unit_price || item.price);
                      return {
                        id: item.productId || item.id || '',
                        title: item.title || item.name,
                        quantity: parseInt(item.quantity, 10) || 1,
                        unit_price: Math.round(price * 100) / 100,
                        currency_id: 'BRL',
                        picture_url: item.imageUrl || undefined
                      };
                    });

                    // Detect protocol and host
                    const host = req.headers.host || 'localhost:3000';
                    const finalBaseUrl = host.includes('localhost') ? `http://${host}` : `https://${host}`;

                    const mpPayload = {
                      items: formattedItems,
                      payer: payer ? {
                        name: payer.name || undefined,
                        email: payer.email || undefined,
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
                      res.statusCode = mpResponse.status;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: 'Mercado Pago error in local development', details: errorText }));
                      return;
                    }

                    const mpData = await mpResponse.json();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      id: mpData.id,
                      init_point: mpData.init_point,
                      sandbox_init_point: mpData.sandbox_init_point
                    }));
                  } catch (err: any) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Local preference creation fail', message: err.message }));
                  }
                });
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
