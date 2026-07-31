<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

```text
========================================
     NEOFLOWOFF · DEBT REPAYMENT LEDGER
========================================
Status: ACTIVE
Scope: PRIVATE / LEDGER
========================================
```

## ⟠ Objetivo

Este documento define a referencia privada de controle operacional
financeiro e projecao de alocacao de caixa para quitacao dos compromissos.

────────────────────────────────────────

## ⨷ Passivos Mapeados e Prioridade

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  PASSIVOS  >>  ordem de prioridade e liquidação
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+======+========================+=============+==================+
| PRIO | CREDOR                 | VALOR       | META             |
+======+========================+=============+==================+
| P1   | Mercado Pago           | R$ 28.600   | Mes 1 - Mes 2    |
| P2   | Passivo Vencido Geral  | R$ 57.000   | Mes 2 - Mes 4    |
| P3   | Banco Itau             | R$ 30.000   | Mes 4 - Mes 6    |
| P4   | Negociacoes Menores    | R$ 54.400   | Mes 6+           |
+======+========================+=============+==================+

> **Passivo Total:** R$ 170.000,00  
> **Meta 6 Meses:** Reduzir saldo para < R$ 50.000,00

────────────────────────────────────────

## ⧉ Regra de Alocacao de Receita

Cada venda realizada via landing page / catalogo tera uma fracao
fixa alocada diretamente para amortizacao:

```text
[ Receita de Venda ] ───► 60% Operacao / Impostos / Reserva
                      └───► 40% Quitação de Passivos (P1 ➔ P2 ➔ P3)
```

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  ALOCACAO  >>  aporte por ticket comercial
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+====================================+============+==============+
| PLANO / SERVICO                    | TICKET     | ALOCACAO 40% |
+====================================+============+==============+
| Plano Agente SDR IA                | R$ 3.500   | R$ 1.400     |
| Plano Ecossistema de IA            | R$ 6.000   | R$ 2.400     |
| Criacao e Regularizacao Meta       | R$ 2.500   | R$ 1.000     |
| Desenvolvimento WebApp e LP        | R$ 2.000   | R$ 800       |
+====================================+============+==============+

────────────────────────────────────────

## ⍟ Metas Mensais de Execucao

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  PROJECAO  >>  metas e saldos devedores
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+========+========+==============+==============+================+
| MES    | VENDAS | RECEITA      | APORTE 40%   | SALDO RESTANTE |
+========+========+==============+==============+================+
| Mes 1  | 5      | R$ 16.500    | R$ 6.600     | R$ 163.400     |
| Mes 2  | 6      | R$ 21.000    | R$ 8.400     | R$ 155.000     |
| Mes 3  | 7      | R$ 26.600    | R$ 10.640    | R$ 144.360     |
| Mes 4  | 8      | R$ 30.400    | R$ 12.160    | R$ 132.200     |
| Mes 5  | 8      | R$ 32.000    | R$ 12.800    | R$ 119.400     |
| Mes 6  | 8      | R$ 32.000    | R$ 12.800    | R$ 106.600     |
+========+========+==============+==============+================+

────────────────────────────────────────

## ◬ Seguranca e Privacidade

- Diretório `.personal_neomello` inserido no `.gitignore`.
- Atualização feita sob demanda operacional privada.

```text
▓▓▓ NΞØ MELLØ
────────────────────────────────────────
Core Operating Ledger · NΞØ FlowOFF
────────────────────────────────────────
```
