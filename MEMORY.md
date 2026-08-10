<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# NEO FlowOFF Landing Memory

```text
Status: ACTIVE
Scope: repository-local
Last reviewed: 2026-08-10
```

## Current Decisions

- App ID canônico: `1500002841696407`.
- Graph API public SDK version: `v25.0`.
- Facebook Login for Business Configuration ID: `1322930417561011`.
- Legal/App Review public pages are `/privacy/`, `/terms/` and `/excluir-dados/`.
- Data Deletion callback remains in this repo at `/api/meta/data-deletion`.
- Embedded Signup adapter is forward-only to `neo-provider-messaging`.
- Canonical webhook belongs to `https://whatsapp.neoflowoff.agency/webhook`.

## Removed Responsibilities

The landing must not:

- Exchange Embedded Signup authorization codes with Graph API.
- Store Meta tokens in KV or local vaults.
- Own WhatsApp send/template operations.
- Process the canonical Meta webhook.
- Expose System User tokens, WhatsApp access tokens or app secrets to browser code.

## Operational Notes

- `META_EMBEDDED_SIGNUP_FORWARD_URL` is configured in `wrangler.jsonc`.
- `META_EMBEDDED_SIGNUP_FORWARD_SECRET` is a Cloudflare Pages secret.
- DNS and public `/health` prove ingress, not WhatsApp readiness.
- After Meta propagation, confirm that the phone leaves the
  `Offline`/`ON_PREMISE` legacy or Cloud API-incompatible state and has a
  verification status compatible with Cloud API. Then send a real inbound
  message and require `inbound_received` in Railway logs for
  `neo-provider-messaging` before declaring the runtime ready.
- If the state persists, release or recreate the asset, or use a backup SIM.
  Do not add a frontend workaround to the landing.
- Follow `../../neo-growth-system/CONTEXT.md` and
  `../../neo-growth-system/NEXTSTEPS.md` for the operational source of truth.
