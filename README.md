<!-- markdownlint-disable MD003 MD007 MD011 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# neoflowoff.agency Landing

```text
========================================
       NEOFLOWOFF.AGENCY · LANDING
========================================
Status: ACTIVE
Runtime: Astro static build + Cloudflare Pages Functions
Deploy: Cloudflare Pages
========================================
```

Landing comercial independente da `neoflowoff.agency`.

Publica vitrine estática de serviços, planos e rotas de conformidade
para tráfego pago, busca, crawlers e agentes de IA.

---

## ⟠ Contrato

- child repo soberano dentro do workspace `NEO-FlowOFF`
- lockfile pnpm local versionado; `.npmrc` define `ignore-workspace=true`
  para não herdar o workspace pai
- frontend estático em Astro, sem SSR
- adapter server-side mínimo em `functions/`
- catálogo publicado em `src/data/catalog.json`
- textos de interface em `src/data/ui_texts.json`
- build de produção em `dist/`
- deploy em Cloudflare Pages via Wrangler
- superfícies públicas para agentes: `public/llms.txt`,
  `public/robots.txt` e `public/sitemap.xml`
- Google Analytics GA4 carregado por Cloudflare Google Tag Gateway:
  measurement `G-EQRKXQD7FW`, endpoint first-party `/n4py`,
  `hideOriginalIp=true` e `setUpTag=false`

Não trate este repositório como backend autoritativo.

Credenciais, cobranças, webhooks e dados privados devem
ficar fora do bundle público.

Exceções atuais: `functions/api/meta/embedded-signup.js` recebe o
authorization code do Embedded Signup e `functions/api/meta/data-deletion.js`
recebe o callback Meta Data Deletion. Ambos devem falhar fechado quando
não houver backend soberano, KV ou storage seguro configurado.

O fluxo publico de `/conectar-whatsapp/` usa Facebook Login for Business com
Configuration ID `1322930417561011`, mantido em `src/data/config.json` como
`integrations.meta.login_configuration_id`. Esse ID nao e secreto. O navegador
deve solicitar `response_type: "code"` via `config_id`; a troca do
authorization code permanece exclusivamente server-side.

---

## ⧉ Stack

```text
Astro        v7       static site generator
TypeScript   v7       Astro/component scripts
CSS                   src/styles/global.css
Icons                 local data-lucide SVG subset
Fonts                 Figtree + DM Mono via Google Fonts
PWA                   public/manifest.webmanifest + public/sw.js
Hosting               Cloudflare Pages
Serverless            Cloudflare Pages Functions
Deploy CLI            wrangler v4
Analytics             GA4 via Cloudflare Google Tag Gateway
```

---

## ⧇ Estrutura

```text
neo-flw-landing/
├── src/
│   ├── components/          # HubHeader, ProductCard, chips
│   ├── data/                # catálogo, config e textos
│   ├── layouts/             # Base Astro compartilhado
│   ├── pages/               # home, planos, checkout, compliance
│   └── styles/              # design system global
├── public/
│   ├── assets/              # assets estáticos otimizados
│   ├── llms.txt             # mapa público para agentes
│   ├── manifest.webmanifest # PWA manifest
│   ├── robots.txt           # política crawler
│   ├── sitemap.xml          # rotas públicas
│   └── sw.js                # service worker conservador
├── functions/
│   └── api/meta/            # adapters Embedded Signup e Data Deletion
├── drafts/                  # insumos canônicos do operador
├── docs/                    # documentação de suporte
├── pnpm-workspace.yaml      # workspace local vazio: packages: []
├── pnpm-lock.yaml           # lockfile soberano deste child repo
├── wrangler.jsonc           # config Cloudflare Pages
└── Makefile                 # comandos locais
```

---

## ◬ Rotas

```text
/                         home
/planos/[slug]/           planos completos
/checkout/[slug]/         serviços unitários públicos
/conectar-whatsapp/       conector WhatsApp via Meta
/privacy/                 privacy policy
/terms/                   termos de serviço
/excluir-dados/           exclusão de dados
/api/meta/data-deletion   callback Meta Data Deletion
```

Rotas de `planos` e `checkout` são geradas a partir de `src/data/catalog.json`.

---

## ◯ Identidade Visual

- azul restrito ao bloco Meta no topo
- demais seções usam acid, cinza, preto e branco
- cards devem manter contraste AA quando possível
- logo principal do header vem de `public/assets/`
- logo steel do footer vem de `src/assets/images/steel_flw.webp`

---

## ⨷ Início rápido

```bash
make install   # instala dependências no lockfile local
make dev       # servidor local → http://localhost:4321/
make build     # build de produção → ./dist/
make verify    # audit/docs/lint local
make deploy    # wrangler pages deploy
```

→ Ver [SETUP.md](./SETUP.md) para detalhe completo de ambiente,
  variáveis, deploy e catálogo.

---

## ⬡ Especificação do Portal

```text
INTERFACE           neoflowoff.portal
EXECUTION NODE      NEØFLW Engine/01
ORCHESTRATION       NEØ Growth System
ARCHITECTURE        NEØ Protocol
PROVIDER CONNECTOR  Meta Business Messaging
```

---

## ⦿ Referências

- [SETUP](./SETUP.md)
- [AGENTS](./AGENTS.md)
- [CODEX](./CODEX.md)
- [CLAUDE](./CLAUDE.md)
- [GEMINI](./GEMINI.md)
- [NEO Protocol](./NEO_PROTOCOL.md)

```text
──────────────────────────────
NΞØ Protocol · FlowOFF Landing
──────────────────────────────
```
