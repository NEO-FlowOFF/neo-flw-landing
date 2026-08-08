const GRAPH_API_VERSION = 'v25.0';
const META_APP_ID = '1500002841696407';
const CANONICAL_WEBHOOK_URL = 'https://whatsapp.neoflowoff.agency/webhook';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      ok: true,
      status: 'delegated',
      app_id: META_APP_ID,
      graph_api_version: GRAPH_API_VERSION,
      landing_role: 'sdk_and_forward_adapter',
      provider: {
        service: 'neo-provider-messaging',
        embedded_signup_configured: Boolean(
          env.META_EMBEDDED_SIGNUP_FORWARD_URL &&
            env.META_EMBEDDED_SIGNUP_FORWARD_SECRET
        ),
        webhook_url: CANONICAL_WEBHOOK_URL,
      },
      data_deletion_callback: '/api/meta/data-deletion',
    }),
    {
      status: 200,
      headers: JSON_HEADERS,
    }
  );
}
