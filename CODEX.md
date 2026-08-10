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
│   ├── Google Analytics via Cloudflare Google Tag Gateway (/n4py)
│   ├── fontes Figtree + DM Mono
│   ├── subset local de icones data-lucide
│   └── registro do service worker
├── src/pages/index.astro
│   ├── home comercial alimentada por catalogo
│   ├── ticker editorial TOP TELENOTICIAS com status operacional atual
│   └── hero com imagem estatica /logo_transp.png
├── src/pages/planos/[slug].astro
│   └── paginas de planos
├── src/pages/checkout/[slug].astro
│   └── paginas publicas de servicos unitarios
├── src/pages/privacy.astro
├── src/pages/terms.astro
├── src/pages/excluir-dados.astro
├── src/server/meta-graph.js
│   └── helpers server-side para Graph API Meta v25.0
└── public/
    ├── logo_transp.png
    ├── manifest.webmanifest
    ├── sw.js
    ├── llms.txt
    ├── robots.txt
    └── sitemap.xml

Cloudflare Pages Functions
├── functions/api/meta-webhook.js
│   └── endpoint legado/migrado; nao e o webhook canonico
├── functions/api/meta/embedded-signup.js
│   └── server-side adapter for Meta Embedded Signup code handling
├── functions/api/meta/data-deletion.js
│   └── validates Meta signed_request and queues/forwards deletion requests
├── functions/api/whatsapp/send.js
│   └── rota legada de demonstracao; nao opera envio canonico
├── functions/api/whatsapp/templates.js
│   └── rota legada de demonstracao; nao opera templates canonicos
└── functions/api/health/meta.js
    └── diagnostico local legado; runtime pertence ao provider
