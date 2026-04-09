export type NavItem = {
  href: string;
  label: string;
  icon: "grid" | "credit-card" | "receipt" | "chart-pie" | "settings";
};

export type WeeklyLog = {
  id?: string;
  cardId?: string;
  week: string;
  amount: string;
  trend: string;
  amountInput?: string;
};

export type FixedExpense = {
  id?: string;
  title: string;
  due: string;
  amount: string;
  tone: "primary" | "secondary" | "neutral";
  status: "Pago" | "Pendente" | "Ativo";
  category?: string;
  paymentMethod?: string;
  startsOn?: string;
  recurringType?: string;
  amountInput?: string;
};

export type Account = {
  id?: string;
  name: string;
  meta: string;
  amount: string;
  status: string;
  bank?: string;
  balanceInput?: string;
};

export type Card = {
  id?: string;
  nickname: string;
  limit: string;
  closingDay: number;
  dueDay: number;
  usedAmount?: string;
  status?: string;
  creditLimitInput?: string;
};

export type MonthlyMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "secondary";
};

export type CardInvoice = {
  id: string;
  cardId?: string;
  cardName: string;
  monthKey: string;
  monthLabel: string;
  amount: string;
  amountInput?: string;
  dueLabel: string;
  closingLabel: string;
  status: string;
  utilization: string;
  isProjected?: boolean;
};

export type MonthlyCategorySummaryRow = {
  label: string;
  amount: string;
  type: "income" | "expense" | "total" | "balance";
  detail: string;
};

export type PlanningCategory = {
  id?: string;
  category: string;
  planned: string;
  actual: string;
  status: string;
  plannedInput?: string;
  actualInput?: string;
};

export type IncomeEntry = {
  id?: string;
  name: string;
  amount: string;
  type: "recurring" | "one_time";
  frequency?: "monthly" | "yearly" | "one_time";
  monthKey?: string;
  startsOn?: string;
  amountInput?: string;
};

export type FinFlowSnapshot = {
  monthKey: string;
  currentMonth: string;
  closingInfo: string;
  heroMetrics: MonthlyMetric[];
  cardInvoices: CardInvoice[];
  monthlyCategorySummary: MonthlyCategorySummaryRow[];
  weeklyLogs: WeeklyLog[];
  fixedExpenses: FixedExpense[];
  accounts: Account[];
  cards: Card[];
  planning: PlanningCategory[];
  incomes: IncomeEntry[];
  monthlyComparison: MonthlyMetric[];
  quickStats: MonthlyMetric[];
};

export type MonthLockState = {
  monthKey: string;
  isClosed: boolean;
  statusMessage: string;
  actionLabel: string;
};
