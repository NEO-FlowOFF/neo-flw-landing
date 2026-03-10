.PHONY: help serve dev check lint validate optimize clean deploy install build

# Variáveis
PORT ?= 8000
PYTHON := python3
NODE := node

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Target padrão
.DEFAULT_GOAL := help

##@ Desenvolvimento

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)NEØ FlowOFF Landing - Comandos Disponíveis$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

serve: ## Inicia servidor HTTP local na porta 8000
	@echo "$(GREEN)🚀 Iniciando servidor em http://localhost:$(PORT)$(NC)"
	@$(PYTHON) -m http.server $(PORT)

dev: ## Inicia desenvolvimento com hot-reload (browser-sync)
	@echo "$(GREEN)🔥 Modo desenvolvimento com hot-reload$(NC)"
	@pnpm run dev || echo "$(YELLOW)⚠️  browser-sync não encontrado. Execute: make install$(NC)"

install: ## Instala dependências do projeto
	@echo "$(GREEN)📦 Instalando dependências...$(NC)"
	@pnpm install || echo "$(YELLOW)⚠️  pnpm não encontrado$(NC)"

##@ Validação

check: lint validate ## Executa todas as verificações (lint + validate)

lint: ## Valida HTML e CSS (htmlhint + stylelint)
	@echo "$(GREEN)🔍 Validando HTML e CSS...$(NC)"
	@pnpm run lint || echo "$(YELLOW)⚠️  Ferramentas de lint não encontradas. Execute: make install$(NC)"

validate: ## Valida HTML usando validador W3C (requer curl)
	@echo "$(GREEN)✅ Validando HTML com W3C...$(NC)"
	@curl -s "https://validator.w3.org/nu/?out=text" -F "file=@index.html" | head -20 || echo "$(YELLOW)⚠️  Validador W3C não disponível$(NC)"

check-links: ## Verifica links quebrados (requer curl)
	@echo "$(GREEN)🔗 Verificando links (isso pode levar alguns segundos)...$(NC)"
	@grep -Eo 'href="https?://[^"]+"' index.html | awk -F'"' '{print $$2}' | grep -Ev "wa.me|facebook|googletagmanager|instagram|canva.com" | sort -u | while read url; do \
		status=$$(curl -s -o /dev/null -w "%{http_code}" -L "$$url" -A "Mozilla/5.0"); \
		if [ "$$status" = "200" ]; then \
			echo "$(GREEN)✓ [$$status] $$url$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  [$$status] $$url$(NC)"; \
		fi; \
	done

##@ Otimização

optimize: ## Otimiza imagens e minifica CSS (requer ferramentas externas)
	@echo "$(GREEN)⚡ Otimizando assets...$(NC)"
	@echo "$(YELLOW)⚠️  Configure ferramentas de otimização (imagemagick, cssnano, etc)$(NC)"

minify-css: ## Minifica CSS (requer cssnano)
	@echo "$(GREEN)📦 Minificando CSS...$(NC)"
	@pnpm dlx cssnano-cli landing_v2.css landing_v2.min.css || echo "$(YELLOW)⚠️  cssnano não encontrado$(NC)"

##@ Build

# Gera versão baseada em timestamp (YYYYMMDDHHMM)
VERSION := $(shell date +%Y%m%d%H%M)
VERSION_SEMANTIC := $(shell date +%Y.%m.%d)

build: clean check update-pwa-version ## Prepara build para produção (valida + limpa + atualiza PWA)
	@echo "$(GREEN)🔨 Preparando build para produção...$(NC)"
	@echo "$(GREEN)✅ Build concluído!$(NC)"
	@echo ""
	@echo "Arquivos prontos para deploy:"
	@ls -lh index.html landing_v2.css manifest.webmanifest 2>/dev/null | awk '{print "  " $$9 " (" $$5 ")"}' || true
	@echo ""
	@echo "$(GREEN)📱 Versão PWA: $(VERSION_SEMANTIC)$(NC)"

