<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# NEO FlowOFF Landing Context

```text
Status: ACTIVE
Runtime: Astro static site + Cloudflare Pages Functions
Deploy: Cloudflare Pages
Primary public domain: https://neoflowoff.agency
```

## Responsibility

`neo-flw-landing` is the public product/legal/app-review surface for
NEO FlowOFF.

It owns:

- Public Astro pages.
- Meta App Review public pages: `/privacy/`, `/terms/`, `/excluir-dados/`.
- Data Deletion callback: `/api/meta/data-deletion`.
- Meta SDK browser flow on `/conectar-whatsapp/`.
- A narrow Embedded Signup adapter at `/api/meta/embedded-signup`.
- Catalog dynamic feeds: Meta feed (`public/meta_catalog_feed.csv`) and TikTok Generic feed (`public/tiktok_generic_catalog_feed.csv`) generated via `scripts/generate_feeds.py` on build.

It does not own:

- Meta authorization code exchange.
- Meta token vault or persistence.
- WhatsApp send/template operations.
- Canonical Meta webhook processing.
- CRM decisions or provider delivery.

## Meta Boundary

The browser starts Meta Embedded Signup with the official SDK and sends the
authorization code to the local adapter.

The adapter forwards the code to:

```text
https://whatsapp.neoflowoff.agency/meta/embedded-signup
```

The sovereign backend is `neo-provider-messaging` in `neo-growth-system`.

Do not reintroduce Graph API `oauth/access_token`, local token storage,
`META_CONNECTIONS` vault fallback or WhatsApp send/template Graph calls in this
repo.

## Public URLs For Meta

```text
Privacy Policy: https://neoflowoff.agency/privacy/
Terms:          https://neoflowoff.agency/terms/
Data Deletion:  https://neoflowoff.agency/excluir-dados/
Callback:       https://neoflowoff.agency/api/meta/data-deletion
Webhook:        https://whatsapp.neoflowoff.agency/webhook
```

## Cloudflare Boundary

Cloudflare Pages Functions may validate Data Deletion `signed_request` and
forward Embedded Signup codes. They must not become the WhatsApp backend.

Secrets stay in Cloudflare Pages environment variables/secrets and must never
be printed, committed or exposed to frontend bundles.

## Runtime Checkpoint — 2026-08-09

The landing is not the WhatsApp runtime owner. Current operational state for
dev agents:

- `/conectar-whatsapp/` is the public Embedded Signup entry.
- `/api/meta/embedded-signup` only forwards the browser authorization code to
  `neo-provider-messaging`.
- The canonical WhatsApp webhook is
  `https://whatsapp.neoflowoff.agency/webhook`.
- Runtime debugging, Railway variables, WABA state, phone registration and
  inbound webhook logs belong to
  `/Users/nettomello/neomello/neo-growth-system`, service
  `neo-provider-messaging`.
- Current external blocker is the WhatsApp phone/WABA operational state after
  removing an old Zernio/Social Media Connector integration. Do not add
  fallback Graph API logic or token persistence to this landing to work around
  that state.
- Wait for Meta propagation and confirm that the phone leaves the
  `Offline`/`ON_PREMISE` legacy or Cloud API-incompatible state and has a
  verification status compatible with Cloud API.
- Then send a real inbound message. Declare the WhatsApp runtime ready only
  when Railway logs for `neo-provider-messaging` show `inbound_received`.
- If the legacy/incompatible state persists, release or recreate the asset, or
  use a backup SIM. Do not add a frontend workaround to the landing.
- The operational source of truth and next-test procedure are
  `../../neo-growth-system/CONTEXT.md` and
  `../../neo-growth-system/NEXTSTEPS.md`.
