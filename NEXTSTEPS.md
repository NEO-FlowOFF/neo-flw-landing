<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# NEXTSTEPS.md

```text
========================================
      NEXTSTEPS · CHAT NO SITE
========================================
Status: DECISION DRAFT
Scope: interface + architecture
Implementation: not started
========================================
```

Este documento registra a direcao recomendada para atendimento
no `neo-flw-landing`.

Nao implementar ainda.

────────────────────────────────────────

## ⧆ Meta Ads / Pixel: decisao aprovada

Status: aprovado para validacao final no Gerenciador de Eventos.

Manter o clique no WhatsApp como conversao forte:

```text
Meta Pixel: Purchase
TikTok Pixel: CompletePayment
```

Motivo: o clique no WhatsApp e o ponto de entrada real do atendimento,
onde o NEO:one entra por portas de entrada como Agent SDR.

Validacao final deve usar apenas o dominio canonico:

```text
https://neoflowoff.agency/planos/agente-sdr/
```

Nao usar `pages.dev` como URL final de configuracao, revisao ou
mensuracao canonica. `pages.dev` pode ser usado somente como preview
temporario.

Eventos esperados no Test Events da Meta:

- `PageView`
- `ViewContent`
- `InitiateCheckout`
- `Purchase` no clique do WhatsApp

Ordem recomendada para Mensuracao de Eventos Agregados:

1. `Purchase`
2. `InitiateCheckout`
3. `ViewContent`

Observacao operacional: Pixel/AEM pertence a trilha de Ads. Isso nao
substitui nem bloqueia a trilha de App Review / Tech Provider, que segue
separada com webhook, data deletion, screencast e permissoes.

────────────────────────────────────────

## ⟠ Decisao Recomendada

Adotar chat no formato `Drawer Inline` dentro do menu hamburguer.

Nao usar chat bubble flutuante tradicional.

O atendimento deve parecer uma extensao do menu,
da identidade visual e da arquitetura comercial atual,
nao um widget externo colado sobre a landing.

────────────────────────────────────────

## ⧉ Principios

- preservar LCP e performance da home
- manter a UI integrada ao `HubHeader`
- carregar JavaScript apenas quando necessario
- evitar scripts terceiros no critical path
- nao expor chave OpenAI no frontend
- manter WhatsApp como rota humana primaria
- deixar chat IA com handoff claro para atendimento humano
- manter azul restrito ao bloco Meta do topo
- usar acid, cinza, preto e branco no drawer

────────────────────────────────────────

## ⧆ Pos-aprovacao Meta: IPFS/Web3

Status: sem urgencia.

IPFS/Web3 deve ficar fora do caminho critico da aprovacao do app na
Meta Developers ate a aprovacao estar concluida.

Nao usar `ipfs.neoflowoff.agency` em:

- App Domains
- Privacy Policy URL
- Terms URL
- User Data Deletion URL
- OAuth Redirect URI
- Embedded Signup
- qualquer fluxo que o reviewer da Meta precise abrir para validar o app

Uso recomendado apos aprovacao:

- gateway publico de artefatos verificaveis
- manifestos e whitepapers versionados por CID
- snapshots de documentacao publica
- hashes de releases e materiais institucionais
- pagina simples explicando que IPFS e camada de transparencia, nao coleta
  de dados de clientes

Antes de reativar como superficie publica, publicar conteudo real no gateway
e remover qualquer estado de onboarding Cloudflare. Se o gateway permanecer
sem conteudo final, manter `robots.txt` do host IPFS com:

```text
User-agent: *
Disallow: /
```

O dominio principal `https://neoflowoff.agency/` continua sendo a superficie
canonica para SEO, AEO, LGPD e revisao Meta.

────────────────────────────────────────

## ⧆ Pos-aprovacao Meta: Hero de catalogo

Status: pendente para desenvolvimento.

Responsavel pela retomada: Netto Mello.

A home deve evoluir para uma estrutura mais proxima de catalogo de servicos,
com leitura de e-commerce e banners editoriais no topo. Esta frente fica fora
do caminho critico da avaliacao e aprovacao Meta.

