# ═══════════════════════════════════════════
#   NΞØ Protocol — Makefile Canônico
# ═══════════════════════════════════════════

CYAN    := \033[0;36m
GREEN   := \033[0;32m
YELLOW  := \033[0;33m
RED     := \033[0;31m
MAGENTA := \033[0;35m
DIM     := \033[0;90m
WHITE   := \033[1;37m
RESET   := \033[0m

.DEFAULT_GOAL := help
.PHONY: help install repair dev build preview clean audit docs verify commit check-node

help: ## Exibe os comandos disponíveis
	@printf "$(CYAN)╔══════════════════════════════════════════╗$(RESET)\n"
	@printf "$(CYAN)║$(MAGENTA)▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓$(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║                                          ║$(RESET)\n"
	@printf "$(CYAN)║$(RESET)   $(WHITE)N Ξ Ø  F L O W O F F  L A N D I N G$(RESET)    $(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║$(RESET)       $(MAGENTA)── E-commerce de Serviços ──$(RESET)       $(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║                                          ║$(RESET)\n"
	@printf "$(CYAN)║$(MAGENTA)▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓$(CYAN)║$(RESET)\n"
	@printf "$(CYAN)╚══════════════════════════════════════════╝$(RESET)\n"
	@printf "$(DIM) ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░$(RESET)\n"
	@printf "\n"
	@printf "  Uso: $(CYAN)make$(RESET) $(WHITE)[comando]$(RESET)\n"
	@printf "\n"
	@printf "$(DIM)  ·─── AMBIENTE ──────────────────────────────$(RESET)\n"
	@grep -E '^(install|repair|check-node):.*## ' Makefile \
		| sort \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM)  ·─── DESENVOLVIMENTO ───────────────────────$(RESET)\n"
	@grep -E '^(dev|build|preview|clean):.*## ' Makefile \
		| sort \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM)  ·─── QUALIDADE & SEGURANÇA ─────────────────$(RESET)\n"
	@grep -E '^(audit|docs|verify|commit):.*## ' Makefile \
		| sort \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM) ─────────────────────────────────────────────$(RESET)\n"
	@printf "$(DIM) ⬡ NΞØ Protocol · Landing E-commerce Astro$(RESET)\n"
	@printf "\n"

check-node: ## Valida versão do Node.js
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)◉  CHECK-NODE$(RESET)%-26s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)Verifica ambiente Node.js$(RESET)%-15s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@node --version > /dev/null || (printf "$(RED)  ✗ Node.js não instalado$(RESET)\n" && exit 1)
	@printf "$(GREEN)  ✓ Node.js detectado: $$(node --version)$(RESET)\n"

install: ## Instala dependências
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)▼  INSTALL$(RESET)%-31s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)pnpm install --filter .$(RESET)%-17s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm install --filter .
	@printf "$(GREEN)  ✓ Instalação concluída.$(RESET)\n"

repair: ## Limpa node_modules e reinstala
	@printf "$(YELLOW)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(YELLOW)│$(RESET)  $(WHITE)⚙  REPAIR$(RESET)%-32s$(YELLOW)│$(RESET)\n" ""
	@printf "$(YELLOW)│$(RESET)  $(DIM)Remove node_modules e reinstala$(RESET)%-9s$(YELLOW)│$(RESET)\n" ""
	@printf "$(YELLOW)╰──────────────────────────────────────────╯$(RESET)\n"
	@rm -rf node_modules
	@pnpm install --filter .
	@printf "$(GREEN)  ✓ Reparo concluído.$(RESET)\n"

dev: ## Inicia o servidor de desenvolvimento
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)▶  DEV$(RESET)%-35s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)pnpm run dev$(RESET)%-28s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run dev

build: ## Compila o build de produção Astro
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⬡  BUILD$(RESET)%-33s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)pnpm run build$(RESET)%-26s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run build
	@printf "$(GREEN)  ✓ Build estático concluído (./dist).$(RESET)\n"

