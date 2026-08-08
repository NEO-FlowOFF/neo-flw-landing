import test from 'node:test';
import assert from 'node:assert';
import { onRequestGet, onRequestPost } from '../functions/api/meta-webhook.js';

test('Webhook Meta antigo no landing aponta para o provider canônico', async () => {
  const response = await onRequestGet({
    request: new Request(
      'https://neoflowoff.agency/api/meta-webhook?hub.mode=subscribe&hub.verify_token=test-token&hub.challenge=abc123'
    ),
    env: {},
  });

  assert.strictEqual(response.status, 410);
  assert.deepStrictEqual(await response.json(), {
    error: 'meta_webhook_moved_to_provider',
    canonical_url: 'https://whatsapp.neoflowoff.agency/webhook',
  });
});

test('Webhook Meta POST antigo no landing nao processa payload', async () => {
  const response = await onRequestPost({
    request: new Request('https://neoflowoff.agency/api/meta-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': 'sha256=test',
      },
      body: JSON.stringify({ object: 'whatsapp_business_account' }),
    }),
    env: {},
  });

  assert.strictEqual(response.status, 410);
  assert.deepStrictEqual(await response.json(), {
    error: 'meta_webhook_moved_to_provider',
    canonical_url: 'https://whatsapp.neoflowoff.agency/webhook',
  });
});