Asset ja disponivel para a retomada:

```text
public/assets/banners/home/neo-growth-system.webp
```

Quando retomar:

- avaliar hero com banners rotativos em intervalo aproximado de 5 segundos
- preservar LCP, CLS e nota Lighthouse
- manter primeiro banner com dimensoes explicitas, `loading="eager"`,
  `decoding="async"` e `fetchpriority="high"`
- carregar banners secundarios sem prioridade alta
- manter a identidade `NEØFLW ENGINE:one`
- validar mobile e desktop antes de publicar

Nao implementar esta mudanca antes da conclusao da prioridade Meta atual.

────────────────────────────────────────

## ⧆ Pos-aprovacao Meta: Agent Readiness

Status: backlog local. Nao implementar antes da aprovacao Meta.

As skills de agent readiness recebidas em 2026-07-27 foram movidas de
`.well-known/agent-skills/` para:

```text
.local/agent-readiness-skills/
```

Motivo: evitar que instrucoes locais de AEO/agents sejam confundidas com
superficies publicas exigidas pela revisao Meta.

Nao publicar essas skills em `public/.well-known` antes da aprovacao.
Nao adicionar headers `Link`, negociacao `Accept: text/markdown` ou
`Content-Signal` em producao ate a revisao Meta estar concluida.

Retomar apos aprovacao:

- avaliar `Content-Signal` em `robots.txt`
- avaliar headers `Link` via Cloudflare Transform Rules ou Worker
- avaliar Markdown for Agents / `Accept: text/markdown`
- validar com ferramenta de agent readiness somente em ambiente de teste
- garantir que `/privacy/`, `/terms/`, `/excluir-dados/` e Embedded Signup
  continuem sendo as superficies canonicas para revisao e compliance

────────────────────────────────────────

## ◬ Interface

Comportamento desejado:

```text
hamburger click
└─ abre drawer full-screen ou side drawer
   ├─ area superior com identidade neoflowoff.agency
   ├─ navegacao atual do menu
   ├─ modulo "Atendimento"
   ├─ historico de mensagens
   └─ composer fixo acima do teclado
```

O drawer deve substituir o dropdown atual em mobile.

Em desktop estreito,
pode manter largura maxima semelhante ao container atual.

────────────────────────────────────────

## ⨷ Mobile

Contrato anti-bug de teclado:

```css
.chat-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
}
```

Fallback aceitavel:

```css
@supports not (height: 100dvh) {
  .chat-drawer {
    height: 100svh;
  }
}
```

Historico:

```css
.chat-history {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow-y: auto;
}
```

Composer:

```text
input/form sempre no final do drawer
safe-area respeitada com env(safe-area-inset-bottom)
scroll interno apenas no historico
body travado enquanto drawer aberto
```

────────────────────────────────────────

## ⍟ Astro

Preferencia inicial:

```text
Astro component + native <script>
```

Motivo:

- o projeto ja usa Vanilla JS no `Base.astro` e `HubHeader.astro`
- nao adiciona React/Vue/Svelte sem necessidade real
- combina com Astro SSG
- reduz JS inicial

Usar ilha hidratada somente se:

- o estado do chat ficar complexo
- houver streaming de mensagens na UI
- houver persistencia local de conversa
- houver componentes ricos de resposta

Se usar ilha:

```text
client:idle      para preparar atendimento sem bloquear LCP
client:visible   se o modulo ficar abaixo da dobra
client:load      apenas se abertura instantanea for obrigatoria
```

────────────────────────────────────────

## ◯ OpenAI

O playground da OpenAI serve como laboratorio de prompt,
tom, fluxo e payload.

Para producao:

```text
browser drawer
└─ POST para backend proprio
   └─ backend chama OpenAI
      └─ backend retorna resposta saneada ao browser
```

Regras:

- nunca chamar OpenAI direto do Astro/browser com API key
- nao colocar chave, assistant id privado ou system prompt completo
  em `public/`, `src/data/` ou bundle client-side
- definir contrato minimo de request/response antes de codar
- prever timeout e fallback para WhatsApp
- registrar origem, pagina e intencao sem coletar dado excessivo

