import { unstable_noStore as noStore } from "next/cache";
import { bootstrapSql, getDbClient } from "@/lib/db";
import { mockSnapshot } from "@/lib/mock-data";
import { getCurrentMonthKey, normalizeMonthKey, shiftMonthKey } from "@/lib/months";
import type { CardInvoice, FinFlowSnapshot, IncomeEntry, MonthLockState, MonthlyCategorySummaryRow } from "@/lib/types";

export async function getFinFlowSnapshot(requestedMonthKey?: string): Promise<FinFlowSnapshot> {
  noStore();
  const monthKey = normalizeMonthKey(requestedMonthKey);

  if (!process.env.DATABASE_URL) {
    return {
      ...mockSnapshot,
      monthKey,
      currentMonth: formatMonthHeading(monthKey),
      monthlyComparison: buildEmptyMonthlyComparison(monthKey),
    };
  }

  const sql = await getDbClient();
  if (!sql) {
    return mockSnapshot;
  }

  try {
    await sql.unsafe(bootstrapSql);

    const invoiceMonthKeys = Array.from({ length: 3 }, (_, index) => shiftMonthKey(monthKey, index));
    const [accounts, cards, fixedExpenses, weeklyLogs, invoiceLogs, recurringIncome, oneTimeIncome, planning] =
      await Promise.all([
        sql<{
          id: string;
          name: string;
          bank: string | null;
          balance: string;
          status: string;
        }[]>`select id, name, bank, balance::text, status from accounts order by created_at desc`,
        sql<{
          id: string;
          nickname: string;
          credit_limit: string;
          closing_day: number;
          due_day: number;
        }[]>`select id, nickname, credit_limit::text, closing_day, due_day from cards where active = true order by created_at desc`,
        sql<{
          id: string;
          name: string;
          amount: string;
          category: string;
          payment_method: string;
          starts_on: string;
          ends_on: string | null;
          recurring_type: string;
        }[]>`select id, name, amount::text, category, payment_method, starts_on::text, ends_on::text, recurring_type from fixed_expenses where active = true order by starts_on asc`,
        sql<{
          id: string;
          card_id: string;
          week_label: string;
          cumulative_amount: string;
        }[]>`select id, card_id, week_label, cumulative_amount::text from weekly_card_logs where month_key = ${monthKey} order by created_at asc`,
        sql<{
          card_id: string;
          month_key: string;
          cumulative_amount: string;
          created_at: string;
        }[]>`select card_id, month_key, cumulative_amount::text, created_at::text from weekly_card_logs where month_key = any(${invoiceMonthKeys}) order by created_at asc`,
        sql<{
          id: string;
          name: string;
          amount: string;
          starts_on: string;
          recurring_type: "monthly" | "yearly";
        }[]>`select id, name, amount::text, starts_on::text, recurring_type from recurring_income where active = true order by created_at desc`,
        sql<{
          id: string;
          name: string;
          amount: string;
          month_key: string;
          entry_type: "one_time";
          occurs_on: string;
        }[]>`select id, name, amount::text, month_key, entry_type, occurs_on::text from income_entries where month_key = ${monthKey} order by occurs_on desc`,
        sql<{
          id: string;
          category: string;
          planned_amount: string;
          actual_amount: string;
          month_key: string;
        }[]>`select id, category, planned_amount::text, actual_amount::text, month_key from planning_budgets where month_key = ${monthKey} order by category asc`,
      ]);

    const filteredFixed = fixedExpenses.filter((item) =>
      isRecurringActiveInMonth(item.starts_on, item.ends_on, item.recurring_type, monthKey),
    );

    const recurringIncomeActive = recurringIncome.filter((item) =>
      isRecurringActiveInMonth(item.starts_on, null, item.recurring_type, monthKey),
    );

    const recurringIncomeItems: IncomeEntry[] = recurringIncomeActive.map((item) => ({
      id: item.id,
      name: item.name,
      amount: formatCurrency(item.amount),
      type: "recurring",
      frequency: item.recurring_type,
      startsOn: item.starts_on,
      amountInput: String(item.amount),
    }));

    const oneTimeIncomeItems: IncomeEntry[] = oneTimeIncome.map((item) => ({
      id: item.id,
      name: item.name,
      amount: formatCurrency(item.amount),
      type: "one_time",
      frequency: "one_time",
      monthKey: item.month_key,
      startsOn: item.occurs_on,
      amountInput: String(item.amount),
    }));

    const incomes = [...recurringIncomeItems, ...oneTimeIncomeItems];
    const cardInvoices = buildCardInvoices(cards, invoiceLogs, monthKey);

    const totalAccounts = accounts.reduce((sum, item) => sum + Number(item.balance), 0);
    const totalCardSpent = weeklyLogs.length > 0 ? Number(weeklyLogs[weeklyLogs.length - 1].cumulative_amount) : 0;
    const totalLimit = cards.reduce((sum, item) => sum + Number(item.credit_limit), 0);
    const totalFixed = filteredFixed.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amountInput ?? "0"), 0);
    const availableBalance = totalAccounts + totalIncome - totalCardSpent - totalFixed;
    const currentMonthLabel = formatMonthHeading(monthKey);
    const closingInfo = getClosingInfo(cards);

    await sql`
      insert into monthly_snapshots (
        month_key,
        income_total,
        fixed_total,
        card_total,
        account_total,
        available_balance,
        updated_at
      )
      values (
        ${monthKey},
        ${totalIncome},
        ${totalFixed},
        ${totalCardSpent},
        ${totalAccounts},
        ${availableBalance},
        now()
      )
      on conflict (month_key) do update
      set
        income_total = excluded.income_total,
        fixed_total = excluded.fixed_total,
        card_total = excluded.card_total,
        account_total = excluded.account_total,
        available_balance = excluded.available_balance,
        updated_at = now()
      where monthly_snapshots.closed_at is null
    `;

    const monthlySnapshots = await sql<{
      month_key: string;
      available_balance: string;
      closed_at: string | null;
    }[]>`select month_key, available_balance::text, closed_at::text from monthly_snapshots order by month_key desc limit 24`;

    const monthlyComparison = buildMonthlyComparison(monthKey, monthlySnapshots);
    const monthlyCategorySummary = buildMonthlyCategorySummary({
      incomes,
      fixedExpenses: filteredFixed,
      cardInvoices,
      selectedMonthKey: monthKey,
      availableBalance,
    });

    return {
      ...mockSnapshot,
      monthKey,
      currentMonth: currentMonthLabel,
      closingInfo,
      heroMetrics: [
        {
          label: "Saldo disponivel",
          value: formatCurrency(availableBalance),
          detail: "Apos receitas, fixos e cartoes",
          tone: "primary",
        },
        {
          label: "Projecao do mes",
          value: formatCurrency(availableBalance - totalCardSpent * 0.25),
          detail: "Baseado no ritmo atual",
          tone: "secondary",
        },
      ],
      cardInvoices,
      monthlyCategorySummary,
      quickStats: [
        {
          label: "Total em contas",
          value: formatCurrency(totalAccounts),
          detail: `${accounts.length} conta(s) cadastrada(s)`,
          tone: "primary",
        },
        {
          label: "Uso do limite",
          value: totalLimit > 0 ? `${Math.round((totalCardSpent / totalLimit) * 100)}%` : "0%",
          detail: totalLimit > 0 ? "Cartoes ativos" : "Cadastre um cartao",
          tone: "secondary",
        },
        {
          label: "Fixos do mes",
          value: formatCurrency(totalFixed),
          detail: `${filteredFixed.length} recorrencia(s) ativa(s)`,
        },
        {
          label: "Receitas",
          value: formatCurrency(totalIncome),
          detail: `${incomes.length} entrada(s) no mes`,
        },
      ],
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        meta: account.bank ?? "Conta conectada",
        amount: formatCurrency(account.balance),
        status: account.status,
        bank: account.bank ?? "",
        balanceInput: String(account.balance),
      })),
      cards: cards.map((card) => ({
        id: card.id,
        nickname: card.nickname,
        limit: formatCurrency(card.credit_limit),
        closingDay: card.closing_day,
        dueDay: card.due_day,
        usedAmount: formatCurrency(totalCardSpent),
        status: totalLimit > 0 ? `${Math.round((totalCardSpent / totalLimit) * 100)}% usado` : "Novo",
        creditLimitInput: String(card.credit_limit),
      })),
      fixedExpenses: filteredFixed.map((item, index) => ({
        id: item.id,
        title: item.name,
        due: `Inicio ${item.starts_on}`,
        amount: formatCurrency(item.amount),
        tone: index % 3 === 0 ? "primary" : index % 3 === 1 ? "secondary" : "neutral",
        status: "Ativo",
        category: item.category,
        paymentMethod: item.payment_method,
        startsOn: item.starts_on,
        recurringType: item.recurring_type,
        amountInput: String(item.amount),
      })),
      weeklyLogs: weeklyLogs.map((log, index, arr) => {
        const prev = index === 0 ? 0 : Number(arr[index - 1].cumulative_amount);
        const current = Number(log.cumulative_amount);
        const diff = current - prev;

        return {
          id: log.id,
          cardId: log.card_id,
          week: log.week_label,
          amount: formatCurrency(log.cumulative_amount),
          trend: `${diff >= 0 ? "+" : ""}${formatCurrency(diff)}`,
          amountInput: String(log.cumulative_amount),
        };
      }),
      planning: planning.map((item) => ({
        id: item.id,
        category: item.category,
        planned: formatCurrency(item.planned_amount),
        actual: formatCurrency(item.actual_amount),
        status: Number(item.actual_amount) > Number(item.planned_amount) ? "Acima" : "Dentro",
        plannedInput: String(item.planned_amount),
        actualInput: String(item.actual_amount),
      })),
      incomes,
      monthlyComparison,
    };
  } catch {
    return {
      ...mockSnapshot,
      monthKey,
      currentMonth: formatMonthHeading(monthKey),
      monthlyComparison: buildEmptyMonthlyComparison(monthKey),
    };
  } finally {
    await sql.end({ timeout: 1 });
  }
}

