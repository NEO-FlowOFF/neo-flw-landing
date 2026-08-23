/**
 * POST /api/validate-key
 *
 * Validates a WABA access gate key server-side.
 * Keys are checked against HMAC-SHA256 signatures using WABA_GATE_SECRET.
 *
 * Key format: flw_<hex_payload>_<hex_signature>
 * The signature covers the payload using the server secret.
 *
 * If WABA_GATE_SECRET is not set, the endpoint rejects all keys
 * (fail closed).
 *
 * Env vars:
 *   WABA_GATE_SECRET — shared secret for HMAC validation
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

/** Convert hex string to Uint8Array */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Convert ArrayBuffer to hex string */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify a key of the format: flw_<payload>_<signature>
 * where signature = HMAC-SHA256(payload, secret) truncated to 32 hex chars.
 */
async function verifyKey(key, secret) {
  if (!key || !secret) return false;

  const clean = String(key).trim();
  // Must match: flw_<payload>_<signature>
  const match = clean.match(/^flw_([a-f0-9]{8,32})_([a-f0-9]{32,64})$/);
  if (!match) return false;

  const [, payload, providedSig] = match;

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(payload)
  );

  const expectedSig = bufferToHex(signatureBuffer).slice(0, providedSig.length);

  // Constant-time comparison
  if (expectedSig.length !== providedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.WABA_GATE_SECRET) {
    // Fail closed: no secret configured = no keys are valid
    return json({ valid: false, error: 'gate_not_configured' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ valid: false, error: 'invalid_body' }, 400);
  }

  const key = typeof body.key === 'string' ? body.key.trim() : '';

  if (!key || key.length > 128) {
    return json({ valid: false, error: 'invalid_key_format' }, 400);
  }

  const valid = await verifyKey(key, env.WABA_GATE_SECRET);

  return json({ valid });
}

// Block other methods
export async function onRequestGet() {
  return json({ error: 'method_not_allowed' }, 405);
}