```

Google Tag Gateway ativo na zona Cloudflare:

```text
measurementId    G-EQRKXQD7FW
endpoint         /n4py
hideOriginalIp   true
setUpTag         false
```

Como `setUpTag=false`, o carregamento e manual em `Base.astro`.
Nao trocar para `googletagmanager.com` sem revalidar a configuracao
da zona.

`dist/` e apenas saida de build.
Nao edite `dist/` como fonte.

`functions/` deve conter apenas endpoints reais.
Nao coloque helpers em subpastas de `functions/`, pois Cloudflare Pages
gera rotas por estrutura de arquivos.
Helpers server-side compartilhados vivem em `src/server/`.

Os HTMLs legais legados da raiz foram removidos:

```text
privacy/index.html
legal/index.html
excluir-dados/index.html
```

Nao recrie esses arquivos. As URLs equivalentes sao geradas por
Astro em `src/pages/*.astro`.

────────────────────────────────────────

## ⧉ Dados

```text
src/data/catalog.json        catalogo publicado no site
src/data/ui_texts.json       copy e textos de interface
src/data/config.json         config publica segura
drafts/catalog_v2026_2.json  insumo canonico do operador
```

Nao edite `drafts/catalog_v2026_2.json` sem pedido explicito.

Meta Embedded Signup:

```text
src/data/config.json
└─ integrations.meta.login_configuration_id = 1322930417561011

src/pages/conectar-whatsapp.astro
└─ button[data-meta-config-id]

src/scripts/meta-signup.ts
└─ FB.login({ config_id, response_type: "code", override_default_response_type: true })
```

O Configuration ID nao e secret nem App ID. Nao enviar `scope` paralelo ao
`FB.login` sem revalidar exigencia atual da Meta. O authorization code nunca
deve ser trocado no browser; o adapter `/api/meta/embedded-signup` continua
server-side.

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
└─ regularizacao-meta-waba
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
- manter a imagem da hero `/logo_transp.png` com dimensoes explicitas,
  `loading="eager"`, `decoding="async"` e `fetchpriority="high"`
- para imagens importadas de `src/assets`, usar `<img>` com
  `src={asset.src}`, `width={asset.width}` e `height={asset.height}`
- para URLs publicas em JSON/catalogo/metadados, usar arquivos em
  `public/` por caminho publico (`/assets/...`), nunca `/src/assets/...`
  nem `/public/...`
- usar assets estaticos de `public/assets/` quando isso evita `/_image`
- manter `manifest.webmanifest` valido para evitar 404
- nao preloaded Google Fonts se o stylesheet for carregado via
  `media="print" onload`
- service worker deve ignorar assets de dev/build sensiveis:
  `/_astro`, `/_image`, `/src` e `/api`

Se DevTools apontar `/_image` em producao,
trate como cheiro de uso indevido do endpoint de imagem
em ambiente nao-dev.

Referencia interna de engenharia:

```text
Meta Engineering — Investing in Infrastructure:
https://engineering.fb.com/2026/03/02/data-infrastructure/investing-in-infrastructure-metas-renewed-commitment-to-jemalloc/
```

Use essa referencia apenas como orientacao conceitual sobre
infraestrutura de base, reducao de divida tecnica, eficiencia e
confiabilidade. Ela nao e requisito de App Review, nao e termo juridico
Meta/WhatsApp e nao deve justificar alteracao automatica de runtime,
allocator, imagem Docker ou dependencia sem auditoria especifica.

────────────────────────────────────────

## ◭ Ticker Editorial

O topo da home possui um letreiro de noticias operacionais atuais.
Ele deve comunicar, de forma curta, o que a neoflowoff.agency esta
trabalhando agora.

Conteudo apropriado:

- App Review Meta
- Meta Tech Provider
- WhatsApp Business
- Graph API e webhooks
- NEØ Growth System
- infraestrutura comercial em validacao

Nao transformar o ticker em tutorial, claim generico, changelog interno
ou promessa futura sem evidência operacional.

────────────────────────────────────────

## ⍟ Agentes

Superficies publicas para agentes:

```text
public/llms.txt
public/robots.txt
public/sitemap.xml
public/manifest.webmanifest
```

Superficies legais para Meta/App Review:

```text
/privacy/
/terms/
/excluir-dados/
```

Todas as rotas legadas duplicadas (/legal/, /privacidade/, /termos/, /seguranca/) foram removidas para garantir correspondencia 1-para-1 com o painel da Meta.

`llms.txt` deve ser Markdown,
ter pelo menos um H1,
e conter links para as paginas publicas principais.

`robots.txt`, `sitemap.xml` e `llms.txt`
devem contar a mesma historia sobre rotas publicas.

Nao inclua segredos, criterios internos,
precificacao excepcional ou comportamento backend privado
em nenhuma superficie publica para agentes.

`functions/api/meta/embedded-signup.js` e
`functions/api/meta/data-deletion.js` nao tornam este repo backend
autoritativo. Eles devem apenas encaminhar dados para backend soberano
ou armazenar de forma segura quando Cloudflare KV e criptografia
estiverem configurados.

O adapter Meta usa Graph API `v25.0` fixa.
Nao reintroduza override por env para `v26.0` sem decisao explicita.

O endpoint local `/api/meta-webhook` é legado/migrado. O webhook canônico,
envio, templates e diagnóstico operacional pertencem ao
`neo-provider-messaging` em `neo-growth-system`.

As rotas locais `/api/whatsapp/send` e `/api/whatsapp/templates` são
superfícies legadas de demonstração e não devem chamar a Graph API a partir
da landing.

O callback publico de exclusao de dados e
`/api/meta/data-deletion`; a pagina publica de instrucoes e
`/excluir-dados/`. Nao recrie `src/pages/data-deletion.astro`.

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
node --test tests/data-deletion-and-ssr.test.js
```

Se `astro check` falhar por erro interno do language server,
registre a falha de typecheck em vez de mascara-la.

```text
────────────────────────────
CODEX · NΞØ FlowOFF Landing
────────────────────────────
```
