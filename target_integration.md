# Protocolo de Integração: Site Target x Ads Engineer

Este documento detalha as implementações necessárias no código fonte da página/aplicação de destino (Target) para que ela se comunique perfeitamente com o ecossistema do **Ads Engineer (NΞØ Protocol)**.

O objetivo desta integração é garantir rastreamento de alta precisão (CAPI), evasão de bloqueios (Stealth) e monitoramento de saúde em tempo real.

---

## 1. Monitoramento de Saúde (Health Check Node)

### Preocupação Técnica
O Ads Engineer precisa saber se o tráfego que está sendo comprado está pousando em um site funcional. Se o servidor do site cair, o Ads Engineer precisa alertar o dashboard imediatamente para pausar campanhas e evitar desperdício de verba (Burn Rate).

### O que implementar no Target
Criar um endpoint público, rápido (baixo tempo de resposta) e não-autenticado, localizado estritamente em `/api/health`.

- **Formato da Resposta:** JSON
- **Status HTTP Esperado:** 200 OK
- **Payload Recomendado:**
  ```json
  {
    "status": "Operational",
    "ops_count": 142, // Opcional: Número de visitantes únicos hoje ou leads capturados
    "message": "Node is active"
  }
  ```
- **Atenção (Agent):** Certifique-se de que testes de carga pesada na aplicação principal não afetem o tempo de resposta deste endpoint, pois timeouts acionarão alertas falsos-positivos no Ads Engineer.

---

## 2. Meta Pixel + Conversions API (CAPI)

### Preocupação Técnica
Pixel baseado em navegador (Client-side) tem baixa taxa de correspondência devido a AdBlockers e Safari (ITP). Precisamos de redundância através do servidor (Server-side) para atingir os 94%+ de match rate que o protocolo exige.

### O que implementar no Target (Front-End)
Injetar o Meta Pixel base (Page View) no `<head>` de todas as rotas visíveis.
- O Pixel ID deve ser puxado dinamicamente das variáveis de ambiente (`process.env.NEXT_PUBLIC_META_PIXEL` em React, ou `META_PIXEL_ID` no [.env](file:///Users/nettomello/CODIGOS/ads-engineer/.env) padrão).
- Nunca expor parâmetros pesados como "Purchase" no client-side para evitar scraping de concorrentes e auditorias prematuras do Meta.

### O que implementar no Target (Back-End / API CAPI)
Os eventos de alto valor (Lead, InitiateCheckout, Purchase) devem ser disparados **exclusivamente** pelo servidor.

1. **Captura do fbp e fbc:** O Target deve ler os cookies `_fbc` (Click ID) e `_fbp` (Browser ID) gerados pelo front-end.
2. **Hashing SHA-256:** E-mail (`em`), telefone (`ph`) e nome (`fn`/`ln`) devem ser normalizados (letras minúsculas, sem símbolos) e criptografados em **SHA-256** antes de serem enviados à Graph API.
3. **Comunicação:** Fazer POST para `https://graph.facebook.com/v23.0/{PIXEL_ID}/events`.
- **Atenção (Agent):** A variável `META_ACCESS_TOKEN` nunca deve, sob nenhuma hipótese, vazar no código front-end (JavaScript no navegador).

---

## 3. Stealth Protocol & Redirecionamento (Opcional, nichos moderados/black)

### Preocupação Técnica
Se a oferta for agressiva, robôs e revisores humanos da Meta/Google (crawlers) farão auditorias manuais no site, resultando em bloqueios (Bans).

### O que implementar no Target (Middleware/Edge)
Adicionar um *fingerprinter* ou filtro no Edge/Middleware (ex: Cloudflare Workers, Next.js Middleware ou Nginx).

- **Regras de Bloqueio:**
  Se o `User-Agent` contiver "facebookexternalhit", "Googlebot", ou se o IP for oriundo de data centers AWS/GCP (sem histórico de IP residencial):
  1. Renderizar uma página estática branca ("Safe Page") que obedeça rigidamente às políticas do Facebook (Policy Compliant).
  2. Não disparar o Pixel.
- **Fluxo de Usuário Real:**
  Tráfego mobile, com IPs residenciais do local alvo (ex: Brasil), processa a "Money Page" completa com a cópia real.
- **Atenção (Agent):** Evite redirecionamentos HTTP 301/302 para ofuscação primária. A camuflagem (render-side) deve acontecer sob a mesma URL original avaliada no anúncio (Cloaking via Proxy Pass ou renderização condicional).

---

## 4. Webhook de Operação (Callback)

### Preocupação Técnica
Queremos que o System Terminal do Ads Engineer reporte as vendas e leads em tempo real para a equipe de Growth.

### O que implementar no Target
Quando um usuário concluir o funil principal (ex: sucesso no checkout ou formulário):
- Disparar uma requisição assíncrona blind and fire (sem esperar retorno) para o possível IP/Domínio do Ads Engineer.
- Exemplo: `POST https://[ADS-ENGINEER-IP]/api/operations/callback` com um payload contendo `{ type: 'lead', value: 0 }`.
- **Atenção (Agent):** Implementar com *timeout* baixíssimo (ex: 1 segundo). Se o painel do Ads Engineer estiver desligado para manutenção, a aplicação Target não pode travar esperando o webhook responder.

---

### -> Missão para o Agent:
Implemente estes requisitos na arquitetura da outra aplicação. Retorne com um **Report de Integração** atestando que o `/api/health` está respondendo em <100ms e que a lógica CAPI está preparada usando as variáveis corretas.
