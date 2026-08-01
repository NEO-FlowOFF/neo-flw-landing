export const GRAPH_API_VERSION = 'v25.0';
export const META_APP_ID = '1500002841696407';
export const DEFAULT_WABA_ID = '26958411313796411';
export const DEFAULT_PHONE_NUMBER_ID = '1076704612201643';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export function getBearerToken(request) {
  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function requireDemoAuth(request, env) {
  const expectedToken =
    env.META_REVIEW_DEMO_SECRET ||
    env.META_WEBHOOK_FORWARD_SECRET ||
    env.WEBHOOK_FORWARD_SECRET ||
    '';

  if (!expectedToken) {
    return {
      ok: false,
      response: json({ ok: false, error: 'demo_auth_not_configured' }, 503),
    };
  }

  if (getBearerToken(request) !== expectedToken) {
    return {
      ok: false,
      response: json({ ok: false, error: 'unauthorized' }, 401),
    };
  }

  return { ok: true };
}

export function getSystemUserToken(env) {
  return (
    env.META_SYSTEM_USER_TOKEN ||
    env.WHATSAPP_SYSTEM_USER_TOKEN ||
    env.CAPI_SYSTEM_USER_TOKEN ||
    env.ENGINE_ONE_SYSTEM_USER_TOKEN ||
    env.WHATSAPP_ACCESS_TOKEN ||
    env.META_API_TOKEN ||
    ''
  );
}

export function getWabaId(env) {
  return (
    env.WHATSAPP_BUSINESS_ACCOUNT_ID || env.META_WABA_ID || DEFAULT_WABA_ID
  );
}

export function getPhoneNumberId(env) {
  return (
    env.WHATSAPP_PHONE_NUMBER_ID ||
    env.META_PHONE_NUMBER_ID ||
    DEFAULT_PHONE_NUMBER_ID
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function graphUrl(path, params = {}) {
  const normalizedPath = String(path).replace(/^\/+/, '');
  const url = new URL(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${normalizedPath}`
  );

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export async function graphRequest(env, path, options = {}) {
  const token = getSystemUserToken(env);
  if (!token) {
    return {
      ok: false,
      status: 503,
      error: 'system_user_token_not_configured',
    };
  }

  const url = graphUrl(path, options.params);
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: 'meta_graph_request_failed',
      meta_error: sanitizeMetaError(payload.error),
    };
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
  };
}

export function sanitizeMetaError(error) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  return {
    message: error.message || null,
    type: error.type || null,
    code: error.code || null,
    error_subcode: error.error_subcode || null,
    fbtrace_id: error.fbtrace_id || null,
  };
}

export async function getWabaPhoneNumbers(env, wabaId = getWabaId(env)) {
  const fields = [
    'id',
    'display_phone_number',
    'verified_name',
    'quality_rating',
    'messaging_limit_tier',
    'code_verification_status',
  ].join(',');

  const firstAttempt = await graphRequest(env, `${wabaId}/phone_numbers`, {
    params: { fields },
  });

  if (firstAttempt.ok || firstAttempt.status !== 404) {
    return firstAttempt;
  }

  console.warn(
    JSON.stringify({
      event: 'meta.waba.phone_numbers_404',
      waba_id: wabaId,
      status: firstAttempt.status,
      meta_error_code: firstAttempt.meta_error?.code || null,
      meta_error_subcode: firstAttempt.meta_error?.error_subcode || null,
    })
  );

  const retryAttempt = await graphRequest(env, `${wabaId}/phone_numbers`, {
    params: { fields },
  });

  if (retryAttempt.ok || retryAttempt.status !== 404) {
    return retryAttempt;
  }

  const diagnostic = await graphRequest(env, wabaId, {
    params: { fields: 'id,name,message_template_namespace' },
  });

  return {
    ok: false,
    status: 404,
    error: 'waba_access_not_confirmed',
    meta_error: retryAttempt.meta_error,
    diagnostic: diagnostic.ok
      ? diagnostic.data
      : {
          error: diagnostic.error,
          meta_error: diagnostic.meta_error || null,
        },
  };
}

export async function getWabaDetails(env, wabaId = getWabaId(env)) {
  return graphRequest(env, wabaId, {
    params: { fields: 'id,name,message_template_namespace' },
  });
}

export async function checkAppAssociation(
  env,
  wabaId = getWabaId(env),
  appId = META_APP_ID
) {
  const response = await graphRequest(env, `${wabaId}/subscribed_apps`, {
    params: { fields: 'id,name' },
  });

  if (!response.ok) {
    return response;
  }

  const apps = Array.isArray(response.data?.data) ? response.data.data : [];
  return {
    ok: true,
    status: 200,
    data: {
      app_id: appId,
      associated: apps.some((app) => String(app.id) === String(appId)),
      subscribed_apps_count: apps.length,
    },
  };
}
