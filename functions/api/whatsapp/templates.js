const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function moved() {
  return new Response(
    JSON.stringify({
      error: 'whatsapp_templates_moved_to_provider',
      provider: 'neo-provider-messaging',
    }),
    {
      status: 410,
      headers: JSON_HEADERS,
    }
  );
}

export async function onRequestGet() {
  return moved();
}

export async function onRequestPost() {
  return moved();
}