update-pwa-version: ## Atualiza versão do PWA no manifest, package.json e HTML
	@echo "$(GREEN)📱 Atualizando versão PWA...$(NC)"
	@if [ -f manifest.webmanifest ]; then \
		$(PYTHON) -c "import json, sys; \
		data = json.load(open('manifest.webmanifest')); \
		data['version'] = '$(VERSION)'; \
		data['version_name'] = '$(VERSION_SEMANTIC)'; \
		json.dump(data, open('manifest.webmanifest', 'w'), indent=2, ensure_ascii=False); \
		print('✅ Manifest atualizado: v$(VERSION_SEMANTIC)')"; \
	else \
		echo "$(YELLOW)⚠️  manifest.webmanifest não encontrado$(NC)"; \
	fi
	@if [ -f package.json ]; then \
		$(PYTHON) -c "import json, sys; \
		data = json.load(open('package.json')); \
		data['version'] = '$(VERSION_SEMANTIC)'; \
		json.dump(data, open('package.json', 'w'), indent=4); \
		print('✅ package.json atualizado: v$(VERSION_SEMANTIC)')"; \
	else \
		echo "$(YELLOW)⚠️  package.json não encontrado$(NC)"; \
	fi
	@if [ -f index.html ]; then \
		$(PYTHON) -c "import re; \
		content = open('index.html', 'r', encoding='utf-8').read(); \
		content = re.sub(r'<meta name=\"version\" content=\"[^\"]*\">', '<meta name=\"version\" content=\"$(VERSION_SEMANTIC)\">', content); \
		content = re.sub(r'<meta name=\"app-version\" content=\"[^\"]*\">', '<meta name=\"app-version\" content=\"$(VERSION_SEMANTIC)\">', content); \
		open('index.html', 'w', encoding='utf-8').write(content); \
		print('✅ index.html atualizado: v$(VERSION_SEMANTIC)')"; \
	else \
		echo "$(YELLOW)⚠️  index.html não encontrado$(NC)"; \
	fi
	@echo "$(GREEN)✅ Versão PWA atualizada para $(VERSION_SEMANTIC)$(NC)"

##@ Deploy

deploy: build ## Faz deploy (ajuste conforme sua plataforma)
	@echo "$(GREEN)🚀 Fazendo deploy...$(NC)"
	@echo "$(YELLOW)⚠️  Configure seu método de deploy$(NC)"
	@echo "Opções:"
	@echo "  - Vercel: vercel --prod"
	@echo "  - GitHub Pages: git push origin main"

preview: ## Preview antes do deploy
	@echo "$(GREEN)👀 Preview do build...$(NC)"
	@make serve

##@ Limpeza

clean: ## Remove arquivos temporários e cache
	@echo "$(GREEN)🧹 Limpando arquivos temporários...$(NC)"
	@find . -type f -name "*.min.css" -delete 2>/dev/null || true
	@find . -type f -name ".DS_Store" -delete 2>/dev/null || true
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

clean-all: clean ## Limpeza completa (inclui node_modules)
	@echo "$(GREEN)🧹 Limpeza completa...$(NC)"
	@rm -rf node_modules 2>/dev/null || true
	@rm -rf .vercel 2>/dev/null || true
	@rm -rf dist build 2>/dev/null || true
	@echo "$(GREEN)✅ Limpeza completa concluída$(NC)"

##@ Utilitários

size: ## Mostra tamanho dos arquivos principais
	@echo "$(GREEN)📊 Tamanho dos arquivos:$(NC)"
	@du -h index.html landing_v2.css 2>/dev/null || true
	@du -sh public/ 2>/dev/null || true

info: ## Mostra informações do projeto
	@echo "$(GREEN)ℹ️  Informações do Projeto$(NC)"
	@echo ""
	@echo "Nome: NEØ FlowOFF Landing"
	@echo "Versão: $$(grep -oP '"version":\s*"\K[^"]+' package.json 2>/dev/null || echo 'N/A')"
	@echo "Porta padrão: $(PORT)"
	@echo "Python: $$($(PYTHON) --version 2>&1 || echo 'Não encontrado')"
	@echo "Node: $$($(NODE) --version 2>&1 || echo 'Não encontrado')"

watch: ## Observa mudanças em arquivos e recarrega (requer entr ou similar)
	@echo "$(GREEN)👀 Observando mudanças...$(NC)"
	@which entr > /dev/null && echo "index.html landing_v2.css" | entr -c make serve || echo "$(YELLOW)⚠️  'entr' não encontrado. Instale: brew install entr$(NC)"

##@ Git

commit: ## Commit rápido (ajuste a mensagem)
	@echo "$(GREEN)💾 Fazendo commit...$(NC)"
	@git add .
	@git commit -m "chore: update landing page" || echo "$(RED)❌ Erro no commit$(NC)"

push: ## Push para repositório
	@echo "$(GREEN)📤 Fazendo push...$(NC)"
	@git push origin main || echo "$(RED)❌ Erro no push$(NC)"

status: ## Status do Git
	@echo "$(GREEN)📋 Status do Git:$(NC)"
	@git status --short || echo "$(YELLOW)⚠️  Não é um repositório Git$(NC)"
