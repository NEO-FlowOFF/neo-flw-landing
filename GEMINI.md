<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# GEMINI.md

```text
========================================
          GEMINI · AGENT RULES
========================================
Repo: neo-flw-landing
Runtime: Astro + Cloudflare Pages + Functions
========================================
```

Este arquivo define como agentes devem operar neste child repo.

Runtime vence narrativa.
Estado do checkout vence memoria.
Arquivos publicos nao sao autoridade de backend.
`functions/` existe apenas como adapter server-side minimo;
nao coloque regra de produto, secrets ou persistencia soberana nele.
Nao coloque helpers dentro de `functions/`.
Cloudflare Pages gera rotas pela estrutura de arquivos.
Helpers server-side compartilhados vivem em `src/server/`.

────────────────────────────────────────

## ⟠ Documentacao Atual

Quando a tarefa envolver biblioteca, framework, SDK,
API, CLI ou cloud service, busque documentacao atual.

Use Context7 MCP quando disponivel.

Exemplos:

- Astro
- Cloudflare Pages
- Wrangler
- Meta APIs
- Google Fonts
- service workers
- OpenAI SDKs

Nao use Context7 para refatoracao pura,
debug de regra de negocio,
review geral ou scripts simples.

────────────────────────────────────────

## ⧉ Regras

- investigue o caminho real antes de editar
- preserve diffs locais do operador
- nao edite `~/neomello/_standards/services_canonical.json` sem pedido explicito do operador
- nao edite `drafts/catalog_v2026_2.json` sem pedido explicito
- nao trate `dist/` como fonte
- nao recrie HTMLs legais legados na raiz:
  `privacy/index.html`, `legal/index.html` ou
  `excluir-dados/index.html`
- nao adicione dependencias sem necessidade clara
- nao carregue bibliotecas de terceiros no critical path
  quando o projeto ja tem alternativa local
- mantenha `robots.txt`, `sitemap.xml` e `llms.txt`
  semanticamente alinhados
- gere sempre os feeds separados (`meta_catalog_feed.csv` e `tiktok_generic_catalog_feed.csv`) a cada build usando `scripts/generate_feeds.py`
- mantenha IDs de pixel e feeds unificados (unaccented uppercase) para correspondência perfeita de dados. No TikTok, use o fallback de frete 'Not applicable' e inclua 'id'/'condition' no feed.

────────────────────────────────────────

## ◬ Ordem De Investigacao

Para bugs de runtime:

1. `src/layouts/Base.astro`
2. pagina em `src/pages/`
3. componente importado em `src/components/`
4. dados em `src/data/`
5. assets em `public/` ou `src/assets/`
6. functions em `functions/`
7. build em `dist/`
8. Cloudflare Pages/Wrangler config
9. service worker/cache
10. teste reproduzivel

Rotas legais canonicas e unicas para Meta/App Review:

```text
/privacy/
/terms/
/excluir-dados/
```

Todas as rotas legadas duplicadas (/legal/, /privacidade/, /termos/, /seguranca/) foram completamente removidas para garantir correspondencia 1-para-1 com o painel da Meta.

O callback tecnico de exclusao de dados e `/api/meta/data-deletion`.
Ele valida `signed_request` no server-side e nao substitui a pagina
publica `/excluir-dados/`.

Embedded Signup canonico:

```text
Configuration ID publico: 1322930417561011
Fonte Astro: src/data/config.json -> integrations.meta.login_configuration_id
Browser: FB.login({ config_id, response_type: "code", override_default_response_type: true })
Adapter: POST /api/meta/embedded-signup
```

Nao confundir Configuration ID com App ID. Nao trocar authorization code no
browser e nao enviar `scope` paralelo ao `FB.login` sem nova validacao atual da
Meta.

Graph API para adapters Meta permanece fixa em `v25.0`.
Nao reintroduzir override para `v26.0` por variavel de ambiente sem
decisao explicita.

Webhook publico atual:

```text
/api/meta-webhook
```

Contrato minimo:

- GET valida `hub.verify_token` e retorna `hub.challenge` puro
- POST valida `X-Hub-Signature-256` quando `META_APP_SECRET` existe
- POST classifica `messages.value.statuses` como `statuses`
- POST suporta campos assinados de templates, qualidade, flows,
  capability, status business e account alerts

Rotas de demonstracao para App Review:

```text
/api/whatsapp/send
/api/whatsapp/templates
/api/health/meta
```

`send` e `templates` exigem Bearer interno via `META_REVIEW_DEMO_SECRET`.

────────────────────────────────────────

## ⨷ Performance

Contratos atuais:

- header logo e LCP usam asset estatico em `public/assets/`
- hero da home usa `/logo_transp.png` com dimensoes explicitas
  e prioridade de carregamento
- icones usam subset local de `data-lucide`
- Google Fonts usa stylesheet nao bloqueante,
  sem preload redundante
- `manifest.webmanifest` deve existir
- service worker nao deve interceptar `/_astro`,
  `/_image`, `/src` ou `/api`

────────────────────────────────────────

## ⍟ Estilo De Resposta

Responda em Portugues do Brasil.

Cubra naturalmente:

- o que foi encontrado
- o que mudou
- como validar
- risco residual

Nao force relatorio longo quando uma resposta curta resolve.

Em alteracoes visuais, preserve o ticker editorial do topo da home,
mantenha azul restrito ao bloco Meta, utilize `#e0ff00` como a cor `--neo-acid` global
e preserve o busto 3D de papel (`/assets/neo-3d-paper.gif` ou `.webp`) com sua sombra
de piso eliptica na base, sem recriar halos/sombras atras da cabeca ou conteineres circulados.

O ticker do topo e um letreiro de noticias operacionais atuais.
Use-o para mostrar o que esta em andamento agora:
App Review Meta, Meta Tech Provider, WhatsApp Business,
Graph API, webhooks e NEØ Growth System.
Nao transforme em tutorial, copy generica ou promessa futura sem lastro.

```text
────────────────────────────
GEMINI · NΞØ FlowOFF Landing
────────────────────────────
```
