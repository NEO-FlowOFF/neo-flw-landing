<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# NEXTSTEPS.md — Roadmap Operacional & Checklist de Engenharia

```text
============================================================
              NEO-FLW-LANDING · ROADMAP & STATUS
============================================================
Status: ATIVO & SINCRONIZADO
Runtime: Astro static + Cloudflare Pages Functions + FlowPay
Domínio Canônico: https://neoflowoff.agency
Última Atualização: 2026-08-23
============================================================
```

Este documento registra o status auditável de cada trilha do ecossistema `neo-flw-landing`,
separando o que já foi **concluído e publicado**, o que está em **propagação/monitoramento**
e os **próximos passos de arquitetura**.

---

## Legenda de Status
- `[x]` **CONCLUÍDO / DEPLOYADO:** Implementado, testado e em produção na Cloudflare Pages.
- `[•]` **EM MONITORAMENTO / PROPAGAÇÃO:** Deployado em produção; aguardando telemetria dos painéis de terceiros (Meta / TikTok).
- `[ ]` **BACKLOG / PRÓXIMO PASSO:** Especificado e pronto para ciclo futuro de desenvolvimento.

---

## 1. Trilha de Ads, Pixels & Feeds de Catálogo

- [x] **1.1. Feeds Automatizados de Catálogo (Meta & TikTok):**
  - Script [`scripts/generate_feeds.py`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/scripts/generate_feeds.py) executado a cada build.
  - Meta Commerce Manager Feed: [`public/meta_catalog_feed.csv`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/public/meta_catalog_feed.csv) formatado com `fb_product_category: 503254` e `google_product_category: 503254` (`Business & Industrial > Business Services`).
  - TikTok Ads Generic Catalog Feed: [`public/tiktok_generic_catalog_feed.csv`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/public/tiktok_generic_catalog_feed.csv) com fallback de frete *Not applicable*, `condition: new` e `id` canônico.
- [x] **1.2. Auditoria e Resolução do Relatório de Erros da Meta:**
  - Inspecionado [`docs/full_errors_for_feed_upload-2026-08-22-135700.xlsx`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/docs/full_errors_for_feed_upload-2026-08-22-135700.xlsx).
  - 0 erros bloqueantes no Commerce Manager; avisos de categoria textual sanados com o ID numérico `503254`.