export function getDatabaseStatus() {
  return process.env.DATABASE_URL
    ? "Banco ativo: usando Postgres real via DATABASE_URL."
    : "Modo demo: usando dados locais ate configurar DATABASE_URL.";
}

export async function getMonthlyClosureStatus(monthKey?: string) {
  const state = await getCurrentMonthLockState(monthKey);
  return state.statusMessage;
}

export async function getCurrentMonthLockState(requestedMonthKey?: string): Promise<MonthLockState> {
  const monthKey = normalizeMonthKey(requestedMonthKey);

  if (!process.env.DATABASE_URL) {
    return {
      monthKey,
      isClosed: false,
      statusMessage: "Modo demo: sem fechamento mensal persistido.",
      actionLabel: "Fechar mes atual",
    };
  }

  const sql = await getDbClient();
  if (!sql) {
    return {
      monthKey,
      isClosed: false,
      statusMessage: "Banco indisponivel no momento.",
      actionLabel: "Fechar mes atual",
    };
  }

  try {
    await sql.unsafe(bootstrapSql);
    const rows = await sql<{ closed_at: string | null }[]>`
      select closed_at::text from monthly_snapshots where month_key = ${monthKey} limit 1
    `;

    const closedAt = rows[0]?.closed_at;
    return closedAt
      ? {
          monthKey,
          isClosed: true,
          statusMessage: `Mes ${monthKey} fechado em ${formatDateTime(closedAt)}.`,
          actionLabel: "Reabrir mes atual",
        }
      : {
          monthKey,
          isClosed: false,
          statusMessage: `Mes ${monthKey} ainda aberto.`,
          actionLabel: "Fechar mes atual",
        };
  } finally {
    await sql.end({ timeout: 1 });
  }
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function isRecurringActiveInMonth(
  startsOn: string,
  endsOn: string | null,
  recurringType: string,
  monthKey: string,
) {
  const [year, month] = monthKey.split("-").map(Number);
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0));
  const start = new Date(`${startsOn}T00:00:00Z`);
  const end = endsOn ? new Date(`${endsOn}T23:59:59Z`) : null;

  if (start > monthEnd) {
    return false;
  }

  if (end && end < monthStart) {
    return false;
  }

  if (recurringType === "yearly") {
    return start.getUTCMonth() === monthStart.getUTCMonth();
  }

  return true;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date
    .toLocaleString("pt-BR", {
      month: "short",
      timeZone: "UTC",
    })
    .replace(".", "")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMonthHeading(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getClosingInfo(cards: { due_day: number }[]) {
  if (cards.length === 0) {
    return "Nenhum cartao com vencimento cadastrado";
  }

  const nearestDueDay = Math.min(...cards.map((card) => card.due_day));
  return `Proximo vencimento no dia ${String(nearestDueDay).padStart(2, "0")}`;
}

function buildEmptyMonthlyComparison(monthKey: string) {
  const items = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const itemMonthKey = shiftMonthKey(monthKey, -offset);
    const [year, month] = itemMonthKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));

    items.push({
      label: date
        .toLocaleString("pt-BR", {
          month: "short",
          timeZone: "UTC",
        })
        .replace(".", "")
        .replace(/^\w/, (char) => char.toUpperCase()),
      value: formatCurrency(0),
      detail: offset === 0 ? "Atual" : "Sem dados",
    });
  }

  return items;
}

