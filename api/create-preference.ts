import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    // Parse body safely
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    } else if (!body && req.on) {
      // stream reading fallback
      const buffers: Buffer[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = JSON.parse(Buffer.concat(buffers).toString());
    }

    const { items, payer, external_reference } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing items array" }));
      return;
    }

    // Securely retrieve the Token from environment variable
    const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-8998561393081066-052822-18438df5268019cb403d9aa53c2d96b1-354409374";

    // Map cart items into Mercado Pago Preference items
    const mpItems = items.map((item: any) => {
      const price = Number(item.price || item.unit_price || 0);
      return {
        id: String(item.id || item.productId || ""),
        title: String(item.name || item.title || "Produto"),
        quantity: Number(item.quantity || 1),
        unit_price: price,
        currency_id: "BRL",
        picture_url: item.imageUrl || item.picture_url || undefined,
      };
    });

    const mpPayer: any = {};
    if (payer) {
      mpPayer.email = payer.email;
      if (payer.name) {
        const parts = payer.name.trim().split(/\s+/);
        mpPayer.name = parts[0] || "Cliente";
        mpPayer.surname = parts.slice(1).join(" ") || "Boutique";
      }
      if (payer.phone) {
        const cleanPhone = String(payer.phone).replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          mpPayer.phone = {
            area_code: cleanPhone.slice(0, 2),
            number: cleanPhone.slice(2),
          };
        } else {
          mpPayer.phone = {
            area_code: "11",
            number: cleanPhone || "999999999",
          };
        }
      }
      if (payer.cpf) {
        const cleanCpf = String(payer.cpf).replace(/\D/g, "");
        if (cleanCpf) {
          mpPayer.identification = {
            type: "CPF",
            number: cleanCpf,
          };
        }
      }
    }

    const payload = {
      items: mpItems,
      payer: Object.keys(mpPayer).length > 0 ? mpPayer : undefined,
      back_urls: {
        success: "https://site-de-loja-feminina.vercel.app/pagamento/sucesso",
        failure: "https://site-de-loja-feminina.vercel.app/pagamento/erro",
        pending: "https://site-de-loja-feminina.vercel.app/pagamento/pendente",
      },
      auto_return: "all",
      external_reference: String(external_reference || ""),
      statement_descriptor: "BOUTIQUE",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mercado Pago API error response:", errorText);
      res.writeHead(response.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Failed to create Mercado Pago preference",
        details: errorText,
      }));
      return;
    }

    const data = await response.json();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    }));
  } catch (error: any) {
    console.error("Vercel Function Error handler:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error", message: error.message }));
  }
}
