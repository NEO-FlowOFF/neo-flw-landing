<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# NEO FlowOFF Landing Memory

```text
Status: ACTIVE
Scope: repository-local
Last reviewed: 2026-08-08
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
- Do not deploy the forward-only adapter as final App Review surface until
  `whatsapp.neoflowoff.agency` resolves to `neo-provider-messaging` and `/health`
  responds publicly.