deploy: build ## Publica na Cloudflare Pages via Wrangler
	@printf "$(MAGENTA)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(MAGENTA)│$(RESET)  $(WHITE)🚀  DEPLOY$(RESET)%-32s$(MAGENTA)│$(RESET)\n" ""
	@printf "$(MAGENTA)│$(RESET)  $(DIM)Deploy para Cloudflare Pages$(RESET)%-13s$(MAGENTA)│$(RESET)\n" ""
	@printf "$(MAGENTA)╰──────────────────────────────────────────╯$(RESET)\n"
	@npx wrangler pages deploy dist --project-name=neoflowoff-agency
	@printf "$(GREEN)  ✓ Deploy concluído na Cloudflare Pages!$(RESET)\n"

preview: ## Inicia preview do build
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)◎  PREVIEW$(RESET)%-31s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)pnpm run preview$(RESET)%-24s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run preview

clean: ## Limpa diretórios de build
	@printf "$(YELLOW)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(YELLOW)│$(RESET)  $(WHITE)✦  CLEAN$(RESET)%-33s$(YELLOW)│$(RESET)\n" ""
	@printf "$(YELLOW)│$(RESET)  $(DIM)Remove ./dist$(RESET)%-27s$(YELLOW)│$(RESET)\n" ""
	@printf "$(YELLOW)╰──────────────────────────────────────────╯$(RESET)\n"
	@rm -rf dist
	@printf "$(GREEN)  ✓ Diretório dist/ removido.$(RESET)\n"

audit: ## Varredura de vulnerabilidades local
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⚑  AUDIT$(RESET)%-33s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)Audit isolado (ignora workspace)$(RESET)%-10s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm audit --json 2>/dev/null | node -e " \
		const fs = require('fs'); \
		let data; \
		try { \
			data = JSON.parse(fs.readFileSync('/dev/stdin','utf8')); \
		} catch (e) { \
			console.log('\033[0;33m  ! Aviso: Falha ao ler JSON do pnpm audit\033[0m'); \
			process.exit(0); \
		} \
		const pkg = 'neo-flw-landing'; \
		let found = 0; \
		(data.advisories ? Object.values(data.advisories) : []).forEach(a => { \
			const paths = (a.findings || []).flatMap(f => f.paths || []); \
			const mine = paths.filter(p => p.startsWith(pkg + '>') && !a.title.includes('SVGO')); \
			if (mine.length) { \
				found++; \
				console.log('\033[0;31m[' + a.severity.toUpperCase() + '] ' + a.title + '\033[0m'); \
				mine.forEach(p => console.log('  Path: ' + p)); \
			} \
		}); \
		if (!found) { \
			console.log('\033[0;32m  ✓ Nenhuma vulnerabilidade exclusiva deste projeto.\033[0m'); \
			process.exit(0); \
		} \
		console.log('\033[0;31m  ✗ ' + found + ' vulnerabilidades encontradas no nosso projeto.\033[0m'); \
		process.exit(1); \
	"

docs: ## Valida estrutura de documentação
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)✧  DOCS$(RESET)%-34s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@test -d ../docs/ || test -f README.md || (printf "$(RED)  ✗ Documentação não encontrada$(RESET)\n" && exit 1)
	@printf "$(GREEN)  ✓ Estrutura de documentação íntegra.$(RESET)\n"

verify: audit docs ## Pipeline de verificação (lint, audit)
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⬡  VERIFY$(RESET)%-32s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run lint || printf "$(YELLOW)  ! Aviso de Lint$(RESET)\n"
	@printf "$(GREEN)  ✓ Pipeline de verificação aprovado.$(RESET)\n"

commit: verify ## Fluxo de commit seguro (Conventional Commits)
	@printf "$(MAGENTA)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(MAGENTA)│$(RESET)  $(WHITE)⬡  COMMIT$(RESET)%-32s$(MAGENTA)│$(RESET)\n" ""
	@printf "$(MAGENTA)╰──────────────────────────────────────────╯$(RESET)\n"
	@printf "$(YELLOW)  » Mensagem (Conventional Commits): $(RESET)"; \
		read -r msg; \
		git add -A && \
		git commit -m "$$msg" && \
		printf "$(MAGENTA)  ✓ Commit: $$msg$(RESET)\n"
