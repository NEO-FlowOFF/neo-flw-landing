import {
  fetchChargeDetails,
  isPaidStatus,
  resolveOrderData,
  sendPurchaseConfirmationEmail,
} from "./_lib/payment-confirmation.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const chargeId = String(req.body?.chargeId || "").trim();
  if (!chargeId) {
    return res.status(400).json({ error: "chargeId is required" });
  }

  try {
    const charge = await fetchChargeDetails(chargeId);
    if (!isPaidStatus(charge.status)) {
      return res.status(409).json({
        success: false,
        status: charge.status,
        message: "Charge is not paid yet.",
      });
    }

    const order = resolveOrderData(charge, {
      email: req.body?.customerEmail,
      productName: req.body?.productName,
      amountBrl: req.body?.amountBrl,
    });

    const emailResult = await sendPurchaseConfirmationEmail(order);

    return res.status(200).json({
      success: true,
      status: order.status,
      emailSent: emailResult.sent,
      skipped: emailResult.skipped || false,
      reason: emailResult.reason || null,
      emailId: emailResult.emailId || null,
      templateUsed: emailResult.templateUsed || false,
      templateId: emailResult.templateId || null,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm payment email.",
    });
  }
}
