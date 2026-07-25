<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# AGENT MESSAGE PACING SKILL

```text
========================================
     SKILL · AGENT MESSAGE PACING
========================================
Status: DRAFT
Scope: chat UI, support agents, AI assistants
Runtime: frontend agnostic
========================================
```

Esta skill orienta agentes de desenvolvimento a implementar respostas
de IA em multiplos bubbles,
com pausas naturais de leitura,
sem acoplar a solucao a Bubble,
drawer inline,
widget flutuante,
site estatico,
PWA ou app completo.

────────────────────────────────────────

## ⟠ Objetivo

Evitar que respostas longas do agente sejam exibidas como uma unica
estrofe.

A resposta deve ser quebrada em blocos conversacionais menores,
renderizados em sequencia,
com pausa curta entre bubbles para simular respiracao,
melhorar leitura e reduzir carga cognitiva.

────────────────────────────────────────

## ⨷ Contrato

Entrada:

```text
assistant_reply: string
```

Saida esperada na UI:

```text
assistant_reply
└─ bubble 1
└─ pausa curta
└─ bubble 2
└─ pausa curta
└─ bubble final
```

O backend ou agente pode continuar retornando a resposta completa.

A fragmentacao pode acontecer no frontend,
desde que nao quebre conteudo critico,
links,
precos,
instrucoes legais,
codigo,
payloads,
listas tecnicas ou mensagens de compliance.

────────────────────────────────────────

## ⧉ Quando Usar

Use esta skill quando houver:

- chat bubble flutuante
- chat inline em drawer
- chat em PWA
- atendimento dentro de dashboard
- inbox de suporte humano
- assistente comercial
- agente SDR
- conversa com handoff humano
- respostas longas vindas de LLM ou backend

Nao use quando:

- a resposta for streaming token-a-token ja tratado pela UI
- a mensagem for codigo, JSON, tabela ou payload tecnico
- a resposta for recibo, contrato, termo legal ou confirmacao financeira
- a plataforma exigir mensagem atomica para auditoria

────────────────────────────────────────

## ◬ Principios

- a resposta do agente continua sendo uma unidade semantica
- a UI decide como revelar a resposta
- bubbles devem parecer conversa, nao texto fatiado mecanicamente
- pausas devem ajudar leitura, nao atrasar atendimento
- o usuario deve poder interromper ou enviar nova mensagem
- o sistema deve permitir desligar pacing por flag
- acessibilidade deve prevalecer sobre efeito visual

────────────────────────────────────────

## ⍟ Regras De Quebra

Ordem recomendada:

1. quebrar por paragrafos
2. se o paragrafo for longo, quebrar por frases
3. se a frase for longa, quebrar por tamanho maximo
4. manter listas curtas agrupadas
5. preservar blocos tecnicos inteiros

Tamanho inicial recomendado:

```text
minimo por bubble: 40 caracteres
ideal por bubble: 120 a 260 caracteres
maximo por bubble: 320 caracteres
```

Nao separar:

- URL do texto que explica o link
- preco da condicao comercial
- alerta do motivo do alerta
- pergunta de suas opcoes de resposta
- item numerado do seu detalhe essencial
- codigo ou JSON
- texto legal ou financeiro sensivel

────────────────────────────────────────

## ◯ Pausas

Calcule pausas pelo tamanho do bubble.

Valores iniciais:

```text
base: 550ms a 800ms
por caractere: 8ms a 14ms
maximo: 1800ms a 2400ms
```

Exemplo:

```text
bubble curto     650ms
bubble medio     1000ms
bubble longo     1600ms
maximo geral     2200ms
```

Pausas devem ser cancelaveis quando:

- usuario envia nova mensagem
- conversa e fechada
- rota muda
- atendimento entra em handoff humano
- resposta e marcada como urgente

────────────────────────────────────────

## ⦿ Typing Indicator

Durante a pausa,
exibir estado discreto de digitando.

O indicador deve:

- aparecer antes do proximo bubble
- sumir ao renderizar o bubble
- nao travar layout
- ser anunciado de forma acessivel quando aplicavel
- nao ser exibido para mensagens instantaneas ou tecnicas

Em apps acessiveis,
use regioes `aria-live` com cuidado para evitar leitura excessiva
por leitores de tela.

────────────────────────────────────────

## ⧇ Implementacao Generica

Pseudocodigo:

```ts
type PacingOptions = {
  enabled: boolean;
  minChars: number;
  targetChars: number;
  maxChars: number;
  minDelayMs: number;
  maxDelayMs: number;
};

function splitAssistantReply(reply: string, options: PacingOptions): string[] {
  if (!options.enabled) return [reply];
  if (shouldKeepAtomic(reply)) return [reply];

  const paragraphs = reply
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const bubbles: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= options.maxChars) {
      bubbles.push(paragraph);
      continue;
    }

    const sentences = splitBySentence(paragraph);
    let current = "";

    for (const sentence of sentences) {
      const next = `${current} ${sentence}`.trim();

      if (next.length > options.targetChars && current.length >= options.minChars) {
        bubbles.push(current);
        current = sentence.trim();
        continue;
      }

      current = next;
    }

    if (current) bubbles.push(current);
  }

  return bubbles;
}

function splitBySentence(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
}

function getBubbleDelayMs(text: string, options: PacingOptions): number {
  const delay = options.minDelayMs + text.length * 10;
  return Math.min(delay, options.maxDelayMs);
}
```

