import {
  createFixedExpenseAction,
  deleteFixedExpenseAction,
  updateFixedExpenseAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { FixedExpenseForm } from "@/components/finflow-forms";
import { FixedExpensesList, FlashNotice, PageHead, QuickStats, TipPanel } from "@/components/finflow-sections";
import { getCurrentMonthLockState, getFinFlowSnapshot } from "@/lib/repository";

export default async function FixedExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; id?: string; flash?: string; tone?: "success" | "error"; month?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getFinFlowSnapshot(params?.month);
  const monthState = await getCurrentMonthLockState(snapshot.monthKey);
  const monthRoute = `/fixed-expenses?month=${snapshot.monthKey}`;
  const selectedFixedExpense =
    params?.edit === "fixed-expense"
      ? snapshot.fixedExpenses.find((item) => item.id === params.id)
      : undefined;

  return (
    <AppShell currentPath="/fixed-expenses" monthKey={snapshot.monthKey} monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Gastos Fixos"
        description="Modulo focado em recorrencias mensais e anuais, preparado para marcar ocorrencia e projetar o impacto no saldo."
        metrics={snapshot.quickStats.slice(2, 4)}
      />
      <FlashNotice message={params?.flash} tone={params?.tone} />
      {monthState.isClosed ? (
        <FlashNotice
          message={`Mes ${monthState.monthKey} fechado. Reabra o mes antes de alterar gastos fixos.`}
          tone="error"
        />
      ) : null}

      <div className="dashboard-grid">
        <div className="main-column">
          <FixedExpenseForm
            action={selectedFixedExpense ? updateFixedExpenseAction : createFixedExpenseAction}
            initialData={selectedFixedExpense}
            cancelHref={selectedFixedExpense ? monthRoute : undefined}
            redirectTo={monthRoute}
            disabled={monthState.isClosed}
            monthKey={snapshot.monthKey}
          />
          <FixedExpensesList
            fixedExpenses={snapshot.fixedExpenses}
            deleteAction={deleteFixedExpenseAction}
            editHrefBase={monthRoute}
            locked={monthState.isClosed}
            monthKey={snapshot.monthKey}
          />
        </div>

        <div className="side-column">
          <QuickStats stats={snapshot.quickStats.slice(2, 4)} />
          <TipPanel
            title="Proximo passo"
            description={
              monthState.isClosed
                ? "Com o mes fechado, os gastos ficam congelados para preservar o fechamento e o historico."
                : "A base de fixos agora suporta criar, editar e excluir. O proximo incremento pode ser marcacao de nao ocorreu e replicacao mensal automatica."
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
