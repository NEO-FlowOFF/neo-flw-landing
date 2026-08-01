const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

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

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && challenge) {
    const expectedToken =
      env.META_WEBHOOK_VERIFY_TOKEN || env.META_VERIFY_TOKEN;

    // Se o token de verificação for configurado, valida a correspondência;
    // caso contrário, aprova a verificação se houver o handshake da Meta.
    if (!expectedToken || token === expectedToken) {
      return textResponse(challenge, 200);
    }

    return jsonResponse({ error: 'verify_token_mismatch' }, 403);
  }

  return jsonResponse({ error: 'invalid_verification_request' }, 400);
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();
  const appSecret = env.META_APP_SECRET;

  if (appSecret) {
    const signature = request.headers.get('x-hub-signature-256');
    const isValid = await verifyHmacSignature(rawBody, signature, appSecret);
    if (!isValid) {
      return jsonResponse({ error: 'invalid_signature' }, 401);
    }
  }

  // Encaminhamento opcional para webhook consumidor/ingestor (Railway / Docker Ingress)
  const forwardUrl = env.META_WEBHOOK_FORWARD_URL;
  if (forwardUrl) {
    try {
      await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-From': 'neoflowoff-agency-pages',
        },
        body: rawBody,
      });
    } catch (err) {
      // Falha de repasse silenciada para garantir resposta 200 OK imediata à Meta
    }
  }

  return jsonResponse({ status: 'ok', received: true }, 200);
}
