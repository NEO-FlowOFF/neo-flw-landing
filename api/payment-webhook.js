import {
  extractChargeData,
  fetchChargeDetails,
  isPaidStatus,
  resolveOrderData,
  sendPurchaseConfirmationEmail,
  verifyPaymentWebhook,
} from "./_lib/payment-confirmation.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const verification = verifyPaymentWebhook(req);
  if (!verification.ok) {
    return res.status(401).json({ error: verification.reason });
  }

  try {
    const webhookCharge = extractChargeData(req.body || {});
    const charge =
      webhookCharge.chargeId && (!webhookCharge.email || !webhookCharge.productName)
        ? await fetchChargeDetails(webhookCharge.chargeId)
        : webhookCharge;
    const order = resolveOrderData({ ...webhookCharge, ...charge });

    if (!isPaidStatus(order.status)) {
      return res.status(202).json({
        success: true,
        ignored: true,
        status: order.status || "UNKNOWN",
      });
    }

    const emailResult = await sendPurchaseConfirmationEmail(order);

    return res.status(200).json({
      success: true,
      verifiedBy: verification.mode,
      emailSent: emailResult.sent,
      skipped: emailResult.skipped || false,
      reason: emailResult.reason || null,
      emailId: emailResult.emailId || null,
      templateUsed: emailResult.templateUsed || false,
      templateId: emailResult.templateId || null,
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process payment webhook.",
    });
  }
}