function buildMonthlyComparison(
  selectedMonthKey: string,
  snapshots: { month_key: string; available_balance: string; closed_at: string | null }[],
) {
  if (snapshots.length === 0) {
    return buildEmptyMonthlyComparison(selectedMonthKey);
  }

  const snapshotMap = new Map(snapshots.map((item) => [item.month_key, item]));

  return Array.from({ length: 6 }, (_, index) => {
    const monthKey = shiftMonthKey(selectedMonthKey, index - 5);
    const item = snapshotMap.get(monthKey);

    return {
      label: formatMonthLabel(monthKey),
      value: formatCurrency(item?.available_balance ?? 0),
      detail: monthKey === selectedMonthKey ? (item?.closed_at ? "Fechado" : "Atual") : item?.closed_at ? "Fechado" : item ? "Historico" : "Sem dados",
    };
  });
}

function buildCardInvoices(
  cards: { id: string; nickname: string; credit_limit: string; closing_day: number; due_day: number }[],
  logs: { card_id: string; month_key: string; cumulative_amount: string; created_at: string }[],
  selectedMonthKey: string,
): CardInvoice[] {
  const invoiceMonths = Array.from({ length: 3 }, (_, index) => shiftMonthKey(selectedMonthKey, index));

  return cards.flatMap((card) =>
    invoiceMonths.map((invoiceMonthKey, index) => {
      const monthLogs = logs
        .filter((log) => log.card_id === card.id && log.month_key === invoiceMonthKey)
        .sort((left, right) => left.created_at.localeCompare(right.created_at));

      const latestAmount = monthLogs.length ? Number(monthLogs[monthLogs.length - 1].cumulative_amount) : 0;
      const limit = Number(card.credit_limit) || 0;
      const usage = limit > 0 ? `${Math.round((latestAmount / limit) * 100)}% do limite` : "Sem limite";

      return {
        id: `${card.id}-${invoiceMonthKey}`,
        cardId: card.id,
        cardName: card.nickname,
        monthKey: invoiceMonthKey,
        monthLabel: formatShortMonthYear(invoiceMonthKey),
        amount: formatCurrency(latestAmount),
        amountInput: String(latestAmount),
        dueLabel: `Vence dia ${String(card.due_day).padStart(2, "0")}`,
        closingLabel: `Fecha dia ${String(card.closing_day).padStart(2, "0")}`,
        status: index === 0 ? "Fatura atual" : index === 1 ? "Proxima fatura" : "Fatura futura",
        utilization: usage,
        isProjected: monthLogs.length === 0,
      };
    }),
  );
}

