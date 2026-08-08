const CANONICAL_WEBHOOK_URL = 'https://whatsapp.neoflowoff.agency/webhook';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function gone() {
  return new Response(
    JSON.stringify({
      error: 'meta_webhook_moved_to_provider',
      canonical_url: CANONICAL_WEBHOOK_URL,
    }),
    {
      status: 410,
      headers: JSON_HEADERS,
    }
  );
}

export async function onRequestGet() {
  return gone();
}

export async function onRequestPost() {
  return gone();
}
