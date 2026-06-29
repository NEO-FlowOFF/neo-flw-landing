export default function handler(req, res) {
  if (req.method === 'GET') {
    // Validação inicial do Meta Developer (Desafio / Challenge)
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // O token de verificação (configurado nas variáveis de ambiente da Vercel)
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED: Verificação da Meta concluída com sucesso!');
        // A Meta EXIGE que a gente devolva o challenge cru em texto plano, sem JSON
        return res.status(200).send(challenge);
      } else {
        console.error('WEBHOOK_ERROR: Token inválido ou modo incorreto.');
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(400).send('Bad Request');
  } 
  
  if (req.method === 'POST') {
    // Aqui é onde os eventos reais vão chegar (mensagens, leads, etc)
    const body = req.body;
    
    console.log('Recebido evento do Webhook da Meta:');
    console.log(JSON.stringify(body, null, 2));
    
    // É obrigatório devolver 200 OK rápido para a Meta saber que recebemos
    return res.status(200).send('EVENT_RECEIVED');
  }

  // Bloqueia qualquer outro tipo de requisição
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
