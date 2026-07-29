<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# Diretrizes e Instruções de Desenvolvimento para Agentes (AGENTS.md)

```text
========================================
          AGENTS · NEO-FLW-LANDING
========================================
Status: ACTIVE
Runtime: Astro static site + Cloudflare Pages Functions
Deploy: Cloudflare Pages
========================================
```

Este arquivo descreve as regras operacionais, de infraestrutura
e padrões de desenvolvimento específicos do repositório
`neo-flw-landing`.

Qualquer agente que atuar neste repositório DEVE seguir estas regras.

---

## 1. Regras do Monorepo e pnpm
- **Instalação Isolada:** Este repositório faz parte do monorepo da `NEO-FlowOFF` (que possui outros 11 projetos). **Nunca** execute `pnpm install` globalmente ou comandos de instalação sem filtro, pois isso atualizará e quebrará dependências de outros projetos (como `/ceo-escalavel-miniapp`).
- **Comando Correto:** Use sempre `pnpm install --filter .` (mapeado no `make install`).
- **Bypass de EPERM:** Se o comando global do pnpm falhar com erro
  de permissão (devido ao corepack/mise), execute as ferramentas
  instaladas diretamente do `node_modules`.
  Para CSS, use `./node_modules/.bin/stylelint`.
- **Child Repo Soberano:** alterações de produto pertencem a este
  repositório. Não mova código para o workspace raiz e não altere
  manifests globais sem pedido explícito.

---

## 2. Regras de Negócio e Integração Meta (Decisões Congeladas)
- **Verificação de Domínio Meta:** O token ativo é `zq0xygs8v9s714m5039mijjh0wowyj`. Ele é carregado em `src/layouts/Base.astro` a partir de `src/data/config.json` e deve permanecer no `<head>` das rotas Astro.
- **Safe Page Legada Removida:** `middleware.js` foi removido deste checkout. Não reativar fluxo de crawler/safe-page, renderização condicional por User-Agent ou proxy silencioso sem decisão explícita de arquitetura e revisão de compliance.
- **WhatsApp do Agent:** O contato oficial ativo é o **`+55 62 9478-9032`**. Em links de redirecionamento, use estritamente o formato internacional limpo: `https://wa.me/556294789032` (sem o caractere `+`).
- **URLs para aprovação Meta:** para submissão/App Review use as rotas Astro
  públicas `https://neoflowoff.agency/privacy/`,
  `https://neoflowoff.agency/terms/` e
  `https://neoflowoff.agency/excluir-dados/`. As rotas em português
  `/privacidade/`, `/legal/`, `/termos/` e `/seguranca/` permanecem como
  superfícies públicas equivalentes para usuários. O caminho
  `/api/meta/data-deletion` é callback técnico, não página pública.
- **HTMLs legais legados removidos da raiz:** os arquivos
  `privacy/index.html`, `legal/index.html` e `excluir-dados/index.html`
  foram removidos para evitar ambiguidade auditável. Não recriar HTML
  estático paralelo nesses caminhos; a fonte correta é `src/pages/*.astro`.

---

## 3. Arquitetura de Conversão & Checkout
- **Links da Planilha (`neo-digital-assets-book`):** Os serviços oferecidos no ecossistema estão divididos semanticamente em duas categorias de rotas:
  - **Planos (Pacotes Completos) em `/planos/<slug>`:** Ex: `/planos/agente-sdr`, `/planos/agents-ia`, `/planos/crm-inteligente`.
  - **Checkouts (Serviços Unitários) em `/checkout/<slug>`:** Ex: `/checkout/api-whatsapp`, `/checkout/app-meta`, `/checkout/webapp-lp`.
- **Catálogo Publicado:** `src/data/catalog.json` alimenta a home e as rotas dinâmicas. `drafts/catalog_v2026_2.json` é insumo canônico do operador e não deve ser editado sem pedido explícito.
- **Checkout/FlowPay Legado:** `js/payment.js` ainda existe com lógica
  de UTM, DataLayer e fallback de API, mas não há rota ativa de
  cobrança neste checkout Astro. Antes de prometer PIX, cobrança ou
  `/api/create-charge-landing`, verificar se a rota é servida por
  outro nó do ecossistema ou por integração externa.
- **Embedded Signup Meta:** `functions/api/meta/embedded-signup.js`
  existe apenas como adapter server-side para receber o authorization
  code do browser. Ele deve encaminhar para backend soberano ou usar
  storage seguro configurado; se storage/forward não existir, deve
  falhar fechado e a UI não deve exibir sucesso.
- **Facebook Login for Business:** o Configuration ID publico canonico e
  `1322930417561011`. A fonte consumida pelo Astro e
  `src/data/config.json` em
  `integrations.meta.login_configuration_id`. A pagina
  `/conectar-whatsapp/` deve passar esse valor como `data-meta-config-id`
  e `src/scripts/meta-signup.ts` deve chamar `FB.login` com
  `config_id`, `response_type: 'code'` e
  `override_default_response_type: true`. Nao enviar `scope` paralelo sem
  nova validacao explicita no painel/docs da Meta.
