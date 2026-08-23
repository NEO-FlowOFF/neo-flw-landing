<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# GUIA DE ARQUITETURA E ESPECIFICAÇÃO: WHATSAPP FLOW JSON

```text
============================================================
       NEOFLOWOFF.AGENCY · WHATSAPP FLOWS SPEC V5.1
============================================================
App Homologado: NEØFLW ENGINE:one (ID: 1500002841696407)
Versão da Especificação: Flow JSON 5.1 / Data API 3.0
Status: ESPECIFICADO & DISPONÍVEL
============================================================
```

Este documento apresenta o estudo completo, especificação técnica e manual de integração dos **WhatsApp Flows (Flow JSON)** desenvolvidos para o ecossistema comercial da **neoflowoff.agency**.

---

## 1. Introdução ao Flow JSON

O **Flow JSON** é um formato declarativo proprietário da Meta que permite construir experiências completas e nativas de formulários, seletores, agendas e miniapps dentro da janela de conversa do WhatsApp (sem abrir navegador externo).

### Principais Benefícios para a neøflow agency
- **Taxa de Conversão 3x Maior:** Elimina o atrito do transbordo para landing pages externas durante o atendimento inicial no WhatsApp.
- **Coleta Estruturada de Leads:** Garante que todos os dados coletados (faturamento, gargalos comerciais, datas de agendamento) sigam tipos estritos antes do envio ao backend (`neo-provider-messaging` / `neo-crm-core`).
- **Navegação em Estado Fechado:** Telas encadeadas com validação cliente-servidor nativa em tempo real.

---

## 2. Estrutura Top-Level do Flow JSON

A estrutura de topo do Flow JSON possui propriedades obrigatórias e opcionais:

| Propriedade | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `version` | String | Sim | Versão da especificação do Flow JSON (ex: `"5.1"`, `"4.0"`, `"3.1"`). |
| `screens` | Array[Object] | Sim | Lista com as telas que compõem o fluxo do usuário. |
| `routing_model` | Object | Não* | Grafo direcionado que define quais telas podem transicionar para quais. *Obrigatório quando o fluxo utiliza um Data Endpoint (`data_exchange`). |
| `data_api_version` | String | Não* | Versão da API de dados (atualmente `"3.0"`). |
| `data_channel_uri` | String | Não | URL do Data Endpoint (Descontinuado no Flow JSON 3.0+ em favor da configuração via Flows API no WABA). |

### Exemplo de Top-Level Flow JSON (v5.1)
```json
{
  "version": "5.1",
  "data_api_version": "3.0",
  "routing_model": {
    "QUALIFICACAO_SCREEN": ["DIAGNOSTICO_SCREEN"],
    "DIAGNOSTICO_SCREEN": ["FINALIZACAO_SCREEN"],
    "FINALIZACAO_SCREEN": []
  },
  "screens": [...]
}
```

---

## 3. Modelo de Telas (`screens`)

Cada tela (`screen`) funciona como uma página isolada dentro do Flow:

```json
{
  "id": "QUALIFICACAO_SCREEN",
  "title": "Diagnóstico Comercial NEØ",
  "terminal": false,
  "refresh_on_back": false,
  "sensitive": ["faturamento_mensal"],
  "data": {
    "nome_cliente": {
      "type": "string",
      "__example__": "Neø Mello"
    }
  },
  "layout": {
    "type": "SingleColumnLayout",
    "children": [...]
  }
}
```

### Propriedades da Tela
- **`id`**: Identificador único da tela (chave reservada `SUCCESS` não deve ser usada como ID).
- **`layout`**: Define a interface visual. Na versão atual, o container padrão é `"SingleColumnLayout"`.
- **`terminal`** (Boolean): Indica se a tela encerra o fluxo (`true`). Telas terminais exigem a inclusão de um componente `Footer`.
- **`success`** (Boolean): Aplicável a telas terminais. `true` (padrão) marca que o encerramento da tela representa um sucesso comercial.
- **`refresh_on_back`** (Boolean): Quando `true`, se o usuário voltar para esta tela, envia uma requisição `BACK` para o Data Endpoint para atualizar os dados dinâmicos.
- **`sensitive`** (Array[String]): (Disponível a partir da v5.1). Lista os nomes dos campos que contêm dados sensíveis e que devem ser mascarados (`••••••••••••`) no resumo da mensagem enviada no chat.

---

## 4. Bindings Dinâmicos & Referências Globais

O Flow JSON permite ler valores informados pelo usuário ou retornados pelo servidor:

1. **Campos do Formulário Local:** `"${form.faturamento_mensal}"`
2. **Dados da Tela Atual:** `"${data.valor_plano}"`
3. **Referências Globais (Flow JSON 4.0+):** `"${screen.QUALIFICACAO_SCREEN.form.gargalo_principal}"`
   - Permite acessar dados preenchidos em telas anteriores sem a necessidade de repassá-los explicitamente via payload de navegação.

