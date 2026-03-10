export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body || { type: 'lead', value: 0 };
  const targetIp = process.env.ADS_ENGINEER_IP || process.env.NEXT_PUBLIC_ADS_ENGINEER_IP || '127.0.0.1:3000';
  const protocol = targetIp.includes('localhost') || targetIp.includes('127.0.0.1') ? 'http://' : 'https://';
  const url = `${protocol}${targetIp}/api/operations/callback`;

  // Disparo assíncrono blind and fire (sem esperar resposta no fluxo principal)
  // Utilizamos AbortController para timeout baixíssimo (< 1000ms)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 950);

  // Não usamos await para ser "blind and fire", mas no Vercel precisamos usar await
  // para que a função não encerre antes do fetch terminar. Como precisamos de timeout baixo:
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.status(200).json({ success: true, message: 'Webhook fired' });
  } catch (error) {
    clearTimeout(timeoutId);
    // Mesmo se falhar (ex: painel desligado para manutenção), a Target não trava
    // Reportamos "success" falso ou aviso, mas com statusCode 200 pro client
    console.warn('Webhook blind and fire bypass due to timeout or error:', error.message);
    return res.status(200).json({ success: false, warning: 'Webhook ignored to prevent locking' });
  }
}
