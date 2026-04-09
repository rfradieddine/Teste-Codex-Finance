"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bootstrapSql, getDbClient } from "@/lib/db";

export async function createAccountAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);
    await sql`
      insert into accounts (name, bank, balance, status)
      values (
        ${String(formData.get("name") ?? "").trim()},
        ${nullableString(formData.get("bank"))},
        ${parseMoney(formData.get("balance"))},
        'active'
      )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Conta salva com sucesso.");
}

export async function deleteAccountAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`delete from accounts where id = ${String(formData.get("id") ?? "")}`;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Conta removida.");
}

export async function updateAccountAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`
      update accounts
      set
        name = ${String(formData.get("name") ?? "").trim()},
        bank = ${nullableString(formData.get("bank"))},
        balance = ${parseMoney(formData.get("balance"))}
      where id = ${String(formData.get("id") ?? "")}
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Conta atualizada com sucesso.");
}

export async function createCardAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);
    await sql`
      insert into cards (nickname, credit_limit, closing_day, due_day)
      values (
        ${String(formData.get("nickname") ?? "").trim()},
        ${parseMoney(formData.get("credit_limit"))},
        ${parseDay(formData.get("closing_day"))},
        ${parseDay(formData.get("due_day"))}
      )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Cartao salvo com sucesso.");
}

export async function deleteCardAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`delete from cards where id = ${String(formData.get("id") ?? "")}`;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Cartao removido.");
}

export async function updateCardAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`
      update cards
      set
        nickname = ${String(formData.get("nickname") ?? "").trim()},
        credit_limit = ${parseMoney(formData.get("credit_limit"))},
        closing_day = ${parseDay(formData.get("closing_day"))},
        due_day = ${parseDay(formData.get("due_day"))}
      where id = ${String(formData.get("id") ?? "")}
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Cartao atualizado com sucesso.");
}

export async function createWeeklyLogAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);

    const cardId = String(formData.get("card_id") ?? "");
    if (!cardId) {
      return redirectWithMessage(formData, "Selecione um cartao valido.", "error");
    }

    await sql`
      insert into weekly_card_logs (card_id, month_key, week_label, cumulative_amount)
      values (
        ${cardId},
        ${currentMonthKey()},
        ${String(formData.get("week_label") ?? "").trim()},
        ${parseMoney(formData.get("cumulative_amount"))}
      )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Lancamento salvo com sucesso.");
}

export async function deleteWeeklyLogAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`delete from weekly_card_logs where id = ${String(formData.get("id") ?? "")}`;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Lancamento removido.");
}

export async function updateWeeklyLogAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`
      update weekly_card_logs
      set
        card_id = ${String(formData.get("card_id") ?? "")},
        week_label = ${String(formData.get("week_label") ?? "").trim()},
        cumulative_amount = ${parseMoney(formData.get("cumulative_amount"))}
      where id = ${String(formData.get("id") ?? "")}
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Lancamento atualizado com sucesso.");
}

export async function createFixedExpenseAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);
    await sql`
      insert into fixed_expenses (name, amount, category, payment_method, starts_on, recurring_type, active)
      values (
        ${String(formData.get("name") ?? "").trim()},
        ${parseMoney(formData.get("amount"))},
        ${String(formData.get("category") ?? "").trim()},
        ${String(formData.get("payment_method") ?? "").trim()},
        ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)},
        ${String(formData.get("recurring_type") ?? "monthly")},
        true
      )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/fixed-expenses");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Gasto fixo salvo com sucesso.");
}

export async function deleteFixedExpenseAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`delete from fixed_expenses where id = ${String(formData.get("id") ?? "")}`;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/fixed-expenses");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Gasto fixo removido.");
}

export async function updateFixedExpenseAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`
      update fixed_expenses
      set
        name = ${String(formData.get("name") ?? "").trim()},
        amount = ${parseMoney(formData.get("amount"))},
        category = ${String(formData.get("category") ?? "").trim()},
        payment_method = ${String(formData.get("payment_method") ?? "").trim()},
        starts_on = ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)},
        recurring_type = ${String(formData.get("recurring_type") ?? "monthly")}
      where id = ${String(formData.get("id") ?? "")}
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/fixed-expenses");
  revalidatePath("/cards");
  redirectWithMessage(formData, "Gasto fixo atualizado com sucesso.");
}

export async function createPlanningAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);
    await sql`
      insert into planning_budgets (category, planned_amount, actual_amount, month_key)
      values (
        ${String(formData.get("category") ?? "").trim()},
        ${parseMoney(formData.get("planned_amount"))},
        ${parseMoney(formData.get("actual_amount"))},
        ${currentMonthKey()}
      )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Planejamento salvo com sucesso.");
}

export async function updatePlanningAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`
      update planning_budgets
      set
        category = ${String(formData.get("category") ?? "").trim()},
        planned_amount = ${parseMoney(formData.get("planned_amount"))},
        actual_amount = ${parseMoney(formData.get("actual_amount"))}
      where id = ${String(formData.get("id") ?? "")}
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Planejamento atualizado com sucesso.");
}

export async function deletePlanningAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql`delete from planning_budgets where id = ${String(formData.get("id") ?? "")}`;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Planejamento removido.");
}

export async function createIncomeAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    await sql.unsafe(bootstrapSql);
    const type = String(formData.get("type") ?? "recurring");

    if (type === "one_time") {
      await sql`
        insert into income_entries (name, amount, month_key, entry_type, occurs_on)
        values (
          ${String(formData.get("name") ?? "").trim()},
          ${parseMoney(formData.get("amount"))},
          ${currentMonthKey()},
          'one_time',
          ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)}
        )
      `;
    } else {
      await sql`
        insert into recurring_income (name, amount, starts_on, recurring_type, active)
        values (
          ${String(formData.get("name") ?? "").trim()},
          ${parseMoney(formData.get("amount"))},
          ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)},
          ${String(formData.get("frequency") ?? "monthly")},
          true
        )
      `;
    }
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Receita salva com sucesso.");
}

