# Auditoria e Plano de Implementação — Meta, NEØ Growth System e Superfícies Comerciais

**Projeto:** neoflowoff.agency  
**Data:** 15/07/2026  
**Destino:** Agent Dev responsável por auditar, implementar, validar e enviar para deploy  
**Status geral:** infraestrutura parcialmente configurada; **não colocar os apps Meta em Live antes de concluir os bloqueadores deste documento**

---

## 1. Objetivo comercial imediato

Concluir a infraestrutura mínima necessária para vender e operar:

1. **Operação SDR IA Plug & Play**
2. Atendimento e qualificação via WhatsApp
3. Chat flutuante com identidade do **NΞØ:One**
4. Landing page comercial do SDR
5. Página de vendas e checkout por serviço
6. Gestão de campanhas e ativos Meta da neoflowoff.agency
7. Onboarding futuro de contas de anúncios e ativos de clientes

A prioridade não é criar mais arquitetura abstrata. A prioridade é conectar as peças existentes, fechar segurança, validar eventos reais e liberar superfícies que possam gerar lead, contrato e pagamento.

---

## 2. Arquitetura organizacional

### 2.1 Organização `NEO-Growth-System`

GitHub:

```text
https://github.com/orgs/NEO-Growth-System
```

O **NEØ Growth System** é a camada operacional de ingestão, mensageria, CRM, providers e orquestração do ecossistema NEØ Protocol.

Repositórios informados:

```text
neo-provider-telegram
neo-provider-sms
neo-whatsapp-connec
neo-growth-system-workspace
neo-provider-resend
neo-message-orchestrator
neo-queue-worker
neo-crm-core
neo-event-ingestor
neo-crm-dashboard
neo-provider-whatsapp
```

Todos em TypeScript.

### 2.2 Organização `NEO-FlowOFF`

GitHub:

```text
https://github.com/NEO-FlowOFF
```

#### `neo-landing-sdr`

```text
https://github.com/NEO-FlowOFF/neo-landing-sdr
```

Função:

- landing page da **Operação SDR IA Plug & Play**
- demonstração comercial
- captura de lead
- CTA para conversa e fechamento
- integração com Pixel/CAPI quando validada

#### `neo-flw-landing`

```text
https://github.com/NEO-FlowOFF/neo-flw-landing
```

Função:

- página de vendas
- catálogo de serviços
- geração de checkout e links individuais por serviço
- superfície utilizável em catálogo Meta e outros canais
- chat flutuante com identidade do NΞØ:One
- provider previsto para o chat dessa superfície: **OpenAI**

Situação atual:

- o endpoint Meta está temporariamente nesta aplicação:
  `https://lp.neoflowoff.agency/api/meta-webhook`
- isso deve ser tratado como configuração transitória
- a landing page não deve permanecer como ingressor definitivo de eventos Meta

#### `neoflowoff-chat-ui`

```text
https://github.com/NEO-FlowOFF/neoflowoff-chat-ui
```

Função:

- personalidade e experiência do **NΞØ:One**
- agente demonstrador oficial da neoflowoff.agency
- provider atual: **ASI1.one / Fetch.ai**
- pode servir como núcleo conversacional para WhatsApp, desde que a integração seja feita pelo Growth System
- não deve receber diretamente segredos ou webhooks Meta no frontend

---

## 3. Responsabilidade de cada serviço do NEØ Growth System

### `neo-event-ingestor`

Responsabilidade recomendada:

- endpoint público definitivo dos webhooks Meta
- validação do challenge GET
- validação de `X-Hub-Signature-256`
- identificação do app, WABA, número e cliente
- idempotência por event/message ID
- normalização do payload
- remoção ou mascaramento de dados sensíveis nos logs
- resposta HTTP rápida
- publicação do evento na fila

Este serviço deve substituir o endpoint hoje hospedado em `neo-flw-landing`.

### `neo-queue-worker`

- processar eventos de forma assíncrona
- retries controlados
- dead-letter queue
- impedir reprocessamento duplicado
- encaminhar eventos normalizados ao CRM e ao orquestrador

### `neo-message-orchestrator`

