const FLOWPAY_API_URL = process.env.FLOWPAY_API_URL || "https://api.flowpay.cash";
const FLOWPAY_API_KEY = process.env.FLOWPAY_API_KEY || "";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const response = await fetch(`${FLOWPAY_API_URL}/api/create-charge-landing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLOWPAY_API_KEY ? { Authorization: `Bearer ${FLOWPAY_API_KEY}` } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const contentType = response.headers.get("content-type") || "application/json";
    const payload = await response.text();

    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    return res.send(payload);
  } catch (error) {
    console.error("FlowPay create-charge proxy error:", error);
    return res.status(502).json({ error: "FlowPay gateway unavailable" });
  }
}
