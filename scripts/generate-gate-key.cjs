#!/usr/bin/env node
/**
 * generate-gate-key.js
 *
 * Generates a signed WABA gate key for /conectar-whatsapp/ access.
 *
 * Usage:
 *   WABA_GATE_SECRET=your-secret node scripts/generate-gate-key.js
 *   WABA_GATE_SECRET=your-secret node scripts/generate-gate-key.js <client-id>
 *
 * Output:
 *   A key in the format: flw_<payload>_<signature>
 *   where payload = hex-encoded client identifier (or random if omitted)
 *   and signature = HMAC-SHA256(payload, secret) truncated to 32 hex chars.
 */

const crypto = require('crypto');

const secret = process.env.WABA_GATE_SECRET;
if (!secret) {
  console.error('Error: WABA_GATE_SECRET environment variable is required.');
  process.exit(1);
}

const clientId = process.argv[2] || crypto.randomBytes(8).toString('hex');
const payload = Buffer.from(clientId).toString('hex').slice(0, 32);

const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex')
  .slice(0, 32);

const key = `flw_${payload}_${signature}`;

console.log('');
console.log('Generated WABA Gate Key:');
console.log('========================');
console.log(key);
console.log('');
console.log('Client ID:', clientId);
console.log('Payload:  ', payload);
console.log('Signature:', signature);
console.log('');
console.log('Delivery options:');
console.log(`  URL:   https://neoflowoff.agency/conectar-whatsapp/?auth=${key}`);
console.log(`  Input: paste "${key}" into the activation form`);
console.log('');
