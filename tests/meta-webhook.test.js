import test from 'node:test';
import assert from 'node:assert';
import { createHmac } from 'node:crypto';
import {
  onRequestGet,
  onRequestPost,
  parseWebhookEvents,
} from '../functions/api/meta-webhook.js';

function signPayload(payload, secret) {
  return `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
}

test('Meta webhook GET retorna challenge puro quando verify_token confere', async () => {
  const response = await onRequestGet({
    request: new Request(
      'https://neoflowoff.agency/api/meta-webhook?hub.mode=subscribe&hub.verify_token=test-token&hub.challenge=abc123'
    ),
    env: {
      META_WEBHOOK_VERIFY_TOKEN: 'test-token',
    },
  });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(await response.text(), 'abc123');
});

test('Meta webhook POST classifica statuses dentro de messages', async () => {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '26958411313796411',
        changes: [
          {
            field: 'messages',
            value: {
              metadata: {
                phone_number_id: '1076704612201643',
              },
              statuses: [
                {
                  id: 'wamid.test',
                  status: 'sent',
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const events = parseWebhookEvents(payload);
  assert.deepStrictEqual(events, [
    {
      field: 'messages',
      event_type: 'statuses',
      waba_id: '26958411313796411',
      phone_number_id: '1076704612201643',
    },
  ]);
});

test('Meta webhook POST valida assinatura e registra eventos suportados', async () => {
  const secret = 'test-app-secret';
  const rawBody = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '26958411313796411',
        changes: [
          {
            field: 'messages',
            value: {
              metadata: {
                phone_number_id: '1076704612201643',
              },
              messages: [{ id: 'wamid.message' }],
              statuses: [{ id: 'wamid.status', status: 'delivered' }],
            },
          },
          {
            field: 'message_template_status_update',
            value: {
              message_template_id: 'template-id',
            },
          },
        ],
      },
    ],
  });

  const originalInfo = console.info;
  const logs = [];
  console.info = (message) => logs.push(JSON.parse(message));

  try {
    const response = await onRequestPost({
      request: new Request('https://neoflowoff.agency/api/meta-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signPayload(rawBody, secret),
        },
        body: rawBody,
      }),
      env: {
        META_APP_SECRET: secret,
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), {
      status: 'ok',
      received: true,
      events: 3,
    });

    assert.deepStrictEqual(
      logs.map((log) => log.event_type),
      ['messages', 'statuses', 'message_template_status_update']
    );
    assert.ok(
      logs.every((log) => log.waba_id === '26958411313796411'),
      'Log deve conter waba_id sem token ou payload sensivel'
    );
  } finally {
    console.info = originalInfo;
  }
});
