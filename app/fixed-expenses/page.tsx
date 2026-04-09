import {
  createFixedExpenseAction,
  deleteFixedExpenseAction,
  updateFixedExpenseAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { FixedExpenseForm } from "@/components/finflow-forms";
import { FixedExpensesList, FlashNotice, PageHead, QuickStats, TipPanel } from "@/components/finflow-sections";
import { getFinFlowSnapshot } from "@/lib/repository";

export default async function FixedExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; id?: string; flash?: string; tone?: "success" | "error" }>;
}) {
  const snapshot = await getFinFlowSnapshot();
  const params = await searchParams;
  const selectedFixedExpense =
    params?.edit === "fixed-expense"
      ? snapshot.fixedExpenses.find((item) => item.id === params.id)
      : undefined;

  return (
    <AppShell currentPath="/fixed-expenses" monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Gastos Fixos"
        description="Modulo focado em recorrencias mensais e anuais, preparado para marcar ocorrencia e projetar o impacto no saldo."
        metrics={snapshot.quickStats.slice(2, 4)}
      />
      <FlashNotice message={params?.flash} tone={params?.tone} />

      <div className="dashboard-grid">
        <div className="main-column">
          <FixedExpenseForm
            action={selectedFixedExpense ? updateFixedExpenseAction : createFixedExpenseAction}
            initialData={selectedFixedExpense}
            cancelHref={selectedFixedExpense ? "/fixed-expenses" : undefined}
            redirectTo="/fixed-expenses"
          />
          <FixedExpensesList
            fixedExpenses={snapshot.fixedExpenses}
            deleteAction={deleteFixedExpenseAction}
            editHrefBase="/fixed-expenses"
          />
        </div>

        <div className="side-column">
          <QuickStats stats={snapshot.quickStats.slice(2, 4)} />
          <TipPanel
            title="Proximo passo"
            description="A base de fixos agora suporta criar, editar e excluir. O proximo incremento pode ser marcacao de nao ocorreu e replicacao mensal automatica."
          />
        </div>
      </div>
    </AppShell>
  );
}
