const GRAPH_API_VERSION = 'v25.0';
const PUBLIC_META_APP_ID = '1500002841696407';

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

function base64Url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function encryptJson(value, secret) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  const key = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(value)));

  return {
    alg: 'AES-GCM',
    enc: 'A256GCM',
    iv: base64Url(iv),
    ciphertext: base64Url(ciphertext),
  };
}

async function exchangeCode({ code, env, request }) {
  const appId = env.META_APP_ID || PUBLIC_META_APP_ID;
  const appSecret = env.META_APP_SECRET;
  const graphVersion = env.META_GRAPH_API_VERSION || GRAPH_API_VERSION;
  const redirectUri = env.META_OAUTH_REDIRECT_URI || `${new URL(request.url).origin}/conectar-whatsapp`;

  if (!appSecret) {
    return { error: 'meta_app_secret_not_configured' };
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      error: 'meta_code_exchange_failed',
      status: response.status,
      meta_error_code: payload?.error?.code || null,
    };
  }

  return { tokenPayload: payload };
}

async function forwardToSovereignBackend({ body, env }) {
  const response = await fetch(env.META_EMBEDDED_SIGNUP_FORWARD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.META_EMBEDDED_SIGNUP_FORWARD_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return { error: 'sovereign_backend_rejected', status: response.status };
  }

  return { ok: true };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: JSON_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code || code.length > 4096) {
    return json({ ok: false, error: 'invalid_authorization_code' }, 400);
  }

  const connectionId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const normalized = {
    connection_id: connectionId,
    event: 'meta.embedded_signup.code_received',
    code,
    granted_scopes: typeof body.grantedScopes === 'string' ? body.grantedScopes : '',
    requested_scopes: typeof body.requestedScopes === 'string' ? body.requestedScopes : '',
    received_at: receivedAt,
    source: 'neo-flw-landing',
  };

  if (env.META_EMBEDDED_SIGNUP_FORWARD_URL && env.META_EMBEDDED_SIGNUP_FORWARD_SECRET) {
    const forwarded = await forwardToSovereignBackend({ body: normalized, env });
    if (forwarded.error) {
      return json({ ok: false, error: forwarded.error }, 502);
    }

    return json({ ok: true, connection_id: connectionId, status: 'forwarded' }, 202);
  }

  const kv = env.META_CONNECTIONS;
  if (!kv?.put || !env.META_TOKEN_ENCRYPTION_KEY) {
    return json({ ok: false, error: 'secure_storage_not_configured' }, 503);
  }

  const exchange = await exchangeCode({ code, env, request });
  if (exchange.error) {
    return json({ ok: false, error: exchange.error, meta_error_code: exchange.meta_error_code || null }, 502);
  }

  const encrypted = await encryptJson(
    {
      ...normalized,
      token_payload: exchange.tokenPayload,
    },
    env.META_TOKEN_ENCRYPTION_KEY
  );

  await kv.put(`meta:embedded-signup:${connectionId}`, JSON.stringify(encrypted), {
    expirationTtl: 60 * 60 * 24 * 30,
    metadata: {
      source: 'neo-flw-landing',
      received_at: receivedAt,
    },
  });

  return json({ ok: true, connection_id: connectionId, status: 'stored' }, 202);
}
