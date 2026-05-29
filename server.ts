import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-8998561393081066-052822-18438df5268019cb403d9aa53c2d96b1-354409374";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // API Route - Mercado Pago preference creation
  app.post("/api/mercado-pago/create-preference", async (req, res) => {
    try {
      const { items, payer, external_reference } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing items array" });
      }

      // Automatically construct redirect URLs based on host
      const host = req.get("host") || "localhost:3000";
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const appBaseUrl = `${protocol}://${host}`;

      const mpItems = items.map((item: any) => {
        // Calculate appropriate unit price
        const price = Number(item.price || item.unit_price || 0);
        return {
          id: String(item.productId || item.id || ""),
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
          success: `${appBaseUrl}/?payment=success&orderId=${external_reference}`,
          failure: `${appBaseUrl}/?payment=failure&orderId=${external_reference}`,
          pending: `${appBaseUrl}/?payment=pending&external_reference`,
        },
        auto_return: "all",
        external_reference: String(external_reference || ""),
        statement_descriptor: "BOUTIQUE ATTIRE",
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
        console.error("Mercado Pago Preference API error:", errorText);
        return res.status(response.status).json({
          error: "Failed to create Mercado Pago preference",
          details: errorText,
        });
      }

      const data = await response.json();
      return res.json({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
      });
    } catch (e: any) {
      console.error("Endpoint error creating MP preference:", e);
      return res.status(500).json({ error: "Internal Server Error", message: e.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Vite integration as middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite loading in middlewareMode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
