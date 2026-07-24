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

`functions/` nao e backend autoritativo de produto.
Use apenas para adapters server-side estreitos, como o
Embedded Signup da Meta, sem expor secrets ao navegador.

────────────────────────────────────────

## ◬ Estilo

- preserve a arquitetura existente
- altere o menor conjunto de arquivos
- nao adicione dependencias se o projeto ja resolve localmente
- evite `console.log` no codigo final
- preserve contraste acessivel
- mantenha azul apenas no bloco Meta do topo
- use acid, cinza, preto e branco nas demais secoes

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
```

Se uma validacao falhar por ambiente,
diga exatamente qual comando falhou
e qual risco fica pendente.

```text
────────────────────────────
CLAUDE · NΞØ FlowOFF Landing
────────────────────────────
```