function formatShortMonthYear(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(".", "")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function buildMonthlyCategorySummary({
  incomes,
  fixedExpenses,
  cardInvoices,
  selectedMonthKey,
  availableBalance,
}: {
  incomes: IncomeEntry[];
  fixedExpenses: {
    category: string;
    amount: string;
  }[];
  cardInvoices: CardInvoice[];
  selectedMonthKey: string;
  availableBalance: number;
}): MonthlyCategorySummaryRow[] {
  const incomeRows: MonthlyCategorySummaryRow[] = incomes.map((income) => ({
    label: income.name,
    amount: income.amount,
    type: "income",
    detail: income.type === "recurring" ? "Receita recorrente" : "Receita pontual",
  }));

  const fixedByCategory = new Map<string, number>();
  for (const item of fixedExpenses) {
    fixedByCategory.set(item.category, (fixedByCategory.get(item.category) ?? 0) + Number(item.amount));
  }

  const fixedRows: MonthlyCategorySummaryRow[] = Array.from(fixedByCategory.entries()).map(([category, total]) => ({
    label: category,
    amount: formatCurrency(total),
    type: "expense",
    detail: "Gastos fixos",
  }));

  const currentInvoices = cardInvoices
    .filter((invoice) => invoice.monthKey === selectedMonthKey)
    .map((invoice) => ({
      label: `Cartao ${invoice.cardName}`,
      amount: invoice.amount,
      type: "expense" as const,
      detail: "Fatura do mes",
    }));

  const totalExpenses =
    fixedRows.reduce((sum, item) => sum + parseCurrencyString(item.amount), 0) +
    currentInvoices.reduce((sum, item) => sum + parseCurrencyString(item.amount), 0);

  return [
    ...incomeRows,
    ...fixedRows,
    ...currentInvoices,
    {
      label: "Total de gastos",
      amount: formatCurrency(totalExpenses),
      type: "total",
      detail: "Fixos + cartoes",
    },
    {
      label: "Saldo restante",
      amount: formatCurrency(availableBalance),
      type: "balance",
      detail: "Receitas - gastos + contas",
    },
  ];
}

function parseCurrencyString(value: string) {
  return Number(
    value
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
}