export async function updateIncomeAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    const type = String(formData.get("type") ?? "recurring");
    const id = String(formData.get("id") ?? "");

    if (type === "one_time") {
      await sql`
        update income_entries
        set
          name = ${String(formData.get("name") ?? "").trim()},
          amount = ${parseMoney(formData.get("amount"))},
          occurs_on = ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)}
        where id = ${id}
      `;
    } else {
      await sql`
        update recurring_income
        set
          name = ${String(formData.get("name") ?? "").trim()},
          amount = ${parseMoney(formData.get("amount"))},
          starts_on = ${String(formData.get("starts_on") ?? "").trim() || new Date().toISOString().slice(0, 10)},
          recurring_type = ${String(formData.get("frequency") ?? "monthly")}
        where id = ${id}
      `;
    }
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Receita atualizada com sucesso.");
}

export async function deleteIncomeAction(formData: FormData) {
  const sql = await getDbClient();
  if (!sql) {
    return redirectWithMessage(formData, "Nao foi possivel conectar ao banco.", "error");
  }

  try {
    const type = String(formData.get("type") ?? "recurring");
    const id = String(formData.get("id") ?? "");

    if (type === "one_time") {
      await sql`delete from income_entries where id = ${id}`;
    } else {
      await sql`delete from recurring_income where id = ${id}`;
    }
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/planning");
  redirectWithMessage(formData, "Receita removida.");
}

export async function copyPlanningToNextMonthAction() {
  const sql = await getDbClient();
  if (!sql) {
    redirect("/planning?flash=Banco%20indisponivel&tone=error");
  }

  try {
    await sql.unsafe(bootstrapSql);

    const currentMonth = currentMonthKey();
    const nextMonth = nextMonthKey(currentMonth);

    await sql`
      insert into planning_budgets (category, planned_amount, actual_amount, month_key)
      select p.category, p.planned_amount, 0, ${nextMonth}
      from planning_budgets p
      where p.month_key = ${currentMonth}
        and not exists (
          select 1
          from planning_budgets existing
          where existing.month_key = ${nextMonth}
            and existing.category = p.category
        )
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/planning");
  redirect("/planning?flash=Planejamento%20copiado%20para%20o%20proximo%20mes&tone=success");
}

export async function closeCurrentMonthAction() {
  const sql = await getDbClient();
  if (!sql) {
    redirect("/dashboard?flash=Banco%20indisponivel&tone=error");
  }

  const monthKey = currentMonthKey();

  try {
    await sql.unsafe(bootstrapSql);

    const [accounts, weeklyLogs, fixedExpenses, recurringIncome, oneTimeIncome] = await Promise.all([
      sql<{ balance: string }[]>`select balance::text from accounts`,
      sql<{ cumulative_amount: string }[]>`select cumulative_amount::text from weekly_card_logs where month_key = ${monthKey} order by created_at asc`,
      sql<{ amount: string; starts_on: string; ends_on: string | null; recurring_type: string }[]>`
        select amount::text, starts_on::text, ends_on::text, recurring_type from fixed_expenses where active = true
      `,
      sql<{ amount: string; starts_on: string; recurring_type: string }[]>`
        select amount::text, starts_on::text, recurring_type from recurring_income where active = true
      `,
      sql<{ amount: string }[]>`select amount::text from income_entries where month_key = ${monthKey}`,
    ]);

    const totalAccounts = accounts.reduce((sum, item) => sum + Number(item.balance), 0);
    const totalCardSpent = weeklyLogs.length ? Number(weeklyLogs[weeklyLogs.length - 1].cumulative_amount) : 0;
    const totalFixed = fixedExpenses
      .filter((item) => isRecurringActiveInMonth(item.starts_on, item.ends_on, item.recurring_type, monthKey))
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalRecurringIncome = recurringIncome
      .filter((item) => isRecurringActiveInMonth(item.starts_on, null, item.recurring_type, monthKey))
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalOneTimeIncome = oneTimeIncome.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalIncome = totalRecurringIncome + totalOneTimeIncome;
    const availableBalance = totalAccounts + totalIncome - totalCardSpent - totalFixed;

    await sql`
      insert into monthly_snapshots (
        month_key,
        income_total,
        fixed_total,
        card_total,
        account_total,
        available_balance,
        closed_at,
        updated_at
      )
      values (
        ${monthKey},
        ${totalIncome},
        ${totalFixed},
        ${totalCardSpent},
        ${totalAccounts},
        ${availableBalance},
        now(),
        now()
      )
      on conflict (month_key) do update
      set
        income_total = excluded.income_total,
        fixed_total = excluded.fixed_total,
        card_total = excluded.card_total,
        account_total = excluded.account_total,
        available_balance = excluded.available_balance,
        closed_at = now(),
        updated_at = now()
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/dashboard?flash=Mes%20fechado%20com%20sucesso&tone=success");
}

function parseMoney(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalized || 0);
}

function parseDay(value: FormDataEntryValue | null) {
  const normalized = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Math.min(Math.max(normalized || 1, 1), 31);
}

function nullableString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function currentMonthKey() {
  const now = new Date();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

function nextMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + 1);
  const nextMonth = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${nextMonth}`;
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

function redirectWithMessage(
  formData: FormData,
  message: string,
  tone: "success" | "error" = "success",
) {
  const basePath = String(formData.get("redirect_to") ?? "/dashboard");
  redirect(`${basePath}?flash=${encodeURIComponent(message)}&tone=${tone}`);
}
