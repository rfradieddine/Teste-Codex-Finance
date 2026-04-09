export function getCurrentMonthKey() {
  const now = new Date();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

export function normalizeMonthKey(value?: string | null) {
  if (!value) {
    return getCurrentMonthKey();
  }

  return /^\d{4}-\d{2}$/.test(value) ? value : getCurrentMonthKey();
}

export function shiftMonthKey(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + delta);
  const nextMonth = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${nextMonth}`;
}

export function buildMonthRoute(pathname: string, monthKey: string) {
  return `${pathname}?month=${monthKey}`;
}
