import test from 'node:test';
import assert from 'node:assert';
import { onRequestPost } from '../functions/api/meta/embedded-signup.js';

test('Embedded Signup no landing encaminha code ao provider soberano', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, init) => {
    calls.push({
      body: JSON.parse(init.body),
      headers: init.headers,
      method: init.method,
      url: String(url),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        status: 'stored',
        connection_id: calls[0].body.connection_id,
        token_reference: '00000000-0000-4000-8000-000000000001',
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };

  try {
    const response = await onRequestPost({
      request: new Request('https://neoflowoff.agency/api/meta/embedded-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'test-authorization-code',
          grantedScopes: 'whatsapp_business_management,whatsapp_business_messaging',
        }),
      }),
      env: {
        META_EMBEDDED_SIGNUP_FORWARD_URL:
          'https://whatsapp.neoflowoff.agency/meta/embedded-signup',
        META_EMBEDDED_SIGNUP_FORWARD_SECRET: 'test-forward-secret',
      },
    });

    assert.strictEqual(response.status, 202);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(
      calls[0].url,
      'https://whatsapp.neoflowoff.agency/meta/embedded-signup'
    );
    assert.strictEqual(calls[0].method, 'POST');
    assert.strictEqual(calls[0].headers.Authorization, 'Bearer test-forward-secret');
    assert.strictEqual(calls[0].body.authorization_code, 'test-authorization-code');
    assert.deepStrictEqual(calls[0].body.granted_scopes, [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ]);
    assert.match(calls[0].body.connection_id, /^[0-9a-f-]{36}$/i);

    const body = await response.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, 'stored');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Embedded Signup falha fechado sem provider configurado', async () => {
  const response = await onRequestPost({
    request: new Request('https://neoflowoff.agency/api/meta/embedded-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test-authorization-code' }),
    }),
    env: {},
  });

  assert.strictEqual(response.status, 503);
  assert.deepStrictEqual(await response.json(), {
    ok: false,
    error: 'embedded_signup_provider_not_configured',
  });
});
