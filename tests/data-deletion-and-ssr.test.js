import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { onRequestGet, onRequestPost } from '../functions/api/meta/data-deletion.js';

// Função auxiliar para codificar e assinar o payload como o Meta faz
function generateSignedRequest(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(encodedPayload);
  const encodedSignature = hmac.digest('base64url');
  return `${encodedSignature}.${encodedPayload}`;
}

test('1. GET health check retorna status ok', async () => {
  const context = {
    request: new Request('https://neoflowoff.agency/api/meta/data-deletion'),
    env: {}
  };
  const response = await onRequestGet(context);
  assert.strictEqual(response.status, 200);
  
  const data = await response.json();
  assert.strictEqual(data.status, 'ok');
  
  // Nenhuma referência à URL antiga
  const bodyString = JSON.stringify(data);
  assert.ok(!bodyString.includes('data-deletion'));
});

test('2. POST sem signed_request retorna HTTP 400', async () => {
  const context = {
    request: new Request('https://neoflowoff.agency/api/meta/data-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }),
    env: { META_APP_SECRET: 'super-secret-key' }
  };
  const response = await onRequestPost(context);
  assert.strictEqual(response.status, 400);
  
  const data = await response.json();
  assert.strictEqual(data.ok, false);
  assert.strictEqual(data.error, 'missing_signed_request');
});

test('3. POST com assinatura inválida retorna HTTP 400', async () => {
  const context = {
    request: new Request('https://neoflowoff.agency/api/meta/data-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signed_request: 'invalidSignature.invalidPayload' })
    }),
    env: { META_APP_SECRET: 'super-secret-key' }
  };
  const response = await onRequestPost(context);
  assert.strictEqual(response.status, 400);
  
  const data = await response.json();
  assert.strictEqual(data.ok, false);
  assert.ok(data.error, 'Deve retornar um código de erro para signed_request inválido');
});

test('4 & 5. POST com assinatura válida retorna url com /excluir-dados e confirmation_code', async () => {
  const secret = 'test-app-secret-123';
  const payload = {
    user_id: 'waba-user-999',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000)
  };
  
  const signedRequest = generateSignedRequest(payload, secret);
  const queuedRequests = [];
  
  const context = {
    request: new Request('https://neoflowoff.agency/api/meta/data-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signed_request: signedRequest })
    }),
    env: {
      META_APP_SECRET: secret,
      META_DELETION_REQUESTS: {
        async put(key, value, options) {
          queuedRequests.push({ key, value, options });
        }
      }
    }
  };
  
  const response = await onRequestPost(context);
  assert.strictEqual(response.status, 200);
  
  const data = await response.json();
  
  // Verifica o formato do retorno exato
  assert.ok(data.url, 'Deve conter a chave "url"');
  assert.ok(data.confirmation_code, 'Deve conter a chave "confirmation_code"');
  
  // Valida que a URL utiliza o novo caminho /excluir-dados e inclui o confirmation_code
  assert.ok(data.url.includes('https://neoflowoff.agency/excluir-dados'), 'A URL deve ser para a página pública /excluir-dados');
  assert.ok(data.url.includes(`code=${data.confirmation_code}`), 'A URL deve conter o confirmation_code como parâmetro de code');
  
  // Garante que não há propriedades residuais não especificadas na resposta exata de sucesso
  const keys = Object.keys(data).sort();
  assert.deepStrictEqual(keys, ['confirmation_code', 'url']);
  assert.strictEqual(queuedRequests.length, 1);
  assert.ok(queuedRequests[0].key.includes(data.confirmation_code));
});

test('6. HTML compilado de /conectar-whatsapp/ contém os metadados e textos SSR exigidos', () => {
  const htmlPath = path.resolve('dist/conectar-whatsapp/index.html');
  
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Arquivo de build não encontrado em: ${htmlPath}. Execute o build ('pnpm run build') antes de rodar os testes!`);
  }
  
  const html = fs.readFileSync(htmlPath, 'utf8');
  const normalizedHtml = html.toLowerCase();
  
  // Asserções para conteúdo SSR
  assert.ok(html.includes('NEØFLW ENGINE:one'), 'O HTML deve conter "NEØFLW ENGINE:one"');
  assert.ok(html.includes('1500002841696407'), 'O HTML deve conter "1500002841696407"');
  assert.ok(html.includes('Tech Provider'), 'O HTML deve conter "Tech Provider"');
  assert.ok(html.includes('excluir-dados'), 'O HTML deve conter "excluir-dados"');
  assert.ok(html.includes('Meta Business Messaging'), 'O HTML deve conter "Meta Business Messaging"');
  assert.ok(html.includes('Graph API v25.0'), 'O HTML deve conter "Graph API v25.0"');
  assert.ok(html.includes('data-spinner-host'), 'O HTML deve conter o host do spinner de conexão');
  assert.ok(html.includes('stroke-dasharray'), 'O bundle deve incluir o spinner SVG animado');
  
  // Asserções para explicação detalhada
  assert.ok(normalizedHtml.includes('empresas clientes conectam seus próprios ativos meta'), 'O HTML deve explicar que clientes conectam ativos Meta');
  assert.ok(html.includes('Embedded Signup'), 'O HTML deve referenciar Embedded Signup');
  assert.ok(
    normalizedHtml.includes('processados exclusivamente') && normalizedHtml.includes('backend'),
    'O HTML deve esclarecer processamento no backend'
  );
  assert.ok(normalizedHtml.includes('credenciais sensíveis no navegador'), 'O HTML deve esclarecer que credenciais não expõem');
  assert.ok(html.includes('WhatsApp Business Platform'), 'O HTML deve referenciar a plataforma do WhatsApp Business');
  
  // Nenhuma das palavras banidas no HTML de conexão
  assert.ok(!html.includes('NEØ FLOW E-gine'), 'O HTML não deve conter "NEØ FLOW E-gine"');
  assert.ok(!html.includes('E-gine'), 'O HTML não deve conter "E-gine"');
});
