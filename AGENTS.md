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
- **Rastreamento de Pixels:** Meta Pixel ID (`2051453138833455`) e TikTok Pixel ID (`D9IQURBC77U84G6G883G`) são carregados em `src/layouts/Base.astro` a partir de `src/data/config.json`. Eventos do funil de conversão (`ViewContent`, `InitiateCheckout`, `CompletePayment`/`Purchase`) nas rotas dinâmicas de planos e serviços são disparados via tags de script inline no cliente.
- **Safe Page Legada Removida:** `middleware.js` foi removido deste checkout. Não reativar fluxo de crawler/safe-page, renderização condicional por User-Agent ou proxy silencioso sem decisão explícita de arquitetura e revisão de compliance.
- **WhatsApp do Agent & Rastreamento UTM:** O contato oficial ativo é o **`+55 62 8270-5594`** (formato limpo `https://wa.me/556282705594`). Todos os CTAs externos de WhatsApp e links de conversão DEVEM conter parâmetros UTM explícitos no corpo da mensagem ou query string (ex: `[utm:home-hero]`, `[utm:checkout-<slug>]`, `[utm:servicos-custom]`) para rastreabilidade no CRM.
- **App Homologado Meta NEØFLW ENGINE:one:** O aplicativo oficial da agência na Meta é o **`NEØFLW ENGINE:one`** (App ID `1500002841696407`), homologado com renovação anual de acesso a dados concluída. O asset visual oficial é `public/assets/EngineOne.png`.
- **Instagram Business API:** Configurado sob o mesmo App ID com a conta empresarial `17841408872279531` e Business ID `227957544965390`. Token mapeado como `INSTAGRAM_TOKEN` no `.env`.
- **URLs para aprovação Meta:** para submissão/App Review use estritamente as rotas Astro
  públicas `https://neoflowoff.agency/privacy/`,
  `https://neoflowoff.agency/terms/` e
  `https://neoflowoff.agency/excluir-dados/`. As rotas legadas duplicadas
  (`/privacidade/`, `/legal/`, `/termos/`, `/seguranca/`) foram completamente removidas
  para eliminar ruído e garantir correspondência 1-para-1 com o App Dashboard da Meta.
  O caminho `/api/meta/data-deletion` é callback técnico, não página pública.
- **HTMLs legais legados removidos da raiz:** os arquivos
  `privacy/index.html`, `legal/index.html` e `excluir-dados/index.html`
  foram removidos para evitar ambiguidade auditável. Não recriar HTML
  estático paralelo nesses caminhos; a fonte correta é `src/pages/*.astro`.

---

## 3. Arquitetura de Conversão & Checkout
- **Rotas de Catálogo e Produtos:**
  - **Catálogo Unificado em `/servicos/`:** Hub visual com filtros dinâmicos de categoria e selos de tecnologia.
  - **Página Institucional em `/sobre/`:** Manifesto, engenharia comercial, founder Neø Mello e busto 3D de papel.
  - **Planos (Pacotes Completos) em `/planos/<slug>`:** Ex: `/planos/agente-sdr`, `/planos/agents-ia`, `/planos/crm-inteligente`.
  - **Checkouts (Serviços Unitários) em `/checkout/<slug>`:** Ex: `/checkout/api-whatsapp`, `/checkout/app-meta`, `/checkout/webapp-lp`.
- **Catálogo Publicado:** `src/data/catalog.json` alimenta a home e as rotas dinâmicas do site. Seus IDs devem ser limpos e sem acentos (ex: `SERVICO-API-WHATSAPP`) para coincidir 100% com o pixel.
- **Catálogo Canônico Soberano:** `~/neomello/_standards/services_canonical.json` é a fonte soberana global do operador com todas as especificações técnicas, preços e escopos. Dev agents podem lê-lo para contexto cruzado, mas não devem editá-lo sem ordem explícita.
- **Feeds Separados (Meta e TikTok):** Gerados a cada build via `python3 scripts/generate_feeds.py`.
  - **Meta Commerce Manager:** `public/meta_catalog_feed.csv` formatado nas especificações do Commerce Manager com UTM tags.
  - **TikTok Ads Manager:** `public/tiktok_generic_catalog_feed.csv` formatado para Generic Catalog (*Other products and services*), usando *E-commerce Industry* e *Shipping: Not applicable* como fallback de homologação. Contém `id`, `condition` e UTM tags.
- **Checkout/FlowPay Legado:** `js/payment.js` ainda existe com lógica
  de UTM, DataLayer e fallback de API, mas não há rota ativa de
  cobrança neste checkout Astro. Antes de prometer PIX, cobrança ou
  `/api/create-charge-landing`, verificar se a rota é servida por
  outro nó do ecossistema ou por integração externa.
- **Embedded Signup Meta:** `functions/api/meta/embedded-signup.js`
  existe apenas como adapter server-side para receber o authorization
  code do browser e encaminhar para o backend soberano
  `neo-provider-messaging`. Se o forward não existir, deve falhar
  fechado e a UI não deve exibir sucesso. Este repositório não deve
  trocar code na Graph API, armazenar token, criar vault KV de conexões
  Meta ou persistir `authorization_code`.
- **Facebook Login for Business:** o Configuration ID publico canonico e
  `1322930417561011`. A fonte consumida pelo Astro e
  `src/data/config.json` em
  `integrations.meta.login_configuration_id`. A pagina
  `/conectar-whatsapp/` deve passar esse valor como `data-meta-config-id`
  e `src/scripts/meta-signup.ts` deve chamar `FB.login` com
  `config_id`, `response_type: 'code'` e
  `override_default_response_type: true`. Nao enviar `scope` paralelo sem
  nova validacao explicita no painel/docs da Meta.
