# Security Policy

## Project Scope

This policy applies to:

- project: `neoflowoff.agency / neo-flw-landing`
- supported runtime: `main` branch
- runtime model: Astro static site on Cloudflare Pages
- server-side surface: Cloudflare Pages Functions in `functions/`

This repository is not the authoritative backend for customer data,
payments, CRM, campaign automation or WhatsApp message orchestration.

## Covered Surfaces

Security reports for this repository should focus on:

- public Astro pages under `src/pages/`
- shared layout and components under `src/layouts/` and `src/components/`
- public assets and crawler surfaces under `public/`
- Cloudflare Pages configuration in `wrangler.jsonc`
- Meta Embedded Signup adapter in `functions/api/meta/embedded-signup.js`
- Meta Data Deletion callback in `functions/api/meta/data-deletion.js`
- privacy, legal and data deletion public routes

## Out Of Scope

The following systems may be part of the wider NEO FlowOFF ecosystem,
but are not owned by this checkout:

- sovereign backend services
- CRM storage and dashboards
- payment processors and reconciliation services
- WhatsApp provider runtime
- Meta Ads campaign execution
- databases and tenant data stores outside this repository

If a vulnerability spans multiple services,
report it privately and identify every affected surface when possible.

## Reporting Security Vulnerabilities

If you discover a vulnerability,
please do not open a public GitHub issue.

Preferred reporting channel:

- Email: <security@neoflowoff.agency>
- Subject: `[SECURITY] neo-flw-landing - brief description`

If the security mailbox is not available or does not respond,
use the general contact as fallback:

- Email: <neo@neoflowoff.agency>

Include:

- affected URL, route, file or endpoint
- steps to reproduce
- potential impact
- whether secrets, user data or platform credentials may be exposed
- suggested fix, if available

Do not include live secrets, private keys, bearer tokens,
webhook secrets or customer data in the report body.
Use redacted examples whenever possible.

## Response Expectations

Expected handling:

- acknowledge the report as soon as practical
- assess whether this repository owns the affected surface
- fail closed for Meta, webhook, deletion and authorization-code flows
- coordinate with the sovereign backend owner when the issue is external
- disclose publicly only after a fix or mitigation is available

No fixed SLA is promised in this repository unless a separate support
agreement defines one.

## Supported Version

| Target | Status | Security Updates |
|--------|--------|------------------|
| `main` | Active | Yes              |

Historical tags or branches are not guaranteed to receive fixes.

## Local Security Practices

Developers working in this checkout should:

- never commit `.env` files or secrets
- use `.env.example` only as a variable-name template
- avoid exposing private tokens in Astro, `public/` or client scripts
- keep Meta App secrets and webhook secrets server-side only
- validate Meta signed requests and authorization-code handling server-side
- keep `functions/` narrow and fail closed when secure storage is absent
- run project-local validation before publishing changes

Recommended local checks:

```bash
pnpm run build
./node_modules/.bin/stylelint 'src/styles/**/*.css'
node --check public/sw.js
xmllint --noout public/sitemap.xml
```

Use `make audit` when dependency audit is relevant to the change.

## Data Deletion And Compliance Surface

Public data deletion instructions are served at:

```text
https://neoflowoff.agency/excluir-dados/
https://neoflowoff.agency/data-deletion/
```

Meta Data Deletion callback surface:

```text
POST /api/meta/data-deletion
```

The callback must validate Meta input and fail closed when required
configuration or secure handling is unavailable.

## Contact

- Security: <security@neoflowoff.agency>
- General: <neo@neoflowoff.agency>