---

## 5. Ações (`on-click-action`)

Disparadas por botões e componentes interativos (como o `Footer`):

### 1. `navigate`
Transiciona para a próxima tela do fluxo.
```json
{
  "type": "Footer",
  "label": "Avançar",
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "SEGUNDA_TELA" },
    "payload": {
      "empresa": "${form.nome_empresa}"
    }
  }
}
```

### 2. `data_exchange`
Envia o payload para o Data Endpoint (`endpoint_uri`) e aguarda o retorno do servidor com o payload da próxima tela.
```json
{
  "type": "Footer",
  "label": "Calcular Orçamento",
  "on-click-action": {
    "name": "data_exchange",
    "payload": {
      "servico_id": "${form.servico_selecionado}"
    }
  }
}
```

### 3. `complete`
Encerra o Flow no WhatsApp e dispara o webhook `natively` com o resumo dos dados preenchidos pelo cliente.
```json
{
  "type": "Footer",
  "label": "Concluir Solicitação",
  "on-click-action": {
    "name": "complete",
    "payload": {
      "faturamento": "${screen.QUALIFICACAO_SCREEN.form.faturamento}",
      "urgencia": "${form.urgencia}"
    }
  }
}
```

---

## 6. Fluxos Comerciais Disponíveis na neøflow agency

Criamos 3 esquemas de Flow JSON validados prontos para importação no Meta WhatsApp Manager:

1. **`flow_qualificacao_sdr.json`** ([Visualizar arquivo](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/docs/whatsapp/flows/flow_qualificacao_sdr.json)):
   - **Telas:** `QUALIFICACAO_LEAD` -> `DIAGNOSTICO_DIGITAL` -> `CONFIRMACAO_RESUMO`.
   - **Objetivo:** Qualificar a maturidade digital do lead, faturamento e tamanho da equipe comercial antes do transbordo para o SDR IA ou consultor humano.
2. **`flow_agendamento_reuniao.json`** ([Visualizar arquivo](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/docs/whatsapp/flows/flow_agendamento_reuniao.json)):
   - **Telas:** `SELECAO_DATA_HORA` -> `DETALHES_REUNIAO` -> `CONFIRMACAO_AGENDAMENTO`.
   - **Objetivo:** Agendamento rápido de demonstração da plataforma NEØ ou reunião de consultoria comercial.
3. **`flow_checkout_servico.json`** ([Visualizar arquivo](file:///Users/nettomello/neomello/NEO-FlowOFF/neo-flw-landing/docs/whatsapp/flows/flow_checkout_servico.json)):
   - **Telas:** `SELECAO_SERVICO` -> `ESCOPO_PERSONALIZADO` -> `FINALIZAR_PEDIDO`.
   - **Objetivo:** Seleção direta dos serviços unitários do catálogo (`SERVICO-AGENTE-SDR`, `SERVICO-API-WHATSAPP`, `SERVICO-CRM-COMERCIAL`, etc.) para envio de proposta sob medida.

---

## 7. Como Importar no Meta WhatsApp Manager

1. Acesse o **[Facebook Business Manager](https://business.facebook.com)**.
2. Vá em **Todas as ferramentas** > **Gerenciador do WhatsApp (WhatsApp Manager)**.
3. Selecione a WABA correspondente ao aplicativo **`NEØFLW ENGINE:one`** (`1500002841696407`).
4. No menu esquerdo, acesse **Ferramentas da conta** > **Flows**.
5. Clique em **Criar Flow** (ou **Importar JSON**).
6. Copie o conteúdo de um dos arquivos JSON disponíveis em `docs/whatsapp/flows/` e cole no editor do Builder.
7. Clique em **Salvar** e depois em **Publicar**.

---

## 8. Tratamento de Webhook de Resposta (`complete`)

Quando um cliente conclui um Flow no WhatsApp, a Meta dispara um evento de webhook com o tipo `messages` contendo um objeto `interactive`:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1500002841696407",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "556282705594",
              "phone_number_id": "YOUR_PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "5562999999999",
                "id": "wamid.HBgL...",
                "timestamp": "1724450000",
                "type": "interactive",
                "interactive": {
                  "type": "n_flow_response",
                  "n_flow_response": {
                    "name": "flow_qualificacao_sdr",
                    "response_json": "{\"faturamento\":\"50k_100k\",\"gargalo\":\"atendimento_lento\"}"
                  }
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

O endpoint `/api/meta-webhook` em `functions/api/meta-webhook.js` e o serviço backend soberano `neo-provider-messaging` interceptam esse evento, extraem o JSON de `response_json` e persistem o lead diretamente no CRM da agência.