- decidir fluxo conversacional
- chamar o provider do agente
- alternar entre automação e atendimento humano
- classificar intenção
- qualificar lead
- gerar eventos de CRM
- controlar contexto e continuidade da conversa

### `neo-provider-whatsapp`

- enviar mensagens pela WhatsApp Cloud API
- marcar mensagens como lidas quando aplicável
- enviar templates aprovados
- tratar respostas e códigos de erro da API
- usar token exclusivo do serviço de WhatsApp

### `neo-whatsapp-connec`

- conexão e onboarding de WABAs
- Embedded Signup, quando implementado
- associação de Business, WABA, phone number e cliente
- armazenamento seguro de referências de token
- status de conexão
- reconexão e revogação
- suporte futuro a múltiplos clientes

### `neo-crm-core`

- contato
- empresa
- lead
- oportunidade
- origem
- intenção
- urgência
- capacidade
- estágio
- responsável humano
- histórico de consentimento e tratamento

### `neo-crm-dashboard`

- acompanhamento de conversas
- status de integração
- oportunidades
- alertas
- handoff humano
- métricas operacionais

### Providers adicionais

```text
neo-provider-telegram
neo-provider-sms
neo-provider-resend
```

Devem receber eventos do orquestrador. Não devem conhecer segredos de outros providers.

### `neo-growth-system-workspace`

- control plane e workspace técnico
- contratos de eventos
- schemas compartilhados
- configuração de ambientes
- documentação operacional
- integração inicial de Ads, caso ainda não exista serviço próprio

Não criar agora um novo repositório de Ads apenas por organização. Um módulo interno pode ser usado até existir operação real com contas de clientes. Um serviço independente, como `neo-provider-meta-ads`, só deve nascer quando houver carga operacional e receita que justifiquem a separação.

---

## 4. Decisão de separação dos apps Meta

### 4.1 App atual de WhatsApp e agentes

Dados confirmados:

```env
META_APP_ID=1500002841696407
META_APP_NAME="NEOFLOW E-gine"
META_APP_NAMESPACE=neoflowoff
META_GRAPH_API_VERSION=v25.0
```

Função recomendada:

- WhatsApp Business Platform
- agentes e atendimento
- Operação SDR IA
- onboarding futuro de WABAs
- mensagens, templates, qualidade e alertas

O nome definitivo ainda precisa ser decidido antes do Live.

Sugestões coerentes:

```text
NEØ Agent Operations
neoflowoff.agency Agents
NEØ Messaging Engine
```

Não usar `NΞØ:One` como nome do app, pois NΞØ:One é o agente demonstrador e não a infraestrutura vendida.

### 4.2 App de Ads

Informação apresentada pelo fundador, ainda pendente de confirmação técnica:

```env
META_ADS_APP_ID_CANDIDATE=470678155999569
META_ADS_APP_NAME_CANDIDATE="NEOFLW Ads Manager"
```

**Não considerar esse ID confirmado até consultar o Graph API ou abrir o app correspondente no painel Meta.**

Comando de validação:

```bash
curl -sG "https://graph.facebook.com/v25.0/470678155999569" \
  --data-urlencode "fields=id,name,namespace,link" \
  --data-urlencode "access_token=$META_USER_ACCESS_TOKEN" |
python3 -m json.tool
```

Função prevista:

- Marketing API
- gestão de contas de anúncios
- campanhas, conjuntos e anúncios
- leitura de desempenho
- Pixels/Datasets
- Páginas
- Instagram
- permissões concedidas por clientes
- onboarding e gestão de ativos comerciais de terceiros

Objetos de webhook futuros, apenas quando houver backend capaz de processá-los:

```text
Ad Account
Permissions
Page
Instagram
Application
```

Não assinar todos os campos. Assinar somente eventos que produzam ação operacional real.

### 4.3 App legado/experimental

Existe referência a um primeiro app criado anos atrás durante experimentação.

Ação obrigatória:

1. localizar o app
2. registrar ID, nome, tipo, business owner, modo e produtos
3. listar tokens, webhooks, WABAs, pixels, páginas e contas vinculadas
4. verificar se ainda existe tráfego ou dependência
5. somente depois decidir entre arquivar, manter como legado, remover integrações ou excluir

