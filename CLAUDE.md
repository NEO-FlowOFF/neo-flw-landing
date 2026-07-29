<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# CLAUDE.md

```text
========================================
          CLAUDE · AGENT GUIDE
========================================
Repo: neo-flw-landing
Mode: surgical product edits
========================================
```

Guia rapido para agentes trabalhando neste repositório.

Responda ao operador em Portugues do Brasil.
Seja direto, tecnico e honesto sobre o que foi verificado.

────────────────────────────────────────

## ⟠ Comandos

Use o `Makefile` local.

```bash
make install
make dev
make build
make deploy
```

Equivalentes importantes:

```bash
pnpm run dev
pnpm run build
./node_modules/.bin/stylelint 'src/styles/**/*.css'
pnpm exec wrangler pages deploy dist --project-name=neoflowoff-agency
```

Nao rode `pnpm install` sem filtro neste workspace.
Use `make install`, que executa `pnpm install --filter .`.

────────────────────────────────────────

## ⧉ Runtime

O projeto atual e Astro estatico com uma camada minima de
Cloudflare Pages Functions para adapter Meta.

Nao trate `index.html`, `landing_v2.css`, `css/`,
`js/payment.js` ou rotas HTML antigas como fonte principal
sem verificar se ainda sao importadas ou servidas.

Os HTMLs legais legados da raiz foram removidos e nao devem ser
recriados:

```text
privacy/index.html
legal/index.html
excluir-dados/index.html
```

As paginas corretas para essas URLs vivem em `src/pages/`.

Fonte principal:

```text
src/pages/
src/components/
src/layouts/Base.astro
src/styles/global.css
src/data/
public/
functions/
```

Rotas legais canonicas para aprovacao Meta:

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

`functions/` nao e backend autoritativo de produto.
Use apenas para adapters server-side estreitos, como o
Embedded Signup e o callback Meta Data Deletion, sem expor secrets
ao navegador. O callback tecnico e `/api/meta/data-deletion`; nao
recrie a pagina Astro legada `/data-deletion/`.

O Embedded Signup publico usa Facebook Login for Business Configuration ID
`1322930417561011` em `src/data/config.json`. Esse ID e publico e diferente do
App ID. O script `src/scripts/meta-signup.ts` deve chamar `FB.login` com
`config_id`, `response_type: 'code'` e
`override_default_response_type: true`, sem `scope` paralelo enquanto a
configuracao do Login for Business for canonica.

────────────────────────────────────────

## ◬ Estilo

- preserve a arquitetura existente
- altere o menor conjunto de arquivos
- nao adicione dependencias se o projeto ja resolve localmente
- evite `console.log` no codigo final
- preserve contraste acessivel
- mantenha azul apenas no bloco Meta do topo
- use acid, cinza, preto e branco nas demais secoes
- preserve o ticker editorial `TOP TELENOTICIAS` no topo da home,
  salvo pedido explicito de remocao
- nao use texto acid diretamente sobre bege claro; o selo
  `OPERACAO PRINCIPAL` deve permanecer em alto contraste
- a hero da home usa `/logo_transp.png` no lugar do titulo textual

O projeto usa varios estilos inline em componentes Astro.
Nao aplique uma regra antiga de "zero inline style"
sem antes combinar uma refatoracao de design system.

────────────────────────────────────────

## ⍟ Dados

`src/data/catalog.json` alimenta as rotas publicadas.

`drafts/catalog_v2026_2.json` e insumo canonico do operador.
Nao edite esse draft sem pedido explicito.

Ao mexer em produtos,
confirme home, rotas dinamicas, `sitemap.xml`
e `llms.txt`.

────────────────────────────────────────

## ⨷ Qualidade

Validacao minima:

```bash
pnpm run build
```

Validacoes focadas:

```bash
./node_modules/.bin/stylelint 'src/styles/**/*.css'
node --check public/sw.js
xmllint --noout public/sitemap.xml
node --test tests/data-deletion-and-ssr.test.js
```

Se uma validacao falhar por ambiente,
diga exatamente qual comando falhou
e qual risco fica pendente.

```text
────────────────────────────
CLAUDE · NΞØ FlowOFF Landing
────────────────────────────
```
