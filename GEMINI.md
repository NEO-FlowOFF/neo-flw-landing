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
- nunca exponha secrets ou valores de `.env`
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

Rotas legais canonicas para Meta/App Review:

```text
/privacy/
/terms/
/excluir-dados/
```

Aliases publicos em Portugues:

```text
/legal/
/privacidade/
/termos/
/seguranca/
/excluir-dados/
```

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
mantenha azul restrito ao bloco Meta e verifique contraste quando
texto acid aparece sobre fundo claro.

```text
────────────────────────────
GEMINI · NΞØ FlowOFF Landing
────────────────────────────
```
