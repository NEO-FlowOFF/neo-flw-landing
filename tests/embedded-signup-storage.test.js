import test from 'node:test';
import assert from 'node:assert';
import { webcrypto } from 'node:crypto';
import { onRequestPost } from '../functions/api/meta/embedded-signup.js';

function base64UrlToBytes(value) {
  return Buffer.from(value, 'base64url');
}

async function decryptEnvelope(envelope, secret) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const keyHash = await webcrypto.subtle.digest('SHA-256', encoder.encode(secret));
  const key = await webcrypto.subtle.importKey('raw', keyHash, { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64UrlToBytes(envelope.iv) },
    key,
    base64UrlToBytes(envelope.ciphertext)
  );

  return JSON.parse(decoder.decode(plaintext));
}

test('Embedded Signup fallback criptografa token sem persistir authorization_code', async () => {
  const originalFetch = globalThis.fetch;
  const storedWrites = [];
  const encryptionKey = 'test-token-encryption-key';

  globalThis.fetch = async (url) => {
    assert.ok(String(url).includes('/v25.0/oauth/access_token'), 'Deve trocar o code pela Graph API');

    return new Response(
      JSON.stringify({
        access_token: 'test-customer-access-token',
        token_type: 'bearer',
        expires_in: 5183944
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
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
          requestedScopes: 'whatsapp_business_management,whatsapp_business_messaging'
        })
      }),
      env: {
        META_APP_SECRET: 'test-app-secret',
        META_TOKEN_ENCRYPTION_KEY: encryptionKey,
        META_TOKEN_ENCRYPTION_KEY_VERSION: 'test-v1',
        META_CONNECTIONS: {
          async put(key, value, options) {
            storedWrites.push({ key, value, options });
          }
        }
      }
    });

    assert.strictEqual(response.status, 202);

    const body = await response.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, 'stored');
    assert.strictEqual(storedWrites.length, 1);

    const envelope = JSON.parse(storedWrites[0].value);
    assert.strictEqual(envelope.alg, 'AES-GCM');
    assert.strictEqual(envelope.enc, 'A256GCM');
    assert.strictEqual(envelope.key_version, 'test-v1');
    assert.strictEqual(storedWrites[0].options.metadata.key_version, 'test-v1');

    const decrypted = await decryptEnvelope(envelope, encryptionKey);
    const serializedPayload = JSON.stringify(decrypted);

    assert.strictEqual(decrypted.event, 'meta.embedded_signup.token_stored');
    assert.strictEqual(decrypted.token_payload.access_token, 'test-customer-access-token');
    assert.ok(!Object.hasOwn(decrypted, 'code'), 'Nao deve persistir campo code');
    assert.ok(!serializedPayload.includes('test-authorization-code'), 'Nao deve persistir authorization_code no blob criptografado');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