Não excluir o app antigo antes de confirmar que nenhum ativo de produção depende dele.

---

## 5. Meta Business e ativos confirmados

### Business

```env
META_BUSINESS_ID=227957544965390
META_BUSINESS_NAME="Flowoff Agency"
META_BUSINESS_VERIFICATION_STATUS=verified
```

### Conta de anúncios principal

```env
META_AD_ACCOUNT_ID=act_1579803729592779
META_AD_ACCOUNT_NUMERIC_ID=1579803729592779
META_AD_ACCOUNT_NAME="BM - neoflowoff agency"
```

Status auditado: ativo.

### Pixel/Dataset principal

```env
META_PIXEL_ID=2051453138833455
META_PIXEL_NAME="NEØ FlowOFF // IA para Atendimento e Vendas"
```

Este deve ser considerado o Pixel/Dataset principal da nova infraestrutura.

### Pixels legados

```env
META_LEGACY_PIXEL_ID=1703749606854419
META_LEGACY_PIXEL_NAME="NEOPixel"

META_FLOWADS_PIXEL_ID=1646739783423680
META_FLOWADS_PIXEL_NAME="FlowOFF Ads Manager"
```

Diretriz:

- não espalhar pixels legados por todos os ambientes
- registrar em manifesto de inventário
- usar como variável somente em serviços que realmente precisem de compatibilidade

Arquivo recomendado:

```text
config/meta-assets.inventory.json
```

### Página

```env
META_PAGE_ID=103151091927817
META_PAGE_NAME="Neoflw Agency"
```

### Instagram

```env
META_INSTAGRAM_ACCOUNT_ID=17841408872279531
META_INSTAGRAM_USERNAME=neoflw.agency
```

---

## 6. WhatsApp Business Account

### WABA

```env
META_WABA_ID=26958411313796411
META_WABA_NAME="neoflowoff agency"
META_WABA_CURRENCY=USD
META_WABA_TIMEZONE_ID=25
```

### Número

```env
META_PHONE_NUMBER_ID=1076704612201643
META_PHONE_DISPLAY="+55 62 9478-9032"
```

Estado auditado:

```text
quality_rating: GREEN
code_verification_status: NOT_VERIFIED
name_status: AVAILABLE_WITHOUT_REVIEW
platform_type: ON_PREMISE
throughput: NOT_APPLICABLE
```

Bloqueador:

- ainda não considerar o envio pela Cloud API pronto
- auditar migração, registro e status do número
- validar se existe dependência do conector anterior/Zernio

### Apps atualmente inscritos na WABA

Confirmados:

```text
NEOFLOW E-gine
App ID: 1500002841696407

Social Media Connector / Zernio
App ID: 712341431446535
```

Não remover o Zernio até concluir origem do número, fluxo atual de mensagens, possível coexistência, risco de interrupção e plano de rollback.

---

## 7. System Users

Principal:

```env
META_SYSTEM_USER_ID=122101422309385117
META_SYSTEM_USER_NAME="C-API Ø"
```

Tarefas auditadas no Pixel principal:

```text
ADVERTISE
UPLOAD
ANALYZE
EDIT
```

Tarefa auditada na WABA:

```text
MANAGE
```

Legado:

```env
META_LEGACY_SYSTEM_USER_ID=122140624922999035
META_LEGACY_SYSTEM_USER_NAME=legacy
```

Diretriz:

- separar tokens por responsabilidade
- não compartilhar um token genérico entre Ads e WhatsApp
- registrar expiração, escopos e rotação
- não armazenar token puro em banco de clientes
- usar secret manager ou referência segura

---

## 8. Webhook atual

```env
META_WEBHOOK_URL=https://lp.neoflowoff.agency/api/meta-webhook
META_VERIFY_TOKEN=<SECRET_CONFIGURADO_NA_VERCEL>
```

Objeto ativo:

```text
WhatsApp Business Account
```

Campos assinados:

```text
messages
account_alerts
message_template_status_update
message_template_quality_update
phone_number_quality_update
```

Validações concluídas:

```text
Challenge GET:
HTTP 200
123456

Teste Meta:
messages v25.0
Successfully tested
```

