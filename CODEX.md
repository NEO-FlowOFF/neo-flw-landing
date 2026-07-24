<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# CODEX.md

```text
========================================
          CODEX · RUNTIME MAP
========================================
Repo: neo-flw-landing
Role: commercial landing with minimal Meta adapter
Host: Cloudflare Pages
========================================
```

Este arquivo orienta agentes que precisam alterar,
auditar ou publicar o `neo-flw-landing`.

A realidade do runtime vence documentacao antiga.
Verifique imports, rotas geradas e artefatos de `public/`
antes de afirmar que uma capacidade esta ativa.

────────────────────────────────────────

## ⟠ Arquitetura

```text
Astro SSG
├── src/layouts/Base.astro
│   ├── head global
│   ├── token de verificacao Meta
│   ├── fontes Figtree + DM Mono
│   ├── subset local de icones data-lucide
│   └── registro do service worker
├── src/pages/index.astro
│   └── home comercial alimentada por catalogo
├── src/pages/planos/[slug].astro
│   └── paginas de planos
├── src/pages/checkout/[slug].astro
│   └── paginas publicas de servicos unitarios
└── public/
    ├── manifest.webmanifest
    ├── sw.js
    ├── llms.txt
    ├── robots.txt
    └── sitemap.xml

Cloudflare Pages Functions
└── functions/api/meta/embedded-signup.js
    └── server-side adapter for Meta Embedded Signup code handling
```

`dist/` e apenas saida de build.
Nao edite `dist/` como fonte.

────────────────────────────────────────

## ⧉ Dados

```text
src/data/catalog.json        catalogo publicado no site
src/data/ui_texts.json       copy e textos de interface
src/data/config.json         config publica segura
drafts/catalog_v2026_2.json  insumo canonico do operador
```

Nao edite `drafts/catalog_v2026_2.json` sem pedido explicito.

Quando o operador perguntar se todos os produtos estao veiculados,
compare o draft canonico com `src/data/catalog.json`,
com a home e com as rotas geradas.

────────────────────────────────────────

## ◬ Catalogo

Home:

```text
Bloco Meta
└─ api-whatsapp
└─ app-meta
└─ trafego-meta

Planos
└─ agente-sdr
└─ agents-ia
└─ crm-inteligente
└─ fluxos-automacao
└─ trafego-google

Servicos
└─ a2m-poi-standard
└─ dashboard-dados
└─ webapp-lp
```

Rotas dinamicas:

```text
/planos/[slug]     category = Plano
/checkout/[slug]   category = Serviço
```

────────────────────────────────────────

## ⨷ Performance

Contratos atuais:

- nao carregar `lucide.min.js` de CDN
- usar subset SVG local para `data-lucide`
- manter logo LCP com `loading="eager"` e `fetchpriority="high"`
- usar assets estaticos de `public/assets/` quando isso evita `/_image`
- manter `manifest.webmanifest` valido para evitar 404
- nao preloaded Google Fonts se o stylesheet for carregado via
  `media="print" onload`
- service worker deve ignorar assets de dev/build sensiveis:
  `/_astro`, `/_image`, `/src` e `/api`

Se DevTools apontar `/_image` em producao,
trate como cheiro de uso indevido do endpoint de imagem
em ambiente nao-dev.

────────────────────────────────────────

## ⍟ Agentes

Superficies publicas para agentes:

```text
public/llms.txt
public/robots.txt
public/sitemap.xml
public/manifest.webmanifest
```

`llms.txt` deve ser Markdown,
ter pelo menos um H1,
e conter links para as paginas publicas principais.

`robots.txt`, `sitemap.xml` e `llms.txt`
devem contar a mesma historia sobre rotas publicas.

Nao inclua segredos, criterios internos,
precificacao excepcional ou comportamento backend privado
em nenhuma superficie publica para agentes.

`functions/api/meta/embedded-signup.js` nao torna este repo
backend autoritativo. Ele deve apenas encaminhar o authorization
code para backend soberano ou armazenar de forma segura quando
Cloudflare KV e criptografia estiverem configurados.

────────────────────────────────────────

## ◯ Deploy

Deploy local:

```bash
make deploy
```

O alvo usa:

```bash
pnpm exec wrangler pages deploy dist --project-name=neoflowoff-agency
```

Cloudflare Pages Git deploy precisa ter:

```text
Build command: pnpm run build
Output directory: dist
```

`wrangler.jsonc` versiona `pages_build_output_dir: "./dist"`.

────────────────────────────────────────

## ⦿ Validacao

Use a validacao mais proxima do risco alterado:

```bash
pnpm run build
./node_modules/.bin/stylelint 'src/styles/**/*.css'
node --check public/sw.js
xmllint --noout public/sitemap.xml
```

Se `astro check` falhar por erro interno do language server,
registre a falha de typecheck em vez de mascara-la.

```text
────────────────────────────
CODEX · NΞØ FlowOFF Landing
────────────────────────────
```
