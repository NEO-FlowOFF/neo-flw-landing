# Meta App Review Runbook

This document is the public-safe operational checklist for the Meta App Review path.
It must not contain access tokens, app secrets, bearer secrets, private keys, or raw webhook payloads.

## Canonical Public Surface

- Canonical domain: `https://neoflowoff.agency`
- Temporary landing/review subdomain: `https://lp.neoflowoff.agency`
- Privacy Policy: `https://neoflowoff.agency/privacy`
- Terms of Service: `https://neoflowoff.agency/legal`
- Data Deletion: `https://neoflowoff.agency/excluir-dados`
- Embedded Signup page: `https://neoflowoff.agency/conectar-whatsapp`

If Meta Developers still requires the `lp.` subdomain during transition, keep both domains in App Domains until DNS/canonical redirects are confirmed.

## App Review Scope

Requested permissions:

- `whatsapp_business_management`
- `whatsapp_business_messaging`
- `business_management`

Public App ID used by the landing:

- `150002841696407`

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

## Webhook Endpoint Decision

Official Meta webhook callback for the current architecture:

```text
https://neo-whatsapp-connect-production.up.railway.app/webhook
```

Required behavior:

- `GET /webhook` returns the raw challenge when `hub.verify_token` matches.
- `POST /webhook` validates `X-Hub-Signature-256` with `META_APP_SECRET`.
- The service responds quickly to Meta and processes inbound events asynchronously.
- Inbound events must be forwarded to the internal consumer without exposing secrets to the static landing.

Rollback endpoint during migration:

```text
https://lp.neoflowoff.agency/api/meta-webhook
```

Do not keep rollback active longer than the migration window. The landing should not be the long-term owner of Meta webhook processing.

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