Objetos removidos/desativados:

```text
User
Page
Permissions
Application
Instagram
Ad Account
Catalog
Managed Meta Account
```

A desativação atual é correta para o app de WhatsApp enquanto o backend ainda não processa os demais objetos.

---

## 9. Falhas do webhook atual que precisam ser corrigidas antes do Live

O endpoint atual:

- compara `META_VERIFY_TOKEN` no GET
- recebe qualquer POST
- imprime o payload bruto
- devolve `200`
- não valida a assinatura do remetente
- não implementa idempotência
- não enfileira
- não normaliza
- não distingue cliente
- não mascara PII

Implementação obrigatória:

### Validar assinatura

Usar:

```text
X-Hub-Signature-256
```

Algoritmo:

```text
HMAC SHA-256
secret = META_APP_SECRET
payload = raw request body
```

A validação precisa usar o corpo bruto, antes de qualquer transformação JSON.

### Proteger logs

Não registrar conteúdo completo da mensagem, telefone completo, nome completo, access tokens, app secret, verify token ou payload bruto em produção.

Registrar somente:

```text
event_id
message_id
object
field
waba_id
phone_number_id
client_id
event_type
received_at
processing_status
```

### Idempotência

Chave sugerida:

```text
provider + message_id
```

Fallback:

```text
provider + event_id + timestamp
```

### Fluxo recomendado

```text
Meta
→ neo-event-ingestor
→ validar assinatura
→ deduplicar
→ normalizar
→ publicar na fila
→ devolver HTTP 200
→ neo-queue-worker
→ neo-message-orchestrator
→ CRM/provider
```

---

## 10. Variáveis por serviço

> `neo-event-ingestor`

```env
NODE_ENV=production
META_GRAPH_API_VERSION=v25.0
META_APP_ID=1500002841696407
META_APP_SECRET=
META_VERIFY_TOKEN=
META_BUSINESS_ID=227957544965390
META_WABA_ID=26958411313796411
META_PHONE_NUMBER_ID=1076704612201643
QUEUE_URL=
QUEUE_TOKEN=
LOG_LEVEL=info
```

> `neo-provider-whatsapp`

```env
NODE_ENV=production
META_GRAPH_API_VERSION=v25.0
META_WABA_ID=26958411313796411
META_PHONE_NUMBER_ID=1076704612201643
META_WHATSAPP_ACCESS_TOKEN=
META_PROVIDER_TIMEOUT_MS=10000
META_PROVIDER_MAX_RETRIES=3
```

> `neo-whatsapp-connec`

```env
NODE_ENV=production
META_APP_ID=1500002841696407
META_APP_SECRET=
META_BUSINESS_ID=227957544965390
META_GRAPH_API_VERSION=v25.0
META_OAUTH_REDIRECT_URI=
META_EMBEDDED_SIGNUP_CONFIG_ID=
META_TOKEN_ENCRYPTION_KEY=
DATABASE_URL=
```

> `neo-message-orchestrator`

```env
NODE_ENV=production
CRM_API_URL=
CRM_API_TOKEN=
WHATSAPP_PROVIDER_URL=
WHATSAPP_PROVIDER_TOKEN=
ASI1AI_API_KEY=
OPENAI_API_KEY=
DEFAULT_AGENT_PROVIDER=asi1
```

A escolha de provider deve ser por agente/superfície, não por segredo global compartilhado.

> `neoflowoff-chat-ui`

```env
ASI1AI_API_KEY=
DEFAULT_AGENT_PROVIDER=asi1
```

Não inserir secrets Meta no código ou bundle cliente.

> `neo-flw-landing`

Durante a migração:

```env
META_VERIFY_TOKEN=
META_APP_SECRET=
```

Depois da migração do webhook para `neo-event-ingestor`, remover esses segredos da landing.

Variáveis públicas aceitáveis:

```env
META_PIXEL_ID=2051453138833455
META_PAGE_ID=103151091927817
META_INSTAGRAM_ACCOUNT_ID=17841408872279531
```

Chat flutuante:

```env
OPENAI_API_KEY=
OPENAI_PROJECT_ID=
CHAT_API_URL=
```

