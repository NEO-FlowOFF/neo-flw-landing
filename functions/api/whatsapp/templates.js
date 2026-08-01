import {
  getWabaId,
  graphRequest,
  json,
  readJson,
  requireDemoAuth,
} from '../../../src/server/meta-graph.js';

function templateFields() {
  return [
    'id',
    'name',
    'status',
    'category',
    'language',
    'quality_score',
  ].join(',');
}

export async function onRequestGet({ request, env }) {
  const auth = requireDemoAuth(request, env);
  if (!auth.ok) {
    return auth.response;
  }

  const wabaId = getWabaId(env);
  const result = await graphRequest(env, `${wabaId}/message_templates`, {
    params: { fields: templateFields(), limit: 25 },
  });

  if (!result.ok) {
    return json(
      {
        ok: false,
        error: result.error,
        meta_error: result.meta_error || null,
      },
      result.status
    );
  }

  return json(
    {
      ok: true,
      status: 'listed',
      waba_id: wabaId,
      templates: result.data?.data || [],
    },
    200
  );
}

export async function onRequestPost({ request, env }) {
  const auth = requireDemoAuth(request, env);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJson(request);
  if (!body) {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = body.name || body.template_name;
  const language = body.language || body.language_code;
  const category = body.category;
  const components = body.components;

  if (!name || !language || !category || !Array.isArray(components)) {
    return json({ ok: false, error: 'invalid_template_payload' }, 400);
  }

  const wabaId = getWabaId(env);
  const result = await graphRequest(env, `${wabaId}/message_templates`, {
    method: 'POST',
    body: {
      name,
      language,
      category,
      components,
    },
  });

  if (!result.ok) {
    return json(
      {
        ok: false,
        error: result.error,
        meta_error: result.meta_error || null,
      },
      result.status
    );
  }

  return json(
    {
      ok: true,
      status: 'submitted',
      waba_id: wabaId,
      template: {
        id: result.data?.id || null,
        status: result.data?.status || null,
      },
    },
    202
  );
}