- [x] **1.3. Correção de Diagnóstico Crítico do TikTok Pixel:**
  - Inclusão do parâmetro `content_id` no **nível raiz** do payload do `ttq.track` com o ID Canônico do Catálogo (`SERVICO-...` / `PLANO-...`).
  - Ativação de cookies primários (`ttq.enableCookie()`) no snippet global do [`src/layouts/Base.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/layouts/Base.astro) para Advanced Matching.
  - Implementação dos eventos completos do funil: `ViewContent` (ao carregar), `AddToCart` e `InitiateCheckout` (ao clicar em Pagar via PIX), e `CompletePayment` / `Purchase` (ao clicar no WhatsApp de fechamento).
- [•] **1.4. Monitoramento da Telemetria TikTok & Meta Events Manager:**
  - Aguardar a janela de propagação dos novos eventos disparados em `neoflowoff.agency` para confirmação da queda das sinalizações de diagnóstico no painel do TikTok Ads.

---

## 2. Trilha de Checkout & Pagamentos FlowPay

- [x] **2.1. Conexão Direta dos 12 Checkouts Compartilháveis FlowPay:**
  - Links cadastrados em [`src/data/catalog.json`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/data/catalog.json) no campo `flowpay_url`.
  - Botão primário `.detail-action--primary` em `/checkout/<slug>` e `/planos/<slug>` adaptado para abrir o checkout seguro da FlowPay em nova aba (`target="_blank"`), disparando `AddToCart` e `InitiateCheckout`.
- [x] **2.2. Botão de Ativação PIX no Access Gate:**
  - Inclusão do botão `Adquirir Chave de Ativação via PIX (FlowPay)` no `#access-gate-block` da página [`/conectar-whatsapp/`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/conectar-whatsapp.astro) apontando para o checkout `https://app.flowpay.cash/checkout/8ab89a0712f3d6fb`.
- [ ] **2.3. Webhook de Conciliação Server-Side FlowPay (Próximo Passo):**
  - Implementar endpoint autoritativo (ex: `functions/api/flowpay/webhook.js` encaminhando para o backend de mensageria) que recebe a confirmação de pagamento PIX e emite automaticamente a chave assinada (`flw_auth_<uuid>`) por e-mail/WhatsApp para o cliente.

---

## 3. Trilha de Gate de Acesso & Conector WhatsApp WABA

- [x] **3.1. Access Gate em `/conectar-whatsapp/`:**
  - Bloqueio por padrão (`#access-gate-block`).
  - Leitura automática de query params (`?auth=...`, `?token=...`, `?key=...`) e persistência segura em `sessionStorage`.
  - Validação estrita de formato de chave (`isValidAccessKey`) exigindo prefixo de ecossistema (`flw_`, `flow_`, `neo_`) e `length >= 10`.
- [x] **3.2. Validação Rigorosa de Display Name (Nome de Exibição WABA):**
  - Regra de validação pré-Meta no front-end bloqueando acentos, caracteres especiais, emojis, all-caps e termos proibidos (ex: `teste`, `suporte`, `admin`, `waba`), prevenindo rejeição #2388138 da Meta.
- [x] **3.3. Embedded Signup & Meta Login for Business:**
  - Config ID canônico `1322930417561011` carregado de `config.json`.
  - Adapter server-side em `functions/api/meta/embedded-signup.js` encaminhando code com política fail-closed.

---

## 4. Trilha de SEO, AEO & Posicionamento Global

- [x] **4.1. Remoção de Limitações Locais:**
  - Retiradas amarras regionais ("Goiânia") de todas as meta tags, JSON-LD Schema.org, textos da home, páginas de serviço e [`public/llms.txt`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/public/llms.txt).
  - Configuração do Schema.org com `areaServed: ["Brasil", "Global"]`.
- [x] **4.2. Resolução de Code Review Sourcery (PR #4):**
  - Correção de fallback no Access Gate, remoção de placeholder em `tiktok-shop.astro` e conformidade da hierarquia Schema.org (`ListItem.item`) em `servicos.astro`.
  - PR #4 mergeado com sucesso na branch `main`.
- [x] **4.3. Ticker Editorial `TOP TELENOTÍCIAS`:**
  - Expandido na home com 5 fatos auditáveis ativos (App Meta `NEØFLW ENGINE:one`, Tech Provider WhatsApp, Instagram Business API, TikTok Shop e Infraestrutura Comercial).

---

## 5. Trilha de Inovação & Backlog Arquitetural

- [ ] **5.1. Chat IA no Site (Drawer Inline no Menu Hambúrguer):**
  - Adotar formato `Drawer Inline` dentro do menu móvel (sem floating widget invasivo e sem afetar métricas de LCP).
  - Chamada via backend próprio para OpenAI (sem expor API key no bundle estático).
  - Handoff direto para WhatsApp comercial `+55 62 8270-5594`.
- [ ] **5.2. Instagram Business API & Direct Messages:**
  - Webhooks de mensagens diretas (DMs), menções e comentários vinculados ao App ID `1500002841696407` e conta `17841408872279531`.
  - Roteamento automatizado de leads qualificados para Agentes SDR IA.
- [ ] **5.3. Painel Autenticado SaaS (`app.neoflowoff.agency`):**
  - Especificação de autenticação, RBAC, Central de Treinamento de Agentes e monitoramento de conversas com isolamento multi-tenant.

---

## 6. Critérios de Conclusão (Definition of Done)

Para qualquer alteração futura neste repositório:
1. `pnpm run build` deve compilar 21 rotas estáticas sem erros.
2. `./node_modules/.bin/stylelint 'src/styles/**/*.css'` deve passar sem alertas de CSS.
3. Feeds de catálogo (`meta_catalog_feed.csv` e `tiktok_generic_catalog_feed.csv`) devem ser gerados com 12 itens sincronizados.
4. Suíte de testes server-side (`node --test tests/*.test.js`) deve passar 100% dos testes (11/11).
5. Deploy publicado via `make deploy` na Cloudflare Pages.

```text
────────────────────────────────────────────────────────────
NEO-FLW-LANDING · SISTEMA DE INFRAESTRUTURA & IA COMERCIAL
────────────────────────────────────────────────────────────
```
