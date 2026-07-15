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
    const { 
      eventName, 
      eventData, 
      fbp, 
      fbc, 
      url, 
      userAgent, 
      ip, 
      testEventCode,
      dataProcessingOptions
    } = req.body;
    
    // Puxando dinamicamente das variáveis de ambiente
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL || process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    
    if (!pixelId || !accessToken) {
      console.warn('Missing Meta Access Token or Pixel ID.');
      return res.status(200).json({ success: false, warning: 'Credentials not configured' });
    }

    // 1. Estruturação dos Dados do Usuário (Advanced Matching)
    const userData = {
      client_ip_address: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      client_user_agent: userAgent || req.headers['user-agent'] || '',
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    };

    if (eventData) {
      // Hashing de dados pessoais básicos
      if (eventData.email) userData.em = hashData(eventData.email);
      if (eventData.phone) userData.ph = hashData(eventData.phone.replace(/\D/g, ''));
      if (eventData.firstName) userData.fn = hashData(eventData.firstName);
      if (eventData.lastName) userData.ln = hashData(eventData.lastName);
      
      // Hashing de dados demográficos
      if (eventData.gender) userData.ge = hashData(eventData.gender);
      if (eventData.dob) userData.db = hashData(eventData.dob); // formato: YYYYMMDD
      
      // Hashing de dados de localização
      if (eventData.city) userData.ct = hashData(eventData.city);
      if (eventData.state) userData.st = hashData(eventData.state); // sigla do estado
      if (eventData.zip) userData.zp = hashData(eventData.zip.replace(/\D/g, '')); // apenas números
      if (eventData.country) userData.country = hashData(eventData.country); // código ISO 2 letras (ex: br)
      
      // ID Externo (hasheado conforme as boas práticas do SDK da Meta)
      if (eventData.externalId) {
        userData.external_id = hashData(String(eventData.externalId));
      }
    }

    // 2. Estruturação dos Dados de Conversão (Custom Data)
    const customData = {};
    if (eventData) {
      if (eventData.value !== undefined) customData.value = parseFloat(eventData.value);
      if (eventData.currency) customData.currency = eventData.currency.toUpperCase();
      if (eventData.contentName) customData.content_name = eventData.contentName;
      if (eventData.contentType) customData.content_type = eventData.contentType;
      if (eventData.contentCategory) customData.content_category = eventData.contentCategory;
      if (eventData.contents) customData.contents = eventData.contents; // Array de objetos {id, quantity, item_price}
    }

    // 3. Montagem do Payload do Evento
    const eventObject = {
      event_name: eventName,
      event_id: eventData?.eventId || Math.floor(Date.now() / 1000).toString(),
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: url || req.headers.referer || '',
      user_data: userData,
    };

    if (Object.keys(customData).length > 0) {
      eventObject.custom_data = customData;
    }

    const payload = {
      data: [eventObject]
    };

    // Adiciona o código de teste se fornecido (para depuração no Gerenciador de Eventos)
    const activeTestCode = testEventCode || process.env.META_TEST_EVENT_CODE;
    if (activeTestCode) {
      payload.test_event_code = activeTestCode;
    }

    // Suporte a opções de processamento de dados (LDU para compliance CCPA/GDPR/LGPD se enviado)
    if (dataProcessingOptions) {
      payload.data_processing_options = dataProcessingOptions.options || []; // ex: ['LDU']
      payload.data_processing_options_country = dataProcessingOptions.country || 0;
      payload.data_processing_options_state = dataProcessingOptions.state || 0;
    }

    // Chamada para a versão v25.0 da Graph API da Meta
    const graphUrl = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${accessToken}`;
    
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
