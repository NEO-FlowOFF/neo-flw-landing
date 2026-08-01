# Meta App Review Runbook

This document is the public-safe operational checklist for the Meta App Review path.
It must not contain access tokens, app secrets, bearer secrets, private keys, or raw webhook payloads.

## Canonical Public Surface

- Canonical domain: `https://neoflowoff.agency`
- Privacy Policy: `https://neoflowoff.agency/privacy/`
- Terms of Service: `https://neoflowoff.agency/terms/`
- Data Deletion: `https://neoflowoff.agency/excluir-dados/`
- Data Deletion Callback: `https://neoflowoff.agency/api/meta/data-deletion`
- Embedded Signup page: `https://neoflowoff.agency/conectar-whatsapp/`
- Webhook Callback: `https://neoflowoff.agency/api/meta-webhook`

Do not use `lp.neoflowoff.agency`, `ipfs.neoflowoff.agency`, or legacy
Portuguese aliases as primary URLs in the Meta App Review form. The aliases
must not be used for the approval submission.

## App Review Scope

Requested permissions:

- `whatsapp_business_management`
- `whatsapp_business_messaging`
- `business_management`

Public App ID used by the landing:

- `1500002841696407`

Graph API version:

- `v25.0`

## Embedded Signup Contract

Browser route:

```text
GET /conectar-whatsapp
```

Server-side adapter:

```text
POST /api/meta/embedded-signup
```

The browser must not store or log `authResponse`, access tokens, app secrets, WABA credentials, or webhook secrets.

The adapter supports two safe modes:

1. Forward-only mode to a sovereign backend:
   - `META_EMBEDDED_SIGNUP_FORWARD_URL`
   - `META_EMBEDDED_SIGNUP_FORWARD_SECRET`

2. Local encrypted Cloudflare KV mode:
   - `META_APP_SECRET`
   - `META_TOKEN_ENCRYPTION_KEY`
   - `META_CONNECTIONS` KV binding
   - optional `META_OAUTH_REDIRECT_URI`

The Graph API version is fixed at `v25.0` in the adapter.
Do not reintroduce environment overrides to `v26.0` or future versions
without an explicit review decision.

If neither mode is configured, the adapter must return `503 secure_storage_not_configured`, and the frontend must not display a successful connection.

## Data Deletion Callback Contract

Meta dashboard URL:

```text
POST /api/meta/data-deletion
```

The callback must receive Meta's `signed_request`, validate it with `META_APP_SECRET`, initiate deletion through either a sovereign backend forward or a secure Cloudflare KV record, and return:

```json
{
  "url": "https://neoflowoff.agency/excluir-dados?code=...",
  "confirmation_code": "..."
}
```

If `META_APP_SECRET` or a secure deletion handler is not configured, the callback must fail closed.

Supported secure handlers:

1. Forward to sovereign backend:
   - `META_DATA_DELETION_FORWARD_URL`
   - `META_DATA_DELETION_FORWARD_SECRET`

2. Queue in Cloudflare KV for processing:
   - `META_DELETION_REQUESTS` KV binding

## Webhook Endpoint Decision

Current public App Review callback:

```text
https://neoflowoff.agency/api/meta-webhook
```

Long-term service owner:

```text
neo-provider-messaging
```

The landing callback exists to support App Review while the sovereign
backend is being hardened. Do not use old platform-specific provider URLs
as the production callback.

Required behavior:

- `GET /api/meta-webhook` returns the raw challenge when
  `hub.verify_token` matches.
- `POST /api/meta-webhook` validates `X-Hub-Signature-256`
  with `META_APP_SECRET` when configured.
- `POST /api/meta-webhook` classifies `messages.value.statuses`
  as `statuses`.
- The service responds quickly to Meta and never logs secrets,
  access tokens, raw authorization codes or full signed requests.

Subscribed fields expected during App Review:

```text
messages
message_template_quality_update
message_template_status_update
phone_number_quality_update
account_alerts
business_capability_update
business_status_update
flows
```

In Graph API v25.0, delivery/read statuses arrive under the `messages`
field payload as `value.statuses`; do not add a separate subscribed
field named `statuses`.

## App Review Demo Endpoints

Use these only with server-side secrets configured in Cloudflare:

```text
POST /api/whatsapp/send
GET  /api/whatsapp/templates
POST /api/whatsapp/templates
GET  /api/health/meta
```

`/api/whatsapp/send` demonstrates `whatsapp_business_messaging`.
`/api/whatsapp/templates` demonstrates `whatsapp_business_management`.
Both require `Authorization: Bearer <META_REVIEW_DEMO_SECRET>`.

`/api/health/meta` returns a sanitized status for:

- Graph API version
- WABA access
- phone number lookup
- app association
- webhook field contract
- server-side secret presence as booleans only

## Data Handling

- Logs must mask phone numbers and avoid raw payload dumps.
- Raw Meta webhook payloads should not be persisted unless there is a clear operational need, retention policy, and access control.
- Message bodies are operational data and should remain in backend services with deletion flow support.
- Public pages must describe the real retention and deletion behavior, not aspirational storage claims.

## Pre-Submission Checks

- Confirm App Domains include the final canonical domain.
- Confirm Privacy, Terms, and Data Deletion URLs resolve without redirects that confuse Meta review.
- Confirm Embedded Signup returns success only after backend confirmation.
- Confirm webhook challenge succeeds on the official callback.
- Confirm webhook POST rejects invalid signatures.
- Confirm a real inbound message reaches the internal consumer.
- Confirm outbound send uses official WhatsApp Cloud API, not unofficial clients.
- Confirm human handoff and account disconnection/deletion process are visible and tested.
