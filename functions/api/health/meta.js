import {
  DEFAULT_PHONE_NUMBER_ID,
  DEFAULT_WABA_ID,
  GRAPH_API_VERSION,
  META_APP_ID,
  checkAppAssociation,
  getPhoneNumberId,
  getSystemUserToken,
  getWabaId,
  getWabaPhoneNumbers,
  json,
} from '../../../src/server/meta-graph.js';

const REQUIRED_WEBHOOK_FIELDS = [
  'messages',
  'message_template_quality_update',
  'message_template_status_update',
  'phone_number_quality_update',
  'account_alerts',
  'business_capability_update',
  'business_status_update',
  'flows',
];

function configured(value, fallback) {
  return Boolean(value && String(value) !== String(fallback));
}

function summarizePhoneNumbers(result, expectedPhoneNumberId) {
  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.error,
      meta_error: result.meta_error || null,
      diagnostic: result.diagnostic || null,
    };
  }

  const numbers = Array.isArray(result.data?.data) ? result.data.data : [];
  return {
    ok: true,
    count: numbers.length,
    expected_phone_number_found: numbers.some(
      (number) => String(number.id) === String(expectedPhoneNumberId)
    ),
    numbers: numbers.map((number) => ({
      id: number.id,
      quality_rating: number.quality_rating || null,
      messaging_limit_tier: number.messaging_limit_tier || null,
      code_verification_status: number.code_verification_status || null,
    })),
  };
}

export async function onRequestGet({ env }) {
  const wabaId = getWabaId(env);
  const phoneNumberId = getPhoneNumberId(env);
  const phoneNumbers = await getWabaPhoneNumbers(env, wabaId);
  const appAssociation = await checkAppAssociation(env, wabaId, META_APP_ID);
  const phoneSummary = summarizePhoneNumbers(phoneNumbers, phoneNumberId);

  const checks = {
    graph_api_version: GRAPH_API_VERSION,
    app_id: META_APP_ID,
    waba_id: wabaId,
    phone_number_id: phoneNumberId,
    configuration: {
      system_user_token_configured: Boolean(getSystemUserToken(env)),
      app_secret_configured: Boolean(env.META_APP_SECRET),
      webhook_verify_token_configured: Boolean(
        env.META_WEBHOOK_VERIFY_TOKEN ||
          env.META_VERIFY_TOKEN ||
          env.WEBHOOK_VERIFY_TOKEN
      ),
      review_demo_secret_configured: Boolean(
        env.META_REVIEW_DEMO_SECRET ||
          env.META_WEBHOOK_FORWARD_SECRET ||
          env.WEBHOOK_FORWARD_SECRET
      ),
      custom_waba_id_configured: configured(wabaId, DEFAULT_WABA_ID),
      custom_phone_number_id_configured: configured(
        phoneNumberId,
        DEFAULT_PHONE_NUMBER_ID
      ),
    },
    webhooks: {
      endpoint: '/api/meta-webhook',
      required_fields: REQUIRED_WEBHOOK_FIELDS,
      statuses_location: 'messages.value.statuses',
    },
    waba_access: phoneSummary,
    app_association: appAssociation.ok
      ? appAssociation.data
      : {
          ok: false,
          status: appAssociation.status,
          error: appAssociation.error,
          meta_error: appAssociation.meta_error || null,
        },
  };

  const healthy =
    checks.configuration.system_user_token_configured &&
    phoneSummary.ok &&
    appAssociation.ok &&
    appAssociation.data.associated;

  return json(
    {
      ok: healthy,
      status: healthy ? 'ok' : 'degraded',
      checks,
    },
    200
  );
}
