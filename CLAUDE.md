# Guia de Desenvolvimento do Projeto (CLAUDE.md)

Este guia define as convenções de código, comandos de terminal e padrões de estilo válidos para o repositório `neo-flw-landing`.

---

## 1. Comandos Disponíveis (Makefile)

A interação com o projeto deve ser orquestrada usando o `Makefile` local:

- **Instalação:** `make install` (roda `pnpm install --filter .` isolando o escopo).
- **Servidor Local:** `make serve` (inicia servidor HTTP Python na porta 8000).
- **Desenvolvimento:** `make dev` (inicia desenvolvimento com browser-sync/hot-reload).
- **Validação de Lint:** `make check` (roda o linter de HTML e CSS).
- **Build de Produção:** `make build` (atualiza versões de PWA, manifest e valida o código).

---

## 2. Padrões de Estilo & Qualidade do Código

- **Estrutura HTML/CSS Vanilla:** O site é construído utilizando apenas HTML5 semântico e CSS Vanilla (sem frameworks utilitários como TailwindCSS).
- **Validação de Código (HTMLHint):**
  - Todo elemento interativo deve possuir IDs únicos.
  - Não use estilos inline (atributos `style="..."`). Mova todas as definições de design para classes CSS no bloco `<style>` interno ou no arquivo `landing_v2.css`.
- **Rastreamento e Eventos (DataLayer):**
  - Qualquer alteração nos CTAs de compra deve disparar os eventos do DataLayer (`begin_checkout` e `add_payment_info`) através da função global `window.pushNeoDataLayerEvent`, passando o nome do item, preço e UTMs associadas.

---

## 3. Idioma das Respostas do Agente
- **Idioma do Chat:** Responda ao usuário sempre em **Português do Brasil (pt-BR)**.
- **Estilo:** Seja direto, técnico e profissional (estilo engenheiro sênior). Evite explicações excessivamente didáticas ou floreios automáticos.