────────────────────────────────────────

## ◧ Dashboard do Cliente

Subdominio alvo:

```text
app.neoflowoff.agency
```

Este sera o painel de controle restrito para clientes.
Nao deve ser servido como rota publica da landing sem autenticacao,
isolamento de tenant, backend autoritativo e contrato de dados.

Direcao visual:

- fundo escuro continuo
- blocos glassmorphism flutuantes para separar informacoes
- molduras metalicas nos graficos e paineis criticos
- azul apenas quando a informacao for explicitamente Meta
- acid, cinza, preto e branco como base dominante

Modulos previstos:

1. Central de Treinamento da IA

Interface para upload e gestao de materiais que treinam ou contextualizam
o atendimento:

- PDFs
- regras de negocio
- politicas de devolucao
- catalogos de produtos
- Brand Voice do cliente
- limites de linguagem, promessas e tom de atendimento

O upload deve passar por backend soberano, validacao de tipo/tamanho,
armazenamento seguro e trilha de auditoria. O frontend nao deve processar
documentos sensiveis diretamente no browser alem do necessario para UX.

2. Caixa de Escalabilidade

Fluxo de contingencia para `Human Handoff`.

Quando a IA encontrar um problema nao resolvido, detectar risco de
alucinacao, receber pedido explicito por humano ou violar regra de negocio,
o atendimento deve cair nesta caixa com:

- historico completo da conversa
- contexto de origem e campanha
- resumo operacional gerado pela IA
- motivo da escalada
- status, responsavel e SLA
- caminho de retorno para a automacao

3. Metricas e Anomalias em Tempo Real

Graficos com molduras metalicas para acompanhar:

- reducao de CPA
- aumento de ROAS
- volume de atendimentos resolvidos pela IA
- taxa de handoff humano
- alertas de queda de performance
- anomalias por campanha, canal, criativo ou funil

A promessa de deteccao de quedas `72% mais rapido que analistas humanos`
deve permanecer como hipotese comercial ate existir telemetria verificavel,
baseline documentado e metodologia auditavel.

4. Guard-rails Financeiros

Configuracoes de seguranca financeira para campanhas:

- teto de orcamento diario por cliente, campanha e canal
- regra de pausa automatica por CPA, ROAS, gasto ou anomalia
- aprovacao humana para retomada quando necessario
- simulacao de impacto antes de aplicar limite
- log auditavel de quem alterou cada regra
- modo de desligamento manual imediato

Contrato de arquitetura:

```text
app browser
└─ backend autoritativo
   ├─ autenticacao e tenant isolation
   ├─ storage seguro de documentos
   ├─ fila/eventos para ingestao e embeddings
   ├─ CRM/handoff operacional
   ├─ metricas em tempo real
   └─ guard-rails financeiros auditaveis
```

────────────────────────────────────────

## ⦿ Fases

1. UX shell

Criar especificacao visual do drawer:

- estados fechado, aberto, carregando e erro
- navegacao do menu atual preservada
- CTA WhatsApp visivel como handoff
- composer fixo e acessivel

2. Contrato de atendimento

Definir payload minimo:

```json
{
  "message": "texto do visitante",
  "route": "/",
  "context": "home",
  "intent": "commercial_support"
}
```

Definir resposta minima:

```json
{
  "reply": "texto seguro para exibir",
  "handoff": false,
  "suggestedRoute": "whatsapp"
}
```

3. Backend authority

Escolher o no backend que chamara OpenAI.

Opcoes candidatas:

- endpoint novo em worker/provedor soberano
- reaproveitar `chat.neoflowoff.agency` se ja houver contrato publico
- rota de API externa do ecossistema FlowOFF

4. Implementacao Astro

Arquivos provaveis:

```text
src/components/HubHeader.astro
src/components/InlineChatDrawer.astro
src/styles/global.css
src/data/ui_texts.json
```

5. Validacao

Validar:

- mobile com teclado aberto
- iOS Safari
- Android Chrome
- desktop estreito
- navegacao por teclado
- contraste
- LCP sem regressao
- fallback WhatsApp quando backend falhar

6. Dashboard restrito `app`

