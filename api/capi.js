import crypto from 'crypto';

function hashData(str) {
  if (!str) return undefined;
  // Letras minúsculas e sem símbolos
  const normalized = str.toLowerCase().trim().replace(/[^\w\d@\.\-]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { eventName, eventData, fbp, fbc, url, userAgent, ip } = req.body;
    
    // Puxando dinamicamente das variáveis de ambiente
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL || process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    
    if (!pixelId || !accessToken) {
      console.warn('Missing Meta Access Token or Pixel ID.');
      return res.status(200).json({ success: false, warning: 'Credentials not configured' });
    }

    const userData = {
      client_ip_address: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      client_user_agent: userAgent || req.headers['user-agent'] || '',
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    };

    if (eventData) {
      if (eventData.email) userData.em = hashData(eventData.email);
      if (eventData.phone) userData.ph = hashData(eventData.phone.replace(/\D/g, ''));
      if (eventData.firstName) userData.fn = hashData(eventData.firstName);
      if (eventData.lastName) userData.ln = hashData(eventData.lastName);
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: url || req.headers.referer || '',
          user_data: userData,
        }
      ]
    };

    const graphUrl = `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('CAPI Server Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
