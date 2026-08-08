const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export async function onRequestPost() {
  return new Response(
    JSON.stringify({
      error: 'whatsapp_send_moved_to_provider',
      provider: 'neo-provider-messaging',
    }),
    {
      status: 410,
      headers: JSON_HEADERS,
    }
  );
}
