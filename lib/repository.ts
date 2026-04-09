import { unstable_noStore as noStore } from "next/cache";
import { bootstrapSql, getDbClient } from "@/lib/db";
import { mockSnapshot } from "@/lib/mock-data";
import type { FinFlowSnapshot, IncomeEntry } from "@/lib/types";

export async function getFinFlowSnapshot(): Promise<FinFlowSnapshot> {
  noStore();

  if (!process.env.DATABASE_URL) {
    return mockSnapshot;
  }

  const sql = await getDbClient();
  if (!sql) {
    return mockSnapshot;
  }

  try {
    await sql.unsafe(bootstrapSql);

    const monthKey = getCurrentMonthKey();

    const [accounts, cards, fixedExpenses, weeklyLogs, recurringIncome, oneTimeIncome, planning] =
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

    const totalAccounts = accounts.reduce((sum, item) => sum + Number(item.balance), 0);
    const totalCardSpent = weeklyLogs.length > 0 ? Number(weeklyLogs[weeklyLogs.length - 1].cumulative_amount) : 0;
    const totalLimit = cards.reduce((sum, item) => sum + Number(item.credit_limit), 0);
    const totalFixed = filteredFixed.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amountInput ?? "0"), 0);
    const availableBalance = totalAccounts + totalIncome - totalCardSpent - totalFixed;

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
    }[]>`select month_key, available_balance::text, closed_at::text from monthly_snapshots order by month_key desc limit 6`;

    const monthlyComparison = monthlySnapshots.length
      ? [...monthlySnapshots]
          .reverse()
          .map((item, index, arr) => ({
            label: formatMonthLabel(item.month_key),
            value: formatCurrency(item.available_balance),
            detail: item.closed_at ? "Fechado" : index === arr.length - 1 ? "Atual" : "Historico",
          }))
      : mockSnapshot.monthlyComparison;

    return {
      ...mockSnapshot,
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
      accounts: accounts.length
        ? accounts.map((account) => ({
            id: account.id,
            name: account.name,
            meta: account.bank ?? "Conta conectada",
            amount: formatCurrency(account.balance),
            status: account.status,
            bank: account.bank ?? "",
            balanceInput: String(account.balance),
          }))
        : mockSnapshot.accounts,
      cards: cards.length
        ? cards.map((card) => ({
            id: card.id,
            nickname: card.nickname,
            limit: formatCurrency(card.credit_limit),
            closingDay: card.closing_day,
            dueDay: card.due_day,
            usedAmount: formatCurrency(totalCardSpent),
            status: totalLimit > 0 ? `${Math.round((totalCardSpent / totalLimit) * 100)}% usado` : "Novo",
            creditLimitInput: String(card.credit_limit),
          }))
        : mockSnapshot.cards,
      fixedExpenses: filteredFixed.length
        ? filteredFixed.map((item, index) => ({
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
          }))
        : mockSnapshot.fixedExpenses,
      weeklyLogs: weeklyLogs.length
        ? weeklyLogs.map((log, index, arr) => {
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
          })
        : mockSnapshot.weeklyLogs,
      planning: planning.length
        ? planning.map((item) => ({
            id: item.id,
            category: item.category,
            planned: formatCurrency(item.planned_amount),
            actual: formatCurrency(item.actual_amount),
            status: Number(item.actual_amount) > Number(item.planned_amount) ? "Acima" : "Dentro",
            plannedInput: String(item.planned_amount),
            actualInput: String(item.actual_amount),
          }))
        : mockSnapshot.planning,
      incomes: incomes.length ? incomes : mockSnapshot.incomes,
      monthlyComparison,
    };
  } catch {
    return mockSnapshot;
  } finally {
    await sql.end({ timeout: 1 });
  }
}

export function getDatabaseStatus() {
  return process.env.DATABASE_URL
    ? "DATABASE_URL configurada: pronto para conectar o Postgres na Vercel."
    : "Modo demo: usando dados locais ate configurar DATABASE_URL.";
}

export async function getMonthlyClosureStatus() {
  if (!process.env.DATABASE_URL) {
    return "Modo demo: sem fechamento mensal persistido.";
  }

  const sql = await getDbClient();
  if (!sql) {
    return "Banco indisponivel no momento.";
  }

  try {
    await sql.unsafe(bootstrapSql);
    const monthKey = getCurrentMonthKey();
    const rows = await sql<{ closed_at: string | null }[]>`
      select closed_at::text from monthly_snapshots where month_key = ${monthKey} limit 1
    `;

    const closedAt = rows[0]?.closed_at;
    return closedAt
      ? `Mes ${monthKey} fechado em ${formatDateTime(closedAt)}.`
      : `Mes ${monthKey} ainda aberto.`;
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

function getCurrentMonthKey() {
  const now = new Date();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
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
