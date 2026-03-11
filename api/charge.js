const FLOWPAY_API_URL = process.env.FLOWPAY_API_URL || "https://api.flowpay.cash";
const FLOWPAY_API_KEY = process.env.FLOWPAY_API_KEY || "";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const chargeId = req.query.chargeId;
  if (!chargeId) {
    return res.status(400).json({ error: "chargeId is required" });
  }

  try {
    const response = await fetch(
      `${FLOWPAY_API_URL}/api/charge/${encodeURIComponent(chargeId)}`,
      {
        headers: {
          ...(FLOWPAY_API_KEY ? { Authorization: `Bearer ${FLOWPAY_API_KEY}` } : {}),
        },
      },
    );

    const contentType = response.headers.get("content-type") || "application/json";
    const payload = await response.text();

    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    return res.send(payload);
  } catch (error) {
    console.error("FlowPay charge proxy error:", error);
    return res.status(502).json({ error: "FlowPay gateway unavailable" });
  }
}
