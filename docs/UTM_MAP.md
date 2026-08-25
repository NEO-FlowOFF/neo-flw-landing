<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# MAPA CANÔNICO DE RASTREAMENTO UTM (UTM_MAP.md)

```text
============================================================
           neøflow agency · TABELA DE TAGS UTM
============================================================
Contato Oficial WhatsApp: https://wa.me/556282705594
Status: ATIVO & CANÔNICO
============================================================
```

Este documento é a fonte soberana de todas as tags de rastreabilidade UTM embutidas nos links e botões de conversão via WhatsApp da **neøflow agency**.

---

## 1. Padrão de Formatação

Todos os links de WhatsApp (`wa.me`) no site devem obrigatoriamente incluir a tag de rastreamento no parâmetro `text` da mensagem no seguinte formato:

```text
[utm:<identificador_da_origem>]
```

Exemplo de URL compilada:
`https://wa.me/556282705594?text=Olá!%20Vim%20pelo%20site%20da%20neøflow%20agency.%20[utm:home-hero]`

---

## 2. Tabela Canônica de Tags UTM

| Tag UTM | Origem / Rota | Elemento / Botão | Arquivo Fonte |
| --- | --- | --- | --- |
| `[utm:home-hero]` | Home (`/`) | Botão de WhatsApp na seção Hero principal | [`src/pages/index.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/index.astro) |
| `[utm:home-closing]` | Home (`/`) | Botão de atendimento na seção de fechamento | [`src/pages/index.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/index.astro) |
| `[utm:sobre-closing]` | Sobre (`/sobre/`) | Botão de contato no manifesto / história | [`src/pages/sobre.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/sobre.astro) |
| `[utm:servicos-custom]` | Serviços (`/servicos/`) | Banner de Projetos Customizados & Enterprise | [`src/pages/servicos.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/servicos.astro) |
| `[utm:conectar-whatsapp-gate]` | Conector (`/conectar-whatsapp/`) | Solicitação de Chave com Especialista no Access Gate | [`src/pages/conectar-whatsapp.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/conectar-whatsapp.astro) |
| `[utm:tiktok-shop-creator]` | TikTok Shop (`/tiktok-shop/`) | Botão "Quero suporte para entrar" (Creators) | [`src/pages/tiktok-shop.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/tiktok-shop.astro) |
| `[utm:tiktok-shop-lojista]` | TikTok Shop (`/tiktok-shop/`) | Botão "Quero acelerar meu setup" (Lojistas) | [`src/pages/tiktok-shop.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/tiktok-shop.astro) |
| `[utm:menu-header]` | Global / Header | Botão de atendimento no Menu de Navegação (`HubHeader`) | [`src/components/HubHeader.astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/components/HubHeader.astro) |
| `[utm:checkout-<slug>]` | Checkouts (`/checkout/<slug>`) | Botões de contratação/consulta de serviços unitários | [`src/pages/checkout/[slug].astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/checkout/[slug].astro) |
| `[utm:plano-<slug>]` | Planos (`/planos/<slug>`) | Botões de contratação/consulta de pacotes de planos | [`src/pages/planos/[slug].astro`](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/src/pages/planos/[slug].astro) |

---

## 3. Lista de Slugs Mapeados

### Serviços Unitários (`[utm:checkout-<slug>]`)
- `[utm:checkout-tiktok-shop-diagnostico-express]` — Diagnóstico Express TikTok Shop
- `[utm:checkout-operacao-digital-auditoria]` — Auditoria de Operação Digital
- `[utm:checkout-tiktok-shop-setup-inicial]` — Setup Inicial TikTok Shop Brasil
- `[utm:checkout-api-whatsapp]` — Setup Oficial WhatsApp Business API
- `[utm:checkout-webapp-lp]` — WebApp LP Comercial Express
- `[utm:checkout-crm-inteligente]` — CRM Comercial Inteligente
- `[utm:checkout-fluxos-automacao]` — Automação Comercial Primeiro Fluxo
- `[utm:checkout-dashboard-dados]` — Dashboard Executivo Starter

### Pacotes de Planos (`[utm:plano-<slug>]`)
- `[utm:plano-agente-sdr]` — Implantação Agente SDR IA
- `[utm:plano-agents-ia]` — Ecossistema de Agentes de IA
- `[utm:plano-aquisicao-multicanal]` — Aquisição Multicanal NEØ
- `[utm:plano-operacao-custom-enterprise]` — Operação Custom Enterprise

---

## 4. Regra para Desenvolvedores e Agentes de IA

Sempre que criar uma nova página, botão ou CTA com link direto de WhatsApp (`wa.me`), o agente deve:
1. Incluir obrigatoriamente a tag `[utm:<identificador>]` na mensagem.
2. Adicionar o novo identificador a esta tabela em `docs/UTM_MAP.md`.
