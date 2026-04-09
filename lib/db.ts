export async function getDbClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { default: postgres } = await import("postgres");

  return postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 1,
  });
}

export const bootstrapSql = `
create extension if not exists pgcrypto;

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bank text,
  balance numeric(12,2) not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  credit_limit numeric(12,2) not null,
  closing_day int not null,
  due_day int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists weekly_card_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  month_key text not null,
  week_label text not null,
  cumulative_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12,2) not null,
  category text not null,
  payment_method text not null,
  starts_on date not null,
  ends_on date,
  recurring_type text not null default 'monthly',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists recurring_income (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12,2) not null,
  starts_on date not null default current_date,
  recurring_type text not null default 'monthly',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists income_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12,2) not null,
  month_key text not null,
  entry_type text not null default 'one_time',
  occurs_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists planning_budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  planned_amount numeric(12,2) not null,
  actual_amount numeric(12,2) not null default 0,
  month_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists monthly_snapshots (
  month_key text primary key,
  income_total numeric(12,2) not null default 0,
  fixed_total numeric(12,2) not null default 0,
  card_total numeric(12,2) not null default 0,
  account_total numeric(12,2) not null default 0,
  available_balance numeric(12,2) not null default 0,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);
`;
