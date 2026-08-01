import { json } from '../../src/server/meta-graph.js';

const SUPPORTED_WEBHOOK_FIELDS = new Set([
  'account_alerts',
  'business_capability_update',
  'business_status_update',
  'flows',
  'message_template_quality_update',
  'message_template_status_update',
  'messages',
  'phone_number_quality_update',
]);

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function verifyHmacSignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedHash = signatureHeader.substring(7);
  if (!/^[a-f0-9]{64}$/i.test(expectedHash)) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify', 'sign']
  );

  const signatureBytes = new Uint8Array(
    expectedHash.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(rawBody)
  );
}

function getExpectedVerifyToken(env) {
  return (
    env.META_WEBHOOK_VERIFY_TOKEN ||
    env.META_VERIFY_TOKEN ||
    env.WEBHOOK_VERIFY_TOKEN ||
    ''
  );
}

function extractPhoneNumberId(value) {
  return (
    value?.metadata?.phone_number_id ||
    value?.phone_number_id ||
    value?.phone_number?.id ||
    null
  );
}

export function parseWebhookEvents(payload) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const events = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const field = change?.field || 'unknown';
      const value = change?.value || {};
      const baseEvent = {
        field,
        waba_id: entry?.id || value?.waba_id || null,
        phone_number_id: extractPhoneNumberId(value),
      };

      if (field === 'messages') {
        const messages = value.messages || [];
        const statuses = value.statuses || []; // entrega, lido, falhou
        const messageEvents = Array.isArray(messages) ? messages : [];
        const statusEvents = Array.isArray(statuses) ? statuses : [];

        if (messageEvents.length > 0) {
          events.push({ ...baseEvent, event_type: 'messages' });
        }

        if (statusEvents.length > 0) {
          events.push({ ...baseEvent, event_type: 'statuses' });
        }

        if (messageEvents.length === 0 && statusEvents.length === 0) {
          events.push({ ...baseEvent, event_type: 'messages' });
        }

        continue;
      }

      events.push({
        ...baseEvent,
        event_type: SUPPORTED_WEBHOOK_FIELDS.has(field)
          ? field
          : `unsupported:${field}`,
      });
    }
  }

  return events;
}

function logWebhookEvents(events, payload) {
  for (const event of events) {
    console.info(
      JSON.stringify({
        event: 'meta.webhook.received',
        object: payload?.object || null,
        field: event.field,
        event_type: event.event_type,
        waba_id: event.waba_id,
        phone_number_id: event.phone_number_id,
      })
    );
  }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expectedToken = getExpectedVerifyToken(env);

  if (!expectedToken) {
    return json({ error: 'webhook_verify_token_not_configured' }, 503);
  }

  if (mode === 'subscribe' && challenge) {
    if (token === expectedToken) {
      return textResponse(challenge, 200);
    }

    return json({ error: 'verify_token_mismatch' }, 403);
  }

  return json({ error: 'invalid_verification_request' }, 400);
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();
  const appSecret = env.META_APP_SECRET;

  if (appSecret) {
    const signature = request.headers.get('x-hub-signature-256');
    const isValid = await verifyHmacSignature(rawBody, signature, appSecret);
    if (!isValid) {
      return json({ error: 'invalid_signature' }, 401);
    }
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const events = parseWebhookEvents(payload);
  logWebhookEvents(events, payload);

  // Encaminhamento opcional para consumidor soberano por HTTPS.
  const forwardUrl = env.META_WEBHOOK_FORWARD_URL;
  if (forwardUrl) {
    try {
      await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-From': 'neoflowoff-agency-pages',
          ...(request.headers.get('x-hub-signature-256')
            ? {
                'X-Hub-Signature-256': request.headers.get(
                  'x-hub-signature-256'
                ),
              }
            : {}),
        },
        body: rawBody,
      });
    } catch (err) {
      // Falha de repasse silenciada para garantir resposta 200 OK imediata à Meta
    }
  }

  return json({ status: 'ok', received: true, events: events.length }, 200);
}
