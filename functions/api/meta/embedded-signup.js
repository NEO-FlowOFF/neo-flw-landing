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

function parseScopes(value) {
  if (Array.isArray(value)) {
    return value
      .map((scope) => String(scope).trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

async function forwardToProvider(payload, env) {
  const response = await fetch(env.META_EMBEDDED_SIGNUP_FORWARD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.META_EMBEDDED_SIGNUP_FORWARD_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      body: {
        ok: false,
        error: body.error || 'provider_rejected_embedded_signup',
      },
      status: response.status >= 400 && response.status < 500 ? 400 : 502,
    };
  }

  return {
    body,
    status: response.status,
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: JSON_HEADERS,
  });
}

export async function onRequestPost({ request, env }) {
  if (
    !env.META_EMBEDDED_SIGNUP_FORWARD_URL ||
    !env.META_EMBEDDED_SIGNUP_FORWARD_SECRET
  ) {
    return json({ ok: false, error: 'embedded_signup_provider_not_configured' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const authorizationCode = String(body.code || body.authorization_code || '').trim();
  if (!authorizationCode || authorizationCode.length > 4096) {
    return json({ ok: false, error: 'invalid_authorization_code' }, 400);
  }

  const payload = {
    authorization_code: authorizationCode,
    connection_id:
      typeof body.connection_id === 'string' && body.connection_id
        ? body.connection_id
        : crypto.randomUUID(),
    granted_scopes: parseScopes(body.grantedScopes || body.granted_scopes),
    ...(body.phone_number_id ? { phone_number_id: String(body.phone_number_id) } : {}),
    ...(body.waba_id ? { waba_id: String(body.waba_id) } : {}),
  };

  const forwarded = await forwardToProvider(payload, env);
  return json(forwarded.body, forwarded.status);
}
