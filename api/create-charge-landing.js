const FLOWPAY_API_URL = process.env.FLOWPAY_API_URL || "https://api.flowpay.cash";
const FLOWPAY_API_KEY = process.env.FLOWPAY_API_KEY || "";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    const upstreamPayload = {
      valor: Number(body.amount_brl),
      moeda: "BRL",
      id_transacao: String(body.charge_id || `${body.product_ref || "landing"}-${Date.now()}`),
      product_id: String(body.product_ref || "landing-manual"),
      customer_email: body.customer_email || "",
      customer_name: body.customer_name || "",
      wallet: "",
    };

    const response = await fetch(`${FLOWPAY_API_URL}/api/create-charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLOWPAY_API_KEY ? { "x-api-key": FLOWPAY_API_KEY } : {}),
      },
      body: JSON.stringify(upstreamPayload),
    });

    const payloadText = await response.text();
    let payload;

    try {
      payload = JSON.parse(payloadText);
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "application/json";
      res.status(response.status);
      res.setHeader("Content-Type", contentType);
      return res.send(payloadText);
    }

    const normalized = {
      success: Boolean(payload?.success),
      charge: {
        charge_id:
          payload?.pix_data?.correlation_id ||
          payload?.id_transacao ||
          upstreamPayload.id_transacao,
        qr_code: payload?.pix_data?.qr_code || null,
        pix_copy_paste: payload?.pix_data?.br_code || null,
        status: payload?.pix_data?.status || "CREATED",
        expires_at: payload?.pix_data?.expires_at || null,
        amount_brl: payload?.pix_data?.value || upstreamPayload.valor,
      },
      upstream: payload,
    };

    return res.status(200).json(normalized);
  } catch (error) {
    console.error("FlowPay create-charge proxy error:", error);
    return res.status(502).json({ error: "FlowPay gateway unavailable" });
  }
}
