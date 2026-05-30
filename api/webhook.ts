import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
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
      const buffers: Buffer[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = JSON.parse(Buffer.concat(buffers).toString());
    }

    console.log("[Webhook] Received webhook payload:", JSON.stringify(body));

    // Support query strings as fallback
    let paymentId = "";
    if (body) {
      if (body.type === "payment" && body.data && body.data.id) {
        paymentId = String(body.data.id);
      } else if (body.topic === "payment" && body.id) {
        paymentId = String(body.id);
      } else if (body.resource) {
        const parts = body.resource.split("/");
        paymentId = parts[parts.length - 1];
      }
    }

    // fallback query parameters
    if (!paymentId && req.query && req.query.id) {
      paymentId = String(req.query.id);
    }

    if (!paymentId) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true, message: "No payment ID found in webhook payload" }));
      return;
    }

    console.log(`[Webhook] Fetching details from Mercado Pago for payment: ${paymentId}`);

    const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-8998561393081066-052822-18438df5268019cb403d9aa53c2d96b1-354409374";

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      const errTxt = await mpResponse.text();
      console.error(`[Webhook] Error fetching payment ${paymentId} details:`, errTxt);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch payment details from Mercado Pago", details: errTxt }));
      return;
    }

    const paymentData = await mpResponse.json();
    console.log("[Webhook] Payment info received from Mercado Pago:", JSON.stringify(paymentData));

    const status = paymentData.status; // 'approved', 'pending', etc.
    const orderId = paymentData.external_reference;

    console.log(`[Webhook] Status is: "${status}". OrderID (external_reference) is: "${orderId}"`);

    if (orderId && status === "approved") {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ginrupwmrdoilkybsgsz.supabase.co';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_S3snboPa4Q0v1xVbd4FRtg_EtaORtBc';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const queryId = isNaN(Number(orderId)) ? orderId : Number(orderId);

      // Fetch the current order
      const { data: dbOrder, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("id", queryId)
        .single();

      if (orderErr) {
        console.error(`[Webhook] Failed to retrieve order ${queryId}:`, orderErr);
      } else if (dbOrder) {
        const alreadyBaixado = dbOrder.estoque_baixado === true;

        if (!alreadyBaixado) {
          console.log(`[Webhook] Reducing stock and updating order ${queryId} to 'Pago'...`);
          const items = typeof dbOrder.items === "string" ? JSON.parse(dbOrder.items) : (dbOrder.items || []);

          for (const item of items) {
            const productId = item.productId;
            const size = item.selectedSize;
            const qty = item.quantity || 1;

            const { data: dbProduct } = await supabase
              .from("produtos")
              .select("*")
              .eq("id", productId)
              .single();

            if (dbProduct) {
              const currentTotalStock = dbProduct.estoque || 0;
              const newTotalStock = Math.max(0, currentTotalStock - qty);

              let tamanhosEstoque = dbProduct.tamanhos_estoque;
              if (typeof tamanhosEstoque === "string") {
                try {
                  tamanhosEstoque = JSON.parse(tamanhosEstoque);
                } catch {
                  tamanhosEstoque = {};
                }
              }
              tamanhosEstoque = tamanhosEstoque || {};

              if (size && size in tamanhosEstoque) {
                tamanhosEstoque[size] = Math.max(0, (tamanhosEstoque[size] || 0) - qty);
              }

              // Update product stock balance
              const { error: updateProdErr } = await supabase
                .from("produtos")
                .update({
                  estoque: newTotalStock,
                  tamanhos_estoque: tamanhosEstoque,
                })
                .eq("id", productId);

              if (updateProdErr) {
                console.error(`[Webhook] Failed to update product ${productId} stock:`, updateProdErr);
              } else {
                console.log(`[Webhook] stock updated successfully for product ${productId}`);
              }
            }
          }

          // Complete the order by updating status and estoque_baixado
          const { error: updateOrderErr } = await supabase
            .from("orders")
            .update({
              status: "Pago",
              estoque_baixado: true,
            })
            .eq("id", queryId);

          if (updateOrderErr) {
            console.error(`[Webhook] Failed to set order status to Pago:`, updateOrderErr);
          } else {
            console.log(`[Webhook] Order ${queryId} updated to 'Pago' and marked as estoque_baixado.`);
          }
        } else {
          // Stock already reduced, just check if status is up to date
          if (dbOrder.status !== "Pago") {
            await supabase
              .from("orders")
              .update({ status: "Pago" })
              .eq("id", queryId);
            console.log(`[Webhook] Status corrected to 'Pago' for pre-reduced order ${queryId}.`);
          } else {
            console.log(`[Webhook] Order ${queryId} already fully complete.`);
          }
        }
      } else {
        console.warn(`[Webhook] Order with id ${queryId} not found.`);
      }
    } else {
      console.log(`[Webhook] No action taken. OrderID: ${orderId}, Status: ${status}`);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, paymentId, orderId, status }));
  } catch (error: any) {
    console.error("[Webhook] Internal failure handler:", error);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Failure", message: error.message }));
  }
}
