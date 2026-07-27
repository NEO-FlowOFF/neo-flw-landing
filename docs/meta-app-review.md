# Meta App Review Runbook

This document is the public-safe operational checklist for the Meta App Review path.
It must not contain access tokens, app secrets, bearer secrets, private keys, or raw webhook payloads.

## Canonical Public Surface

- Canonical domain: `https://neoflowoff.agency`
- Privacy Policy: `https://neoflowoff.agency/privacy/`
- Terms of Service: `https://neoflowoff.agency/terms/`
- Data Deletion: `https://neoflowoff.agency/data-deletion/`
- Data Deletion Callback: `https://neoflowoff.agency/api/meta/data-deletion`
- Embedded Signup page: `https://neoflowoff.agency/conectar-whatsapp/`

Do not use `lp.neoflowoff.agency`, `ipfs.neoflowoff.agency`, or legacy
Portuguese aliases as primary URLs in the Meta App Review form. The aliases
remain public for compatibility, but the approval submission should use the
canonical URLs above.

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
   - optional `META_APP_ID`
   - optional `META_GRAPH_API_VERSION`
   - optional `META_OAUTH_REDIRECT_URI`

If neither mode is configured, the adapter must return `503 secure_storage_not_configured`, and the frontend must not display a successful connection.

## Data Deletion Callback Contract

Meta dashboard URL:

```text
POST /api/meta/data-deletion
```

The callback must receive Meta's `signed_request`, validate it with `META_APP_SECRET`, initiate deletion through either a sovereign backend forward or a secure Cloudflare KV record, and return:

```json
{
  "url": "https://neoflowoff.agency/data-deletion/?confirmation_code=...",
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

Canonical service owner:

```text
neo-provider-messaging
```

Public callback URL currently verified for the WhatsApp Cloud API runtime:

```text
https://neo-whatsapp-connect-production.up.railway.app/webhook
```

This Railway URL still contains the previous service name. Keep it only while
it is the active, verified production endpoint. Before submitting or updating
the Meta webhook callback, confirm the public URL that currently returns
`/health` with `status: ok` and `whatsappConfigured: true`.

Required behavior:

- `GET /webhook` returns the raw challenge when `hub.verify_token` matches.
- `POST /webhook` validates `X-Hub-Signature-256` with `META_APP_SECRET`.
- The service responds quickly to Meta and processes inbound events asynchronously.
- Inbound events must be forwarded to the internal consumer without exposing secrets to the static landing.

Legacy rollback endpoint during migration only:

```text
https://lp.neoflowoff.agency/api/meta-webhook
```

Do not use the rollback endpoint in the Meta App Review form unless there is an
active incident on the production provider. The landing should not be the
long-term owner of Meta webhook processing.

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
