import {
  getPhoneNumberId,
  graphRequest,
  json,
  readJson,
  requireDemoAuth,
} from '../../../src/server/meta-graph.js';

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function buildMessagePayload(body, to) {
  if (body.template_name || body.template?.name) {
    return {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: body.template_name || body.template.name,
        language: {
          code: body.language_code || body.template?.language?.code || 'pt_BR',
        },
        ...(body.components || body.template?.components
          ? { components: body.components || body.template.components }
          : {}),
      },
    };
  }

  if (body.text) {
    return {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: String(body.text).slice(0, 4096),
      },
    };
  }

  return null;
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

  const to = cleanPhone(body.to || env.WHATSAPP_REVIEW_TEST_RECIPIENT);
  if (!to) {
    return json({ ok: false, error: 'missing_to' }, 400);
  }

  const message = buildMessagePayload(body, to);
  if (!message) {
    return json({ ok: false, error: 'missing_message_payload' }, 400);
  }

  const phoneNumberId = body.phone_number_id || getPhoneNumberId(env);
  const result = await graphRequest(env, `${phoneNumberId}/messages`, {
    method: 'POST',
    body: message,
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
      status: 'sent',
      phone_number_id: phoneNumberId,
      messages: result.data?.messages || [],
    },
    200
  );
}
