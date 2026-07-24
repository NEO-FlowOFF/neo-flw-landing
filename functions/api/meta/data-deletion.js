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

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function decodeUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

async function parseSignedRequest(signedRequest, appSecret) {
  const parts = signedRequest.split('.');
  if (parts.length !== 2) {
    return { error: 'invalid_signed_request' };
  }

  const [encodedSignature, encodedPayload] = parts;
  const payloadBytes = base64UrlDecode(encodedPayload);
  const payloadText = decodeUtf8(payloadBytes);
  let payload;

  try {
    payload = JSON.parse(payloadText);
  } catch {
    return { error: 'invalid_signed_request_payload' };
  }

  if (payload.algorithm && String(payload.algorithm).toUpperCase() !== 'HMAC-SHA256') {
    return { error: 'unsupported_signed_request_algorithm' };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecode(encodedSignature),
    encoder.encode(encodedPayload)
  );

  if (!isValid) {
    return { error: 'invalid_signed_request_signature' };
  }

  return { payload };
}

async function extractSignedRequest(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    return typeof body.signed_request === 'string' ? body.signed_request.trim() : '';
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const value = form.get('signed_request');
    return typeof value === 'string' ? value.trim() : '';
  }

  const raw = await request.text();
  const params = new URLSearchParams(raw);
  return (params.get('signed_request') || '').trim();
}

async function forwardDeletionRequest({ env, payload, confirmationCode, statusUrl }) {
  const response = await fetch(env.META_DATA_DELETION_FORWARD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.META_DATA_DELETION_FORWARD_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'meta.data_deletion_callback',
      confirmation_code: confirmationCode,
      status_url: statusUrl,
      meta_user_id: payload.user_id || null,
      issued_at: payload.issued_at || null,
    }),
  });

  if (!response.ok) {
    return { error: 'sovereign_backend_rejected', status: response.status };
  }

  return { ok: true };
}

async function queueDeletionRequest({ env, payload, confirmationCode, statusUrl }) {
  const kv = env.META_DELETION_REQUESTS;
  if (!kv?.put) {
    return { error: 'secure_deletion_handler_not_configured' };
  }

  await kv.put(
    `meta:data-deletion:${confirmationCode}`,
    JSON.stringify({
      source: 'meta.data_deletion_callback',
      status: 'queued_for_processing',
      confirmation_code: confirmationCode,
      status_url: statusUrl,
      meta_user_id: payload.user_id || null,
      issued_at: payload.issued_at || null,
      received_at: new Date().toISOString(),
    }),
    {
      expirationTtl: 60 * 60 * 24 * 90,
      metadata: {
        source: 'meta.data_deletion_callback',
      },
    }
  );

  return { ok: true };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: JSON_HEADERS,
  });
}

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;
  return json({
    ok: true,
    endpoint: `${origin}/api/meta/data-deletion`,
    method: 'POST',
    instructions_url: `${origin}/excluir-dados`,
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.META_APP_SECRET) {
    return json({ ok: false, error: 'meta_app_secret_not_configured' }, 503);
  }

  const signedRequest = await extractSignedRequest(request);
  if (!signedRequest) {
    return json({ ok: false, error: 'missing_signed_request' }, 400);
  }

  const parsed = await parseSignedRequest(signedRequest, env.META_APP_SECRET);
  if (parsed.error) {
    return json({ ok: false, error: parsed.error }, 401);
  }

  const confirmationCode = `meta-del-${crypto.randomUUID()}`;
  const statusUrl = `${new URL(request.url).origin}/excluir-dados?confirmation_code=${encodeURIComponent(confirmationCode)}`;

  if (env.META_DATA_DELETION_FORWARD_URL && env.META_DATA_DELETION_FORWARD_SECRET) {
    const forwarded = await forwardDeletionRequest({
      env,
      payload: parsed.payload,
      confirmationCode,
      statusUrl,
    });

    if (forwarded.error) {
      return json({ ok: false, error: forwarded.error }, 502);
    }

    return json({ url: statusUrl, confirmation_code: confirmationCode });
  }

  const queued = await queueDeletionRequest({
    env,
    payload: parsed.payload,
    confirmationCode,
    statusUrl,
  });

  if (queued.error) {
    return json({ ok: false, error: queued.error }, 503);
  }

  return json({ url: statusUrl, confirmation_code: confirmationCode });
}