- **Validação de Display Name (Nome de Exibição WABA):** Antes de iniciar o
  `FB.login` na página `/conectar-whatsapp/`, o nome inserido pelo cliente
  deve ser estritamente validado no front-end para evitar suspensões automáticas
  e rejeições da WABA (erro #2388138). As regras aplicadas são:
  - Permite apenas letras sem acento (A-Z, a-z), números (0-9) e espaços (`/^[a-zA-Z0-9 ]+$/`). Bloqueia qualquer caractere especial, acento ou emoji (como `Ø`, `ø`, `/`, `@`, etc.).
  - Bloqueia nomes totalmente em letras maiúsculas (all-caps).
  - Bloqueia palavras proibidas como `atendimento`, `teste`, `suporte`, `waba`, `temp`, `homologacao`, `admin`, `wpp` (case-insensitive).
- **Data Deletion Meta:** `functions/api/meta/data-deletion.js`
  é callback server-side para `signed_request` da Meta. Deve validar
  HMAC SHA-256 com `META_APP_SECRET`, nunca logar segredo ou
  `signed_request` completo, e retornar URL pública em `/excluir-dados`
  com `confirmation_code`.
- **Webhook Meta:** `functions/api/meta-webhook.js` não é mais o callback
  canônico. Ele deve responder como rota legada/migrada e apontar para
  `https://whatsapp.neoflowoff.agency/webhook`. O webhook público de
  App Review pertence ao `neo-provider-messaging`.
- **Rotas de demonstração Meta:** `/api/whatsapp/send` e
  `/api/whatsapp/templates` não devem chamar Graph API a partir do
  landing. Envio, templates e operações WhatsApp pertencem ao
  `neo-provider-messaging`.
- **Segurança de API:** Nenhuma credencial ou token privado
  (`FLOWPAY_INTERNAL_API_KEY`, `META_APP_SECRET`, chaves OpenAI, etc.) deve ser exposta
  no front-end. Qualquer cobrança real deve passar por backend
  autoritativo fora do bundle estático.

---

## 4. Runtime Atual Astro + Cloudflare

- A fonte principal é `src/pages`, `src/components`,
  `src/layouts`, `src/styles` e `src/data`.
- Rotas públicas como `/privacy/`, `/terms/` e `/excluir-dados/` são geradas por
  Astro a partir de `src/pages`. Diretórios HTML homônimos na raiz do
  projeto não são fonte de publicação e não devem ser reintroduzidos.
- A única superfície server-side local atual é `functions/`,
  deployada como Cloudflare Pages Functions.
- Não crie helpers, bibliotecas ou módulos compartilhados dentro de
  `functions/`, porque Cloudflare Pages gera rotas por estrutura de
  arquivos. Código server-side compartilhado deste checkout deve viver
  em `src/server/`; `functions/` deve conter apenas endpoints reais.
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

## 6. Superfícies Públicas, SEO e AEO

- `public/llms.txt` deve ser Markdown com H1 e links públicos apontando para `/NEO_PROTOCOL.md`.
- `NEO_PROTOCOL.md` na raiz define a topologia canônica do nó Neo Protocol.
- `public/sitemap.xml` deve listar todas as 21 rotas públicas reais sincronizadas.
- `public/robots.txt` deve estar semanticamente alinhado ao sitemap, `llms.txt` e crawlers de IA.
- Marcação Schema.org JSON-LD obrigatória em todas as páginas com `@graph` estruturado.
- As superfícies legais públicas são `/privacy/`, `/terms/` e `/excluir-dados/`.
  `/api/meta/data-deletion` é callback de API para a Meta.
- Rotas públicas de produto incluem `/servicos/`, `/sobre/`, `/planos/<slug>/`
  e `/checkout/<slug>/`.
- Nunca publicar segredos, critérios internos, fluxos privados,
  exceções comerciais ou credenciais nessas superfícies.

---

## 7. Identidade Visual

- Azul fica restrito ao trecho Meta no topo.
- Demais seções usam acid, cinza, preto e branco.
- **Cor Acid Oficial:** A variável global `--neo-acid` é `#e0ff00` (Amarelo Ácido / Chartreuse Neon) e `--neo-acid-ink` é `#560`. Todos os glows, bordas e badges devem acompanhar essa tonalidade.
- **Busto 3D Origami do Founder:** O elemento visual na seção *Sobre a Agência* é o busto 3D de papel (`/assets/neo-3d-paper.gif` ou `neo-3d-paper.webp`), exibido em escala ampliada (`clamp(180px, 25vw, 240px)`). A sustentação 3D provém exclusivamente de uma sombra de chão elíptica na base (`::before`). Não recriar contêineres circulados antigos, selos/pontos acid laterais nem auras/sombras difusas atrás da cabeça/corpo.
- Ajustes visuais devem preservar contraste suficiente.
- O ticker `TOP TELENOTÍCIAS` no topo da home é elemento editorial
  existente e deve ser preservado, salvo pedido explícito de remoção.
  Ele funciona como letreiro de notícias operacionais atuais sobre o que
  a neoflowoff.agency está trabalhando no momento. Atualize com fatos
  vivos e auditáveis, como App Review Meta, Meta Tech Provider,
  WhatsApp Business, Graph API, webhooks e NEØ Growth System. Não use
  esse espaço para tutorial, copy genérica, promessa futura sem lastro
  ou explicação de funcionalidade.
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
node --test tests/data-deletion-and-ssr.test.js tests/embedded-signup-storage.test.js tests/meta-webhook.test.js
```

Se `pnpm exec astro check` falhar por erro interno do language server,
registre a falha e não declare typecheck aprovado.