A chave OpenAI deve permanecer em função server-side.

> `neo-landing-sdr`

```env
META_PIXEL_ID=2051453138833455
LEAD_API_URL=
CHAT_URL=https://chat.neoflowoff.agency
```

CAPI deve ser executada server-side pelo serviço responsável pelo evento.

### App de Ads — após confirmar identidade

```env
META_ADS_APP_ID=470678155999569
META_ADS_APP_SECRET=
META_GRAPH_API_VERSION=v25.0
META_BUSINESS_ID=227957544965390
META_AD_ACCOUNT_ID=act_1579803729592779
META_PIXEL_ID=2051453138833455
META_PAGE_ID=103151091927817
META_INSTAGRAM_ACCOUNT_ID=17841408872279531
META_ADS_SYSTEM_USER_ID=
META_ADS_ACCESS_TOKEN=
```

Até a confirmação do Graph API, tratar `470678155999569` como candidato.

---

## 11. Dados de clientes: banco, não variáveis globais

Modelo mínimo:

```text
client_id
client_name
client_business_id
client_ad_account_id
client_pixel_id
client_page_id
client_instagram_account_id
client_waba_id
client_phone_number_id
connection_status
granted_permissions
token_reference
token_expires_at
connected_at
revoked_at
last_sync_at
```

Tokens de clientes devem ser criptografados ou armazenados em secret manager, com uma referência no banco.

---

## 12. Manifesto de ativos

Criar:

```text
config/meta-assets.inventory.json
```

Estrutura sugerida:

```json
{
  "business": {
    "id": "227957544965390",
    "name": "Flowoff Agency",
    "verificationStatus": "verified"
  },
  "apps": {
    "messaging": {
      "id": "1500002841696407",
      "name": "NEOFLOW E-gine",
      "status": "development",
      "confirmed": true
    },
    "ads": {
      "id": "470678155999569",
      "name": "NEOFLW Ads Manager",
      "status": "pending_audit",
      "confirmed": false
    }
  },
  "adAccount": {
    "id": "act_1579803729592779",
    "name": "BM - neoflowoff agency"
  },
  "pixels": {
    "primary": {
      "id": "2051453138833455",
      "name": "NEØ FlowOFF // IA para Atendimento e Vendas"
    },
    "legacy": [
      {
        "id": "1703749606854419",
        "name": "NEOPixel"
      },
      {
        "id": "1646739783423680",
        "name": "FlowOFF Ads Manager"
      }
    ]
  },
  "page": {
    "id": "103151091927817",
    "name": "Neoflw Agency"
  },
  "instagram": {
    "id": "17841408872279531",
    "username": "neoflw.agency"
  },
  "whatsapp": {
    "wabaId": "26958411313796411",
    "phoneNumberId": "1076704612201643",
    "displayPhoneNumber": "+55 62 9478-9032",
    "platformType": "ON_PREMISE",
    "qualityRating": "GREEN",
    "codeVerificationStatus": "NOT_VERIFIED"
  }
}
```

Esse arquivo não pode conter secrets ou access tokens.

---

## 13. Plano de implementação e deploy

### Fase 1 — Auditoria imediata

- [ ] confirmar o app `470678155999569`
- [ ] localizar e inventariar o primeiro app experimental
- [ ] confirmar nome definitivo e função do app `1500002841696407`
- [ ] conferir domínios e URLs institucionais nos apps
- [ ] conferir política de privacidade e exclusão de dados
- [ ] conferir permissões concedidas aos system users
- [ ] confirmar dependência atual do Zernio
- [ ] auditar status ON_PREMISE do número

### Fase 2 — Corrigir ingresso de webhook

- [ ] implementar challenge GET em `neo-event-ingestor`
- [ ] implementar raw body
- [ ] validar `X-Hub-Signature-256`
- [ ] implementar idempotência
- [ ] mascarar PII
- [ ] publicar na fila
- [ ] responder 200 rapidamente
- [ ] adicionar testes unitários e de integração
- [ ] adicionar `.env.example`
- [ ] adicionar healthcheck

### Fase 3 — Integração operacional

