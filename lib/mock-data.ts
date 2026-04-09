import type { FinFlowSnapshot } from "@/lib/types";

export const mockSnapshot: FinFlowSnapshot = {
  currentMonth: "Abril 2026",
  closingInfo: "Fechamento em 12 dias",
  heroMetrics: [
    { label: "Saldo disponivel", value: "R$ 8.762", detail: "Apos fixos e cartoes", tone: "primary" },
    { label: "Projecao do mes", value: "R$ 6.980", detail: "Ritmo atual de gasto", tone: "secondary" },
  ],
  quickStats: [
    { label: "Total em contas", value: "R$ 142k", detail: "+4,2% no mes", tone: "primary" },
    { label: "Uso do limite", value: "12%", detail: "Saudavel", tone: "secondary" },
    { label: "Fixos do mes", value: "R$ 3.418", detail: "2 pagos, 1 pendente" },
    { label: "Receitas", value: "R$ 12.180", detail: "Salario + freelance" },
  ],
  monthlyComparison: [
    { label: "Nov", value: "R$ 7.2k", detail: "Estavel" },
    { label: "Dez", value: "R$ 7.8k", detail: "+8%" },
    { label: "Jan", value: "R$ 8.1k", detail: "+4%" },
    { label: "Fev", value: "R$ 7.6k", detail: "-6%" },
    { label: "Mar", value: "R$ 8.4k", detail: "+10%" },
    { label: "Abr", value: "R$ 8.7k", detail: "Atual" },
  ],
  weeklyLogs: [
    { id: "log-1", cardId: "card-1", week: "Semana 1", amount: "R$ 1.420", trend: "+8%", amountInput: "1420" },
    { id: "log-2", cardId: "card-1", week: "Semana 2", amount: "R$ 2.180", trend: "+53%", amountInput: "2180" },
    { id: "log-3", cardId: "card-1", week: "Semana 3", amount: "R$ 2.640", trend: "+21%", amountInput: "2640" },
    { id: "log-4", cardId: "card-1", week: "Semana 4", amount: "R$ 3.090", trend: "+17%", amountInput: "3090" },
  ],
  fixedExpenses: [
    { id: "fix-1", title: "Aluguel", due: "Todo dia 05", amount: "R$ 2.300", tone: "primary", status: "Pago", category: "Moradia", paymentMethod: "Debito em conta", startsOn: "2026-04-05", recurringType: "monthly", amountInput: "2300" },
    { id: "fix-2", title: "Internet + celular", due: "Todo dia 10", amount: "R$ 189", tone: "secondary", status: "Pago", category: "Contas", paymentMethod: "Cartao", startsOn: "2026-04-10", recurringType: "monthly", amountInput: "189" },
    { id: "fix-3", title: "Streaming e apps", due: "Todo dia 14", amount: "R$ 96", tone: "neutral", status: "Pendente", category: "Assinaturas", paymentMethod: "Cartao", startsOn: "2026-04-14", recurringType: "monthly", amountInput: "96" },
  ],
  accounts: [
    { id: "acc-1", name: "Conta principal", meta: "Nubank principal", amount: "R$ 12.450,12", status: "Disponivel", bank: "Nubank", balanceInput: "12450.12" },
    { id: "acc-2", name: "Reserva", meta: "Inter reserva", amount: "R$ 84.200,00", status: "0,5% a.m.", bank: "Inter", balanceInput: "84200" },
  ],
  cards: [
    { id: "card-1", nickname: "Ultravioleta", limit: "R$ 25.000,00", closingDay: 5, dueDay: 12, usedAmount: "R$ 3.090,00", status: "12% usado", creditLimitInput: "25000" },
    { id: "card-2", nickname: "Visa viagens", limit: "R$ 8.000,00", closingDay: 10, dueDay: 20, usedAmount: "R$ 1.420,00", status: "18% usado", creditLimitInput: "8000" },
  ],
  planning: [
    { id: "plan-1", category: "Mercado", planned: "R$ 1.200", actual: "R$ 980", status: "Dentro", plannedInput: "1200", actualInput: "980" },
    { id: "plan-2", category: "Transporte", planned: "R$ 600", actual: "R$ 520", status: "Dentro", plannedInput: "600", actualInput: "520" },
    { id: "plan-3", category: "Lazer", planned: "R$ 800", actual: "R$ 920", status: "Acima", plannedInput: "800", actualInput: "920" },
    { id: "plan-4", category: "Saude", planned: "R$ 350", actual: "R$ 280", status: "Dentro", plannedInput: "350", actualInput: "280" },
  ],
  incomes: [
    { id: "inc-1", name: "Salario", amount: "R$ 9.800", type: "recurring", frequency: "monthly", startsOn: "2026-01-05", amountInput: "9800" },
    { id: "inc-2", name: "Freela", amount: "R$ 2.380", type: "one_time", frequency: "one_time", monthKey: "2026-04", startsOn: "2026-04-17", amountInput: "2380" },
  ],
};
