# Diretrizes de Uso Real de MCP e Ferramental de Desenvolvimento (_standards/mcp_and_tooling.md)

Este documento define as regras operacionais para o uso efetivo de servidores MCP (Model Context Protocol) e ferramentas de runtime (`mise`, `watchexec`, `ruff`) por agentes de engenharia e desenvolvedores no repositório `neo-flw-landing`.

---

## 1. Uso Real e Ativo dos Servidores MCP

- **Conexão Real:** Servidores configurados em `~/.gemini/config/mcp_config.json` (como `etherscan`, `hunter-remote-mcp`, `context`, `notebooks`, `visualization`) devem ser invocados ativamente durante as tarefas e não apenas mantidos como configuração passiva.
- **Consultas Operacionais:**
  - **Context7 / Context:** Usar para obter documentação atualizada de SDKs, APIs e bibliotecas antes de realizar edições ou refatorações complexas.
  - **Hunter.io:** Utilizar para enriquecimento de dados/leads quando o fluxo envolver prospecção ou validação de contatos.
  - **Etherscan:** Utilizar para inspeção direta de contratos, transações e saldos on-chain.
  - **Visualization & Notebooks:** Utilizar para renderização de gráficos e análise interativa de dados em pipelines.

---

## 2. Runtime e Gerenciamento de Ferramentas (`mise`)

- **Proibido `pip/npm` Globais sem Filtro:** Todas as versões de linguagens (`node`, `python`, `pnpm`, `ruff`) são gerenciadas estritamente via `mise`.
- **Comandos de Execução:**
  - Para atualizar ferramentas globais/locais: `mise use -g <tool>` ou `mise up <tool>`.
  - Para Node/PNPM no monorepo: Usar sempre `pnpm install --filter .` mapeado no `Makefile`.

---

## 3. Automação e Observabilidade em Background (`watchexec`)

- **Validação Contínua:** Agentes e desenvolvedores podem utilizar o `watchexec` para rodar suítes de teste ou verificações de lint em background ao editar arquivos.
- **Exemplo de uso em background:**

  ```bash
  watchexec -e ts,js,astro -- pnpm test
  ```

- Agentes que lançarem tarefas em background devem utilizar ferramentas como `watchexec` ou `manage_task` para monitorar a saúde e integridade do código sem interromper o fluxo do operador.

---

## 4. Formatadores e Linters Padrão

- **Python:** Formatado e auditado exclusivamente pelo **Ruff** (`charliermarsh.ruff`). Importações organizadas no salvamento (`source.organizeImports.ruff`).
- **JavaScript / TypeScript / JSON / Astro:** Formatado via **Prettier** (`esbenp.prettier-vscode`) e regras do `stylelint`.
