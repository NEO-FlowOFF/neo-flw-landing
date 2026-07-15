# Diretrizes e Instruções de Desenvolvimento para Agentes (AGENTS.md)

Este arquivo descreve as regras operacionais, de infraestrutura e padrões de desenvolvimento específicos do repositório `neo-flw-landing`. Qualquer agente que atuar neste repositório DEVE seguir estas regras à risca.

---

## 1. Regras do Monorepo e pnpm
- **Instalação Isolada:** Este repositório faz parte do monorepo da `NEO-FlowOFF` (que possui outros 11 projetos). **Nunca** execute `pnpm install` globalmente ou comandos de instalação sem filtro, pois isso atualizará e quebrará dependências de outros projetos (como `/ceo-escalavel-miniapp`).
- **Comando Correto:** Use sempre `pnpm install --filter .` (mapeado no `make install`).
- **Bypass de EPERM:** Se o comando global do pnpm falhar com erro de permissão (devido ao corepack/mise), execute as ferramentas de lint diretamente do node_modules:
  - `./node_modules/.bin/htmlhint`
  - `./node_modules/.bin/stylelint`

---

## 2. Regras de Negócio e Integração Meta (Decisões Congeladas)
- **Verificação de Domínio Meta:** O token ativo é `zq0xygs8v9s714m5039mijjh0wowyj`. Ele deve permanecer no `<head>` de **ambos** os arquivos:
  - `index.html` (para requisições normais)
  - `safe-page.html` (para requisições do crawler `facebookexternalhit`)
- **Roteamento User-Agent (`middleware.js`):** A Safe Page (`safe-page.html`) é servida automaticamente pelo middleware para tráfego vindo de robôs e crawlers de redes sociais (Facebook, Google, etc.). Nunca altere esse fluxo sem verificar a compatibilidade.
- **WhatsApp do Agent:** O contato oficial ativo é o **`+55 62 9478-9032`**. Em links de redirecionamento, use estritamente o formato internacional limpo: `https://wa.me/556294789032` (sem o caractere `+`).

---

## 3. Arquitetura de Conversão & Checkout
- **Links da Planilha (`neo-digital-assets-book`):** Os serviços oferecidos no ecossistema estão divididos semanticamente em duas categorias de rotas:
  - **Planos (Pacotes Completos) em `/planos/<slug>`:** Ex: `/planos/agente-sdr`, `/planos/agents-ia`, `/planos/crm-inteligente`.
  - **Checkouts (Serviços Unitários) em `/checkout/<slug>`:** Ex: `/checkout/api-whatsapp`, `/checkout/app-meta`, `/checkout/webapp-lp`.
- **Rastreamento UTM Persistente:** O script `js/payment.js` captura as UTMs da URL (`utm_source`, `utm_medium`, etc.) e as persiste no `sessionStorage`. Essas informações são anexadas nos eventos do DataLayer (`begin_checkout` e `add_payment_info`) e enviadas no payload da cobrança para a rota de API `/api/create-charge-landing`.
- **Segurança de API:** A rota `/api/create-charge-landing.js` roda server-side e gerencia a comunicação segura com o FlowPay. Nenhuma credencial ou token privado (`FLOWPAY_INTERNAL_API_KEY`, chaves OpenAI, etc.) deve ser exposta no front-end.
