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

O projeto publica uma vitrine estatica de servicos,
planos e rotas de conformidade para trafego pago,
busca, crawlers e agentes de IA.

────────────────────────────────────────

## ⟠ Contrato

- child repo soberano dentro do workspace `NEO-FlowOFF`
- frontend estatico em Astro
- adapter server-side minimo em `functions/`
- catalogo publicado em `src/data/catalog.json`
- textos de interface em `src/data/ui_texts.json`
- build de producao em `dist/`
- deploy em Cloudflare Pages via Wrangler
- superficies publicas para agentes em `public/llms.txt`,
  `public/robots.txt` e `public/sitemap.xml`

Nao trate este repositorio como backend autoritativo.

Credenciais, cobrancas, webhooks e dados privados devem
ficar fora do bundle publico.

Excecao atual: `functions/api/meta/embedded-signup.js` recebe o
authorization code do Embedded Signup e deve falhar fechado quando
nao houver backend soberano ou storage seguro configurado.

────────────────────────────────────────

## ⧉ Stack

```text
Astro                 static site generator
TypeScript            Astro/component scripts
CSS                   src/styles/global.css
Icons                 local data-lucide SVG subset
Fonts                 Figtree + DM Mono via Google Fonts
PWA                   public/manifest.webmanifest + public/sw.js
Hosting               Cloudflare Pages
Serverless            Cloudflare Pages Functions
Deploy CLI            wrangler
```

O projeto nao usa mais HTML/CSS vanilla como fonte principal,
nem carrega `lucide.min.js` de CDN no caminho critico.

────────────────────────────────────────

## ⧇ Estrutura

```text
neo-flw-landing/
├── src/
│   ├── components/          # HubHeader, ProductCard, chips
│   ├── data/                # catalogo, config e textos
│   ├── layouts/             # Base Astro compartilhado
│   ├── pages/               # home, planos, checkout, compliance
│   └── styles/              # design system global
├── public/
│   ├── assets/              # assets estaticos otimizados
│   ├── llms.txt             # mapa publico para agentes
│   ├── manifest.webmanifest # PWA manifest
│   ├── robots.txt           # politica crawler
│   ├── sitemap.xml          # rotas publicas
│   └── sw.js                # service worker conservador
├── functions/
│   └── api/meta/            # adapter Embedded Signup
├── drafts/                  # insumos canonicos do operador
├── docs/                    # documentacao de suporte
├── wrangler.jsonc           # output Cloudflare Pages
└── Makefile                 # comandos locais
```

────────────────────────────────────────

## ◬ Rotas

```text
/                         home
/planos/[slug]/           planos completos
/checkout/[slug]/         servicos unitarios publicos
/conectar-whatsapp/       contexto de conexao WhatsApp
/privacy/                 privacy policy
/privacidade/             alias pt-BR
/legal/                   termos
/terms/                   alias EN
/excluir-dados/           exclusao de dados
/data-deletion/           alias EN
```

As rotas de `planos` e `checkout` sao geradas a partir de
`src/data/catalog.json`.

────────────────────────────────────────

## ⨷ Comandos

```bash
make install
make dev
make build
make deploy
```

Comandos diretos equivalentes:

```bash
pnpm run dev
pnpm run build
pnpm exec wrangler pages deploy dist --project-name=neoflowoff-agency
```

No Git deploy da Cloudflare Pages,
configure o dashboard com:

```text
Build command: pnpm run build
Output dir: dist
```

`wrangler.jsonc` declara `pages_build_output_dir: "./dist"`,
mas nao substitui o comando de build quando o dashboard
esta configurado para pular build.

────────────────────────────────────────

## ⍟ Validacao

Antes de publicar:

```bash
pnpm run build
./node_modules/.bin/stylelint 'src/styles/**/*.css'
node --check public/sw.js
xmllint --noout public/sitemap.xml
```

`pnpm exec astro check` pode falhar neste checkout por problema
interno do language server/TypeScript.

Quando isso ocorrer, nao declare typecheck como aprovado;
registre a falha e use `pnpm run build` como validacao minima.

────────────────────────────────────────

## ◯ Identidade Visual

- azul fica restrito ao bloco Meta no topo
- demais secoes usam acid, cinza, preto e branco
- cards devem manter contraste AA quando possivel
- logo principal do header vem de `public/assets/`
- logo steel do footer vem de `src/assets/images/steel_flw.webp`

────────────────────────────────────────

## ⦿ Referencias

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