- [ ] `neo-queue-worker` consome evento
- [ ] `neo-message-orchestrator` interpreta mensagem
- [ ] NΞØ:One responde por provider configurado
- [ ] `neo-provider-whatsapp` envia mensagem
- [ ] `neo-crm-core` registra contato, conversa e oportunidade
- [ ] handoff humano funcional
- [ ] observabilidade mínima

### Fase 4 — Migração do endpoint

- [ ] publicar `neo-event-ingestor`
- [ ] testar callback em staging
- [ ] testar challenge
- [ ] testar `messages v25.0`
- [ ] testar alertas e qualidade
- [ ] trocar callback na Meta
- [ ] manter rollback para `lp.neoflowoff.agency/api/meta-webhook`
- [ ] observar eventos
- [ ] remover endpoint e secrets Meta da landing após estabilidade

### Fase 5 — Live

Somente colocar o app de WhatsApp em Live após:

- [ ] assinatura validada
- [ ] logs protegidos
- [ ] política de privacidade publicada
- [ ] exclusão de dados publicada
- [ ] domínio correto
- [ ] número apto à operação prevista
- [ ] token de system user correto
- [ ] teste de mensagem real
- [ ] resposta do agente
- [ ] CRM atualizado
- [ ] handoff humano validado
- [ ] rollback documentado

O app de Ads deve seguir processo separado de permissões, revisão, onboarding e gestão de clientes.

---

## 14. Critérios de aceite

### Webhook

- requisições sem assinatura válida retornam erro
- challenge válido retorna o valor cru
- evento duplicado não é processado duas vezes
- evento válido entra na fila em poucos segundos
- payload bruto não aparece em logs de produção

### WhatsApp

- mensagem real chega ao ingressor
- contato é identificado
- conversa é registrada
- agente responde
- falha do provider gera retry
- oportunidade qualificada chega ao CRM
- atendimento humano pode assumir

### Landing SDR

- captura lead
- registra origem
- envia evento server-side
- abre conversa com contexto
- não expõe secrets

### Página de vendas

- cada serviço possui link próprio
- checkout funciona
- conversão é registrada
- chat flutuante usa NΞØ:One
- provider OpenAI funciona server-side
- lead e compra chegam ao Growth System

### Ads

- app correto confirmado
- conta própria conectada
- Pixel principal definido
- permissões mínimas documentadas
- onboarding de cliente separado dos ativos próprios
- dados de cliente ficam no banco

---

## 15. Decisões congeladas

1. **Pixel principal:** `2051453138833455`
2. **WABA principal:** `26958411313796411`
3. **Phone Number ID:** `1076704612201643`
4. **Business ID:** `227957544965390`
5. **Ad Account principal:** `act_1579803729592779`
6. **App atual de WhatsApp:** `1500002841696407`
7. **Endpoint atual validado:** `https://lp.neoflowoff.agency/api/meta-webhook`
8. **Campos WABA ativos:** cinco campos listados neste documento
9. **Provider do `neoflowoff-chat-ui`:** ASI1.one
10. **Provider previsto para o chat da `neo-flw-landing`:** OpenAI
11. **Ingressor definitivo dos webhooks:** `neo-event-ingestor`
12. **Ativos de clientes:** banco de dados, nunca variáveis globais
13. **Apps de Ads e WhatsApp:** responsabilidades separadas
14. **App Ads `470678155999569`:** pendente de confirmação técnica
15. **Nenhum app deve entrar em Live antes dos bloqueadores de segurança e operação**

---

## 16. Entrega esperada do Agent Dev

O Agent Dev deve devolver:

```text
1. Relatório de auditoria por repositório
2. Mapa de mudanças por arquivo
3. Variáveis adicionadas por serviço
4. Secrets necessários, sem exibir valores
5. Testes criados
6. Resultado dos testes
7. URLs de staging
8. Resultado do teste Meta
9. Plano de migração
10. Plano de rollback
11. Commits e pull requests
12. Status final: bloqueado, staging ou pronto para Live
```

Regra:

> Não declarar “pronto para produção” apenas porque o endpoint devolve HTTP 200. A operação só está pronta quando mensagem real, agente, CRM, handoff, segurança, observabilidade e rollback forem validados de ponta a ponta.
