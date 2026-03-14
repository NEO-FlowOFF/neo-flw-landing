import crypto from "crypto";

const FLOWPAY_API_URL = process.env.FLOWPAY_API_URL || "https://api.flowpay.cash";
const FLOWPAY_API_KEY = process.env.FLOWPAY_API_KEY || "";
const RESEND_API_URL = "https://api.resend.com/emails";
const PAID_STATUSES = new Set([
  "PIX_PAID",
  "PENDING_REVIEW",
  "APPROVED",
  "SETTLED",
  "COMPLETED",
]);

const PRODUCT_CATALOG = {
  "landing-start": { name: "Pacote Start", price: 1500 },
  "landing-profissional": { name: "Pacote Profissional", price: 2500 },
  "landing-premium": { name: "Pacote Premium", price: 4000 },
};

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return undefined;
}

function normalizeEmail(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function asNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getCatalogProduct(productRef) {
  if (!productRef) return undefined;
  return PRODUCT_CATALOG[String(productRef).toLowerCase()];
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function parsePayload(payloadText) {
  try {
    return JSON.parse(payloadText);
  } catch {
    return null;
  }
}

export function isPaidStatus(status) {
  return PAID_STATUSES.has(String(status || "").toUpperCase());
}

export function extractChargeData(payload = {}) {
  const root = payload && typeof payload === "object" ? payload : {};
  const levelOne = firstNonEmpty(root.charge, root.payment, root.data, root) || {};
  const levelTwo =
    firstNonEmpty(levelOne.charge, levelOne.payment, levelOne.data, levelOne) || {};
  const customer =
    firstNonEmpty(levelTwo.customer, levelOne.customer, root.customer) || {};
  const metadata =
    firstNonEmpty(levelTwo.metadata, levelOne.metadata, root.metadata) || {};

  const chargeId = firstNonEmpty(
    levelTwo.charge_id,
    levelTwo.chargeId,
    levelTwo.payment_id,
    levelTwo.paymentId,
    levelTwo.id,
    levelOne.charge_id,
    levelOne.chargeId,
    levelOne.payment_id,
    levelOne.paymentId,
    levelOne.id,
    root.charge_id,
    root.chargeId,
    root.payment_id,
    root.paymentId,
    root.id,
  );

  const status = String(
    firstNonEmpty(
      levelTwo.status,
      levelTwo.payment_status,
      levelTwo.state,
      levelOne.status,
      levelOne.payment_status,
      levelOne.state,
      root.status,
      root.payment_status,
      root.state,
    ) || "",
  ).toUpperCase();

  const productRef = firstNonEmpty(
    levelTwo.product_ref,
    levelTwo.productRef,
    levelOne.product_ref,
    levelOne.productRef,
    root.product_ref,
    root.productRef,
    metadata.product_ref,
  );

  const catalogProduct = getCatalogProduct(productRef);
  const productName = firstNonEmpty(
    levelTwo.product_name,
    levelTwo.productName,
    levelOne.product_name,
    levelOne.productName,
    root.product_name,
    root.productName,
    metadata.product_name,
    metadata.productName,
    catalogProduct?.name,
  );

  const email = normalizeEmail(
    firstNonEmpty(
      levelTwo.customer_email,
      levelTwo.customerEmail,
      levelOne.customer_email,
      levelOne.customerEmail,
      root.customer_email,
      root.customerEmail,
      root.email,
      customer.email,
    ),
  );

  const amountBrl = firstNonEmpty(
    asNumber(levelTwo.amount_brl),
    asNumber(levelTwo.amount),
    asNumber(levelTwo.value),
    asNumber(levelOne.amount_brl),
    asNumber(levelOne.amount),
    asNumber(levelOne.value),
    asNumber(root.amount_brl),
    asNumber(root.amount),
    asNumber(root.value),
    catalogProduct?.price,
  );

  const paidAt = firstNonEmpty(
    levelTwo.paid_at,
    levelTwo.approved_at,
    levelTwo.updated_at,
    levelOne.paid_at,
    levelOne.approved_at,
    levelOne.updated_at,
    root.paid_at,
    root.approved_at,
    root.updated_at,
  );

  return {
    chargeId: chargeId ? String(chargeId) : "",
    status,
    email,
    productRef: productRef ? String(productRef) : "",
    productName: productName ? String(productName) : "",
    amountBrl,
    paidAt: paidAt ? String(paidAt) : "",
  };
}

export async function fetchChargeDetails(chargeId) {
  const response = await fetch(
    `${FLOWPAY_API_URL}/api/charge/${encodeURIComponent(chargeId)}`,
    {
      headers: {
        ...(FLOWPAY_API_KEY ? { Authorization: `Bearer ${FLOWPAY_API_KEY}` } : {}),
      },
    },
  );

  const payloadText = await response.text();
  const payload = parsePayload(payloadText);

  if (!response.ok) {
    const detail = payload?.error || payload?.message || payloadText.slice(0, 200);
    throw new Error(`Charge lookup failed (${response.status}): ${detail}`);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Charge lookup returned invalid JSON payload.");
  }

  return extractChargeData(payload);
}

export function resolveOrderData(charge = {}, fallback = {}) {
  const merged = {
    ...charge,
    email: normalizeEmail(firstNonEmpty(fallback.email, charge.email)),
    productName: firstNonEmpty(fallback.productName, charge.productName),
    amountBrl: firstNonEmpty(asNumber(fallback.amountBrl), charge.amountBrl),
  };

  const catalogProduct = getCatalogProduct(merged.productRef);
  if (!merged.productName && catalogProduct?.name) {
    merged.productName = catalogProduct.name;
  }
  if (!merged.amountBrl && catalogProduct?.price) {
    merged.amountBrl = catalogProduct.price;
  }

  return {
    chargeId: merged.chargeId || "",
    status: merged.status || "",
    email: normalizeEmail(merged.email),
    productRef: merged.productRef || "",
    productName: merged.productName || "sua compra",
    amountBrl: merged.amountBrl,
    paidAt: merged.paidAt || "",
  };
}

function renderPurchaseConfirmationEmail(order) {
  const siteUrl = (process.env.SITE_URL || "https://neoflowoff.agency").replace(/\/$/, "");
  const brandLogoUrl = `${siteUrl}/public/neoflowoff_logo.png`;
  const flowPayLogoUrl = `${siteUrl}/public/flowpay-header-logo.png`;
  const amountText = Number.isFinite(order.amountBrl)
    ? formatCurrency(order.amountBrl)
    : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pagamento confirmado</title>
  </head>
  <body style="margin:0;padding:0;background:#050508;font-family:Arial,sans-serif;color:#f5f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050508;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0c0f16;border:1px solid rgba(255,255,255,0.12);border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px;text-align:center;">
                <img
                  src="${escapeHtml(brandLogoUrl)}"
                  alt="NEO FlowOFF"
                  width="160"
                  style="display:block;margin:0 auto 24px auto;max-width:160px;height:auto;"
                />
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9aa0aa;margin-bottom:12px;">
                  NEO FlowOFF
                </div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#f5f7fb;">
                  Pagamento confirmado
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 8px 32px;">
                <p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#d9dde7;">
                  Recebemos a confirmação do seu pagamento para <strong>${escapeHtml(order.productName)}</strong>.
                </p>
                <p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;color:#d9dde7;">
                  Valor confirmado: <strong>${escapeHtml(amountText)}</strong>
                </p>
                <p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#d9dde7;">
                  Nossa equipe vai iniciar a próxima etapa e entrar em contato pelo fluxo definido na oferta.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 8px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111622;border:1px solid rgba(255,255,255,0.08);border-radius:14px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9aa0aa;">
                        Referência
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#f5f7fb;">
                        ${escapeHtml(order.chargeId || "")}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#9aa0aa;">
                  Se precisar de suporte, responda este email ou fale com
                  <a href="mailto:${escapeHtml(process.env.CONTACT_EMAIL || "nosso time")}" style="color:#dcff00;text-decoration:none;">${escapeHtml(process.env.CONTACT_EMAIL || "nosso time")}</a>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                <img
                  src="${escapeHtml(flowPayLogoUrl)}"
                  alt="FlowPay"
                  width="132"
                  style="display:block;margin:0 auto 14px auto;max-width:132px;height:auto;opacity:0.9;"
                />
                <p style="margin:0 0 6px 0;font-size:12px;line-height:1.6;color:#9aa0aa;">
                  Parceiro e segurança nos pagamentos
                </p>
                <p style="margin:0;font-size:12px;line-height:1.6;">
                  <a href="https://www.flowpay.cash" style="color:#6ee7ff;text-decoration:none;">www.flowpay.cash</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildTemplateVariables(order) {
  return {
    product_name: order.productName,
    amount_brl: Number.isFinite(order.amountBrl) ? formatCurrency(order.amountBrl) : "",
    charge_id: order.chargeId || "",
    contact_email: process.env.CONTACT_EMAIL || "neo@neoprotocol.space",
  };
}

export async function sendPurchaseConfirmationEmail(order) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  const templateId = process.env.RESEND_TEMPLATE_ID || "";

  if (!apiKey) {
    return { sent: false, skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  if (!from) {
    return { sent: false, skipped: true, reason: "RESEND_FROM_EMAIL not configured" };
  }

  if (!order.email) {
    return { sent: false, skipped: true, reason: "Customer email unavailable" };
  }

  const payload = {
    from,
    to: [order.email],
    subject: `Pagamento confirmado: ${order.productName}`,
  };

  if (templateId) {
    payload.template = {
      id: templateId,
      variables: buildTemplateVariables(order),
    };
  } else {
    payload.html = renderPurchaseConfirmationEmail(order);
  }

  console.info("Purchase confirmation email dispatch", {
    chargeId: order.chargeId || null,
    recipient: order.email,
    templateId: templateId || null,
    mode: templateId ? "template" : "html_fallback",
  });

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `purchase-confirmation/${order.chargeId || crypto
        .createHash("sha256")
        .update(`${order.email}:${order.productName}`)
        .digest("hex")}`,
    },
    body: JSON.stringify(payload),
  });

  const payloadText = await response.text();
  const parsedPayload = parsePayload(payloadText);

  if (!response.ok) {
    const detail =
      parsedPayload?.message || parsedPayload?.name || payloadText.slice(0, 200);
    throw new Error(`Resend send failed (${response.status}): ${detail}`);
  }

  return {
    sent: true,
    emailId: parsedPayload?.id || "",
    templateUsed: Boolean(templateId),
    templateId: templateId || null,
  };
}

export function verifyPaymentWebhook(req) {
  const secret =
    process.env.FLOWPAY_SIGNATURE_SECRET || process.env.WOOVI_WEBHOOK_SECRET || "";

  if (!secret) {
    return { ok: true, mode: "disabled" };
  }

  const headers = req.headers || {};
  const authorization = headers.authorization || headers.Authorization || "";
  const directToken = firstNonEmpty(
    headers["x-webhook-secret"],
    headers["x-flowpay-secret"],
    headers["x-api-key"],
    authorization.startsWith("Bearer ") ? authorization.slice(7) : "",
  );

  if (directToken && directToken === secret) {
    return { ok: true, mode: "token" };
  }

  const providedSignature = firstNonEmpty(
    headers["x-flowpay-signature"],
    headers["x-woovi-signature"],
    headers["x-signature"],
    authorization.startsWith("sha256=") ? authorization : "",
  );

  if (!providedSignature) {
    return { ok: false, reason: "Missing webhook signature or token." };
  }

  const normalizedSignature = String(providedSignature).replace(/^sha256=/i, "");
  const bodyText =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  const digest = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");

  if (!timingSafeEqual(digest, normalizedSignature)) {
    return { ok: false, reason: "Invalid webhook signature." };
  }

  return { ok: true, mode: "hmac" };
}