- **Data Deletion Meta:** `functions/api/meta/data-deletion.js`
  é callback server-side para `signed_request` da Meta. Deve validar
  HMAC SHA-256 com `META_APP_SECRET`, nunca logar segredo ou
  `signed_request` completo, e retornar URL pública em `/excluir-dados`
  com `confirmation_code`.
- **Segurança de API:** Nenhuma credencial ou token privado
  (`FLOWPAY_INTERNAL_API_KEY`, `META_APP_SECRET`, chaves OpenAI, etc.) deve ser exposta
  no front-end. Qualquer cobrança real deve passar por backend
  autoritativo fora do bundle estático.

---

## 4. Runtime Atual Astro + Cloudflare

- A fonte principal é `src/pages`, `src/components`,
  `src/layouts`, `src/styles` e `src/data`.
- Rotas públicas como `/privacy/`, `/terms/`, `/legal/`,
  `/privacidade/`, `/termos/`, `/seguranca/` e `/excluir-dados/` são geradas por
  Astro a partir de `src/pages`. Diretórios HTML homônimos na raiz do
  projeto não são fonte de publicação e não devem ser reintroduzidos.
- A única superfície server-side local atual é `functions/`,
  deployada como Cloudflare Pages Functions.
- `dist/` é artefato de build e não deve ser editado como fonte.
- `wrangler.jsonc` versiona `pages_build_output_dir: "./dist"`.
- Deploy local usa `make deploy`.
- Git deploy da Cloudflare Pages ainda precisa de build command
  `pnpm run build` e output directory `dist` no dashboard.

---

## 5. Performance e Assets

- Não carregar `lucide.min.js` de CDN.
- Ícones `data-lucide` usam subset SVG local em `Base.astro`.
- Logo LCP do header deve usar asset estático em `public/assets/`,
  `loading="eager"` e `fetchpriority="high"`.
- A hero da home usa `public/logo_transp.png` como imagem principal.
  Preserve `width`, `height`, `loading="eager"`, `decoding="async"`
  e `fetchpriority="high"` quando ajustar esse bloco.
- Imagens em `src/assets` devem ser importadas em arquivos Astro e,
  quando usadas com `<img>`, devem passar `src={asset.src}`,
  `width={asset.width}` e `height={asset.height}`. URLs públicas
  em JSON, catálogo, OG, sitemap ou HTML direto devem apontar para
  `public/` via caminho público (`/assets/...`, `/logo_transp.png`),
  nunca para `/src/assets/...` ou `/public/...`.
- Evitar `astro:assets` para imagens que gerem tráfego `/_image`
  em produção.
- Google Fonts usa `preconnect` e stylesheet não bloqueante.
  Não adicionar preload redundante para essa URL.
- Google Analytics usa Cloudflare Google Tag Gateway first-party.
  O script global em `Base.astro` deve carregar
  `/n4py/gtag/js?id=G-EQRKXQD7FW`, não
  `https://www.googletagmanager.com/gtag/js?id=G-EQRKXQD7FW`,
  enquanto a zona Cloudflare retornar Google Tag Gateway ativo com
  endpoint `/n4py`, `measurementId=G-EQRKXQD7FW`,
  `hideOriginalIp=true` e `setUpTag=false`.
- `public/manifest.webmanifest` deve existir para evitar 404.
- `public/sw.js` deve ignorar `/_astro`, `/_image`, `/src` e `/api`.

---

## 6. Superfícies Públicas para Agentes

- `public/llms.txt` deve ser Markdown com H1 e links públicos.
- `public/sitemap.xml` deve listar apenas rotas públicas reais.
- `public/robots.txt` deve estar semanticamente alinhado ao sitemap
  e ao `llms.txt`.
- As superfícies legais públicas são `/privacy/`, `/terms/`,
  `/legal/`, `/privacidade/`, `/termos/`, `/seguranca/` e `/excluir-dados/`.
  `/api/meta/data-deletion` é callback de API para a Meta.
- Rotas públicas de produto incluem `/planos/<slug>/`
  e `/checkout/<slug>/`.
- Nunca publicar segredos, critérios internos, fluxos privados,
  exceções comerciais ou credenciais nessas superfícies.

---

## 7. Identidade Visual

- Azul fica restrito ao trecho Meta no topo.
- Demais seções usam acid, cinza, preto e branco.
- Ajustes visuais devem preservar contraste suficiente.
- O ticker `TOP TELENOTÍCIAS` no topo da home é elemento editorial
  existente e deve ser preservado, salvo pedido explícito de remoção.
- O selo `OPERAÇÃO PRINCIPAL` em card bege deve manter contraste
  alto; não usar texto verde acid diretamente sobre bege claro.
- Logo steel do footer vem de `src/assets/images/steel_flw.webp`.

---

## 8. Validação

Use a validação proporcional ao risco:

```bash
pnpm run build
./node_modules/.bin/stylelint 'src/styles/**/*.css'
node --check public/sw.js
xmllint --noout public/sitemap.xml
node --test tests/data-deletion-and-ssr.test.js
```

Se `pnpm exec astro check` falhar por erro interno do language server,
registre a falha e não declare typecheck aprovado.