Definir especificacao e contratos antes de implementar:

- fronteira entre landing publica e painel autenticado
- autenticacao, RBAC e isolamento por cliente
- contrato de upload/ingestao da Central de Treinamento
- contrato de handoff humano e historico conversacional
- contrato de metricas/anomalias em tempo real
- contrato de guard-rails financeiros e pausas automaticas
- requisitos visuais de glassmorphism escuro e molduras metalicas
- estrategia de deploy do subdominio `app`

────────────────────────────────────────

────────────────────────────────────────

## ⧆ Meta / Instagram Business API Setup

Status: Registrado / Configurado no .env
App ID Meta: `1500002841696407` (NEØFLW ENGINE:one)
Instagram Business Account ID: `17841408872279531`
Business ID: `227957544965390`
Painel Meta Setup: `https://developers.facebook.com/apps/1500002841696407/instagram-business/API-Setup/?business_id=227957544965390#`
Env Key: `INSTAGRAM_TOKEN`

Especificações futuras:
- Configurar login empresarial com Instagram Graph API.
- Recebimento de Webhooks de Direct Messages (DMs), menções e comentários para roteamento aos Agentes SDR IA.
- Sincronização de catálogo com Instagram Shopping.

────────────────────────────────────────

## ⧆ Gate de Acesso & Pagamento FlowPay para `/conectar-whatsapp`

Status: Planejamento de Integração FlowPay
Escopo: Proteger a conexão oficial WABA

Fluxo Operacional:
1. **Gate Imediato:** A página `/conectar-whatsapp/` opera com bloqueio por padrão (Access Gate). Para liberar o conector do `FB.login`, o cliente precisa de autorização ativa via chave de sessão (`?auth=...` ou token salvo) ou solicitar ativação ao operador via WhatsApp `+55 62 8270-5594`.
2. **Integração FlowPay:**
   - Cliente contrata o setup do WhatsApp Business (`SERVICO-API-WHATSAPP` ou taxa de homologação).
   - Ao confirmar o pagamento no FlowPay, o webhook autoritativo gera uma chave única de conexão assinada (`flw_auth_<uuid>`).
   - Cliente é redirecionado para `https://neoflowoff.agency/conectar-whatsapp/?auth=flw_auth_<uuid>` onde o `FB.login` é liberado.
3. **Página Exclusiva do Produto de Conexão WhatsApp API:**
   - Criação/expansão de página dedicada explicando:
     - Diferença entre WhatsApp Business comum e WhatsApp Cloud API oficial.
     - Vantagens de utilizar o app aprovado `NEØFLW ENGINE:one` (sem risco de banimentos).
     - Passo a passo detalhado de implementação (documentação exigida pela Meta, verificação de empresa, número limpo e Display Name).
     - Contratação direta com atendimento consultivo via `+55 62 8270-5594`.

────────────────────────────────────────

## ⧇ Riscos

- drawer virar app pesado dentro da landing
- chave OpenAI vazar se chamada sair do browser
- teclado mobile empurrar composer para fora da viewport
- service worker cachear respostas de chat indevidamente
- menu perder clareza se chat e navegacao competirem
- atendimento IA prometer escopo/preco sem confirmacao humana
- painel restrito ser publicado como rota estatica sem autenticacao
- documentos de cliente vazarem por bundle, cache ou logs
- metricas financeiras acionarem pausas automaticas sem auditoria
- promessa de deteccao `72% mais rapido` virar claim publico sem prova

────────────────────────────────────────

## ⨀ Done

Considerar pronto apenas quando:

- drawer abre e fecha sem layout shift relevante
- campo de texto permanece utilizavel com teclado mobile aberto
- chamada IA passa por backend autoritativo
- fallback WhatsApp funciona sem dependencia do chat
- dashboard `app` tem autenticacao, tenant isolation e backend soberano
- uploads, handoff, metricas e guard-rails possuem contratos auditaveis
- build passa
- teste visual mobile confirma que a UI nao sobrepoe conteudo

```text
────────────────────────────
NEXTSTEPS · CHAT NO SITE & METAS
────────────────────────────
```

