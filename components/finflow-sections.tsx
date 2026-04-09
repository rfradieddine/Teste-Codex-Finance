import Link from "next/link";
import type { Account, Card, FinFlowSnapshot, FixedExpense, IncomeEntry, MonthlyMetric, PlanningCategory, WeeklyLog } from "@/lib/types";

type ActionFn = (formData: FormData) => Promise<void>;

export function FlashNotice({
  message,
  tone = "success",
}: {
  message?: string;
  tone?: "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return <div className={tone === "error" ? "flash-notice flash-notice-error" : "flash-notice"}>{message}</div>;
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function PageHead({
  title,
  description,
  metrics,
}: {
  title: string;
  description: string;
  metrics: MonthlyMetric[];
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="hero-metrics">
        {metrics.map((metric) => (
          <div
            className={metric.tone === "secondary" ? "metric-card metric-card-secondary" : "metric-card"}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.detail}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardPreview({ card }: { card?: Card }) {
  return (
    <section className="card-preview">
      <div className="card-preview-glow card-preview-glow-blue" />
      <div className="card-preview-glow card-preview-glow-green" />

      <div className="card-preview-row">
        <span className="card-brand">{card?.nickname?.toUpperCase() ?? "TITANIUM"}</span>
        <span className="card-chip">11</span>
      </div>

      <div>
        <p className="eyebrow">Limite atual</p>
        <strong className="card-limit">{card?.limit ?? "R$ 25.000,00"}</strong>
      </div>

      <div className="card-preview-row card-preview-bottom">
        <div>
          <p className="eyebrow">Titular</p>
          <span className="card-holder">RAFAEL S.</span>
        </div>
        <div>
          <p className="eyebrow">Vencimento</p>
          <span className="card-holder">Dia {card?.dueDay ?? 28}</span>
        </div>
      </div>
    </section>
  );
}

export function QuickStats({ stats }: { stats: MonthlyMetric[] }) {
  return (
    <div className="mini-grid">
      {stats.map((stat) => (
        <section className="stat-block" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <em className={stat.tone === "secondary" ? "tone-secondary" : undefined}>{stat.detail}</em>
        </section>
      ))}
    </div>
  );
}

export function AccountsList({
  accounts,
  deleteAction,
  editHrefBase,
  locked,
}: {
  accounts: Account[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel compact-panel">
      <div className="section-header">
        <div>
          <h2>Contas ativas</h2>
          <p>Resumo rapido para desktop e mobile.</p>
        </div>
      </div>

      <div className="account-list">
        {accounts.length === 0 ? (
          <EmptyState
            title="Nenhuma conta cadastrada"
            description="Adicione sua primeira conta para acompanhar saldo e compor o dashboard."
          />
        ) : null}
        {accounts.map((account, index) => (
          <article className="account-row" key={account.id ?? account.name}>
            <div className={index === 0 ? "account-badge account-badge-primary" : "account-badge account-badge-secondary"}>
              {index === 0 ? "R" : "C"}
            </div>
            <div className="account-copy">
              <strong>{account.name}</strong>
              <span>{account.meta}</span>
            </div>
            <div className="account-values">
              <strong>{account.amount}</strong>
              <span>{account.status}</span>
            </div>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && account.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=account&id=${account.id}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={account.id ?? ""} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CardsList({
  cards,
  deleteAction,
  editHrefBase,
  locked,
}: {
  cards: Card[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel compact-panel">
      <div className="section-header">
        <div>
          <h2>Cartoes ativos</h2>
          <p>Limite, fechamento e utilizacao do mes.</p>
        </div>
      </div>

      <div className="account-list">
        {cards.length === 0 ? (
          <EmptyState
            title="Nenhum cartao cadastrado"
            description="Cadastre um cartao para registrar lancamentos semanais e acompanhar o uso do limite."
          />
        ) : null}
        {cards.map((card, index) => (
          <article className="account-row" key={card.id ?? card.nickname}>
            <div className={index === 0 ? "account-badge account-badge-secondary" : "account-badge account-badge-primary"}>
              CC
            </div>
            <div className="account-copy">
              <strong>{card.nickname}</strong>
              <span>Fecha dia {card.closingDay} • vence dia {card.dueDay}</span>
            </div>
            <div className="account-values">
              <strong>{card.limit}</strong>
              <span>{card.status ?? card.usedAmount}</span>
            </div>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && card.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=card&id=${card.id}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={card.id ?? ""} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FixedExpensesList({
  fixedExpenses,
  deleteAction,
  editHrefBase,
  locked,
}: {
  fixedExpenses: FixedExpense[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel compact-panel">
      <div className="section-header">
        <div>
          <h2>Gastos fixos do mes</h2>
          <p>Resumo de pagos vs. pendentes, alinhado com RF-03.</p>
        </div>
      </div>

      <div className="fixed-list">
        {fixedExpenses.length === 0 ? (
          <EmptyState
            title="Nenhum gasto fixo ativo"
            description="Cadastre gastos recorrentes para o saldo mensal ficar mais fiel a sua realidade."
          />
        ) : null}
        {fixedExpenses.map((item) => (
          <article className="fixed-row" key={item.id ?? item.title}>
            <div className={`fixed-dot fixed-dot-${item.tone}`} />
            <div className="fixed-copy">
              <strong>{item.title}</strong>
              <span>{item.due}</span>
            </div>
            <div className="fixed-values">
              <strong>{item.amount}</strong>
              <span>{item.status}</span>
            </div>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && item.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=fixed-expense&id=${item.id}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={item.id ?? ""} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WeeklyLogsList({
  weeklyLogs,
  deleteAction,
  editHrefBase,
  locked,
}: {
  weeklyLogs: WeeklyLog[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Lancamentos semanais</h2>
          <p>Historico do acumulado informado para o cartao principal.</p>
        </div>
        <button className="text-button" type="button">
          Ver mes completo
        </button>
      </div>

      <div className="log-list">
        {weeklyLogs.length === 0 ? (
          <EmptyState
            title="Sem lancamentos neste mes"
            description="Assim que voce registrar o acumulado do cartao, o historico semanal aparece aqui."
          />
        ) : null}
        {weeklyLogs.map((item) => (
          <article className="log-row" key={item.id ?? item.week}>
            <div>
              <p className="log-title">{item.week}</p>
              <p className="log-caption">Acumulado informado no app</p>
            </div>
            <div className="log-meta">
              <strong>{item.amount}</strong>
              <span>{item.trend}</span>
            </div>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && item.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=weekly-log&id=${item.id}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={item.id ?? ""} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PlanningTable({ planning }: { planning: PlanningCategory[] }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Planejado vs realizado</h2>
          <p>Base para RF-06 com copia mensal no proximo passo.</p>
        </div>
      </div>

      <div className="planning-table">
        {planning.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria planejada"
            description="Crie um orcamento por categoria para comparar o previsto com o realizado."
          />
        ) : null}
        {planning.map((item) => (
          <article className="planning-row" key={item.category}>
            <strong>{item.category}</strong>
            <span>{item.planned}</span>
            <span>{item.actual}</span>
            <span className={item.status === "Acima" ? "planning-alert" : "planning-ok"}>{item.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PlanningList({
  planning,
  deleteAction,
  editHrefBase,
  locked,
}: {
  planning: PlanningCategory[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Planejado vs realizado</h2>
          <p>Base para RF-06 com copia mensal no proximo passo.</p>
        </div>
      </div>

      <div className="planning-table">
        {planning.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria planejada"
            description="Crie um orcamento por categoria para comparar o previsto com o realizado."
          />
        ) : null}
        {planning.map((item) => (
          <article className="planning-row" key={item.id ?? item.category}>
            <strong>{item.category}</strong>
            <span>{item.planned}</span>
            <span>{item.actual}</span>
            <span className={item.status === "Acima" ? "planning-alert" : "planning-ok"}>{item.status}</span>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && item.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=planning&id=${item.id}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={item.id ?? ""} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function IncomesList({
  incomes,
  deleteAction,
  editHrefBase,
  locked,
}: {
  incomes: IncomeEntry[];
  deleteAction?: ActionFn;
  editHrefBase?: string;
  locked?: boolean;
}) {
  return (
    <section className="panel compact-panel">
      <div className="section-header">
        <div>
          <h2>Receitas do periodo</h2>
          <p>Recorrentes e pontuais consideradas no mes atual.</p>
        </div>
      </div>

      <div className="account-list">
        {incomes.length === 0 ? (
          <EmptyState
            title="Nenhuma receita cadastrada"
            description="Cadastre receitas recorrentes ou pontuais para melhorar o saldo e a projecao do mes."
          />
        ) : null}
        {incomes.map((income, index) => (
          <article className="account-row" key={income.id ?? `${income.name}-${index}`}>
            <div className={income.type === "recurring" ? "account-badge account-badge-primary" : "account-badge account-badge-secondary"}>
              IN
            </div>
            <div className="account-copy">
              <strong>{income.name}</strong>
              <span>{income.type === "recurring" ? `Recorrente ${income.frequency}` : "Entrada pontual"}</span>
            </div>
            <div className="account-values">
              <strong>{income.amount}</strong>
              <span>{income.startsOn ?? income.monthKey}</span>
            </div>
            <div className="row-actions">
              {locked ? <span className="lock-badge">Mes fechado</span> : null}
              {!locked && editHrefBase && income.id ? (
                <Link className="mini-button mini-button-secondary" href={`${editHrefBase}?edit=income&id=${income.id}&incomeType=${income.type}`}>
                  Editar
                </Link>
              ) : null}
              {!locked && deleteAction ? (
                <form action={deleteAction} className="row-action">
                  <input type="hidden" name="id" value={income.id ?? ""} />
                  <input type="hidden" name="type" value={income.type} />
                  <button className="mini-button" type="submit">
                    Excluir
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ComparisonBars({ comparison }: { comparison: MonthlyMetric[] }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Ultimos 6 meses</h2>
          <p>Bloco visual para o comparativo mensal do dashboard.</p>
        </div>
      </div>

      <div className="comparison-bars">
        {comparison.map((item, index) => (
          <div className="comparison-item" key={item.label}>
            <div className="comparison-column">
              <div
                className={index === comparison.length - 1 ? "comparison-bar comparison-bar-active" : "comparison-bar"}
                style={{ height: `${55 + index * 12}px` }}
              />
            </div>
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardOverview({ snapshot }: { snapshot: FinFlowSnapshot }) {
  return (
    <div className="dashboard-grid">
      <div className="main-column">
        <ComparisonBars comparison={snapshot.monthlyComparison} />
        <WeeklyLogsList weeklyLogs={snapshot.weeklyLogs} />
        <PlanningTable planning={snapshot.planning} />
      </div>

      <div className="side-column">
        <CardPreview card={snapshot.cards[0]} />
        <QuickStats stats={snapshot.quickStats.slice(0, 2)} />
        <AccountsList accounts={snapshot.accounts} />
        <FixedExpensesList fixedExpenses={snapshot.fixedExpenses} />
      </div>
    </div>
  );
}

export function TipPanel({ title, description }: { title: string; description: string }) {
  return (
    <section className="tip-panel">
      <strong>{title}</strong>
      <p>{description}</p>
    </section>
  );
}