Renderizacao sequencial:

```ts
async function renderAssistantReply(reply: string) {
  const bubbles = splitAssistantReply(reply, pacingOptions);

  for (const bubble of bubbles) {
    showTypingIndicator();
    await wait(getBubbleDelayMs(bubble, pacingOptions));
    hideTypingIndicator();
    appendAssistantBubble(bubble);
  }
}
```

────────────────────────────────────────

## ⨷ Casos Especiais

Mensagens atomicas:

```text
PIX gerado
pagamento confirmado
termo legal
politica de devolucao
numero de protocolo
codigo de verificacao
JSON
bloco de codigo
erro tecnico
alerta de seguranca
```

Essas mensagens devem ser exibidas em um unico bubble,
ou em um componente proprio,
sem pacing artificial.

────────────────────────────────────────

## ◱ Bubble Chat

Para widget flutuante:

- aplicar pacing apenas em mensagens do assistente
- manter scroll preso no ultimo bubble se usuario estiver no fim
- nao forcar scroll se usuario estiver lendo mensagens antigas
- evitar que pausas prolonguem demais o primeiro atendimento
- permitir modo compacto em telas pequenas

Fluxo:

```text
API response
└─ splitAssistantReply
└─ render bubble sequencial
└─ update scroll
└─ liberar composer
```

────────────────────────────────────────

## ◲ Drawer Inline

Para drawer dentro de menu ou header:

- respeitar `100dvh` ou `100svh`
- manter composer fixo acima do teclado
- executar pacing dentro da area de historico
- nao deixar bubbles alterarem largura do drawer
- preservar fallback humano visivel

Fluxo:

```text
drawer aberto
└─ usuario envia mensagem
└─ composer entra em loading
└─ assistente responde em bubbles respirados
└─ composer volta ao estado normal
```

────────────────────────────────────────

## ◳ PWA E App

Para PWA ou app autenticado:

- persistir cada bubble como mensagem separada somente se isso fizer
  sentido para auditoria
- caso contrario, persistir a resposta completa e guardar os bubbles
  como estado de apresentacao
- sincronizar pacing com offline queue quando houver
- cancelar timers ao pausar app ou mudar rota
- evitar notificacoes push para cada bubble fragmentado

Modelo recomendado:

```text
stored_message
├─ id
├─ role: assistant
├─ full_text
├─ display_chunks
└─ pacing_metadata
```

────────────────────────────────────────

## ◴ Bubble.io

Para Bubble.io,
implemente como workflow intermediario entre a resposta da API
e a criacao da mensagem visivel.

Modelo:

```text
API Connector retorna assistant_reply
└─ action JS ou backend workflow divide em lista
└─ custom state pending_bubbles
└─ create thing Message com item 1
└─ schedule custom event para item 2
└─ repetir ate acabar
```

Regras:

- nao gravar cada chunk como nova resposta oficial se a auditoria
  exigir a resposta completa
- guardar `full_text` no registro principal quando necessario
- usar campo `chunk_index` apenas para apresentacao
- cancelar workflow se usuario pedir humano
- exibir typing indicator por estado local

────────────────────────────────────────

## ◵ Handoff Humano

Quando houver handoff:

- interromper pacing pendente
- finalizar ou descartar bubbles ainda nao exibidos
- registrar a resposta completa no historico tecnico se necessario
- mostrar mensagem curta de transferencia
- preservar contexto completo para a equipe humana

Exemplo de mensagem atomica:

```text
Vou te encaminhar para uma pessoa da equipe com o contexto completo.
```

────────────────────────────────────────

## ◶ Observabilidade

Eventos recomendados:

```text
assistant_reply_received
assistant_reply_chunked
assistant_bubble_rendered
assistant_pacing_cancelled
assistant_handoff_triggered
```

Campos uteis:

- conversation_id
- message_id
- chunk_count
- avg_chunk_length
- total_render_time_ms
- cancelled
- handoff

Nao registrar conteudo sensivel em analytics.

────────────────────────────────────────

## ◷ Validacao

Checklist minimo:

- resposta curta aparece em um unico bubble
- resposta longa aparece em multiplos bubbles
- listas continuam legiveis
- links permanecem com contexto
- codigo e JSON nao sao quebrados
- usuario pode enviar nova mensagem sem duplicacao
- fechar chat cancela timers
- handoff cancela pacing
- scroll nao salta de forma agressiva
- leitor de tela nao recebe spam de anuncios
- mobile com teclado aberto continua utilizavel

────────────────────────────────────────

## ⨀ Done

Considerar implementado apenas quando:

- pacing pode ser ligado e desligado por configuracao
- mensagens longas deixam de aparecer como estrofe unica
- conteudo critico permanece atomico
- timers sao cancelaveis
- UI nao bloqueia nova interacao indevidamente
- handoff humano tem prioridade sobre pacing
- validacao mobile e desktop foi executada
- risco de auditoria foi avaliado

```text
────────────────────────────
SKILL · AGENT MESSAGE PACING
────────────────────────────
```
