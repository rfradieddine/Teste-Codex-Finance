import {
  createIncomeAction,
  createPlanningAction,
  copyPlanningToNextMonthAction,
  deleteIncomeAction,
  deletePlanningAction,
  updateIncomeAction,
  updatePlanningAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { IncomeForm, PlanningForm } from "@/components/finflow-forms";
import { FlashNotice, IncomesList, PageHead, PlanningList, QuickStats, TipPanel } from "@/components/finflow-sections";
import { getCurrentMonthLockState, getFinFlowSnapshot } from "@/lib/repository";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; id?: string; incomeType?: "recurring" | "one_time"; flash?: string; tone?: "success" | "error" }>;
}) {
  const snapshot = await getFinFlowSnapshot();
  const monthState = await getCurrentMonthLockState();
  const params = await searchParams;

  const selectedPlanning =
    params?.edit === "planning" ? snapshot.planning.find((item) => item.id === params.id) : undefined;

  const selectedIncome =
    params?.edit === "income" ? snapshot.incomes.find((item) => item.id === params.id && item.type === params.incomeType) : undefined;

  return (
    <AppShell currentPath="/planning" monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Planejamento"
        description="Modulo para orcamento por categoria com comparacao entre planejado e realizado, agora com receitas persistidas."
        metrics={snapshot.heroMetrics}
      />
      <FlashNotice message={params?.flash} tone={params?.tone} />
      {monthState.isClosed ? (
        <FlashNotice
          message={`Mes ${monthState.monthKey} fechado. Orcamento e receitas ficam bloqueados ate a reabertura.`}
          tone="error"
        />
      ) : null}

      <div className="dashboard-grid">
        <div className="main-column">
          <PlanningForm
            action={selectedPlanning ? updatePlanningAction : createPlanningAction}
            initialData={selectedPlanning}
            cancelHref={selectedPlanning ? "/planning" : undefined}
            redirectTo="/planning"
            disabled={monthState.isClosed}
          />
          <section className="panel compact-panel">
            <div className="section-header">
              <div>
                <h2>Operacao mensal</h2>
                <p>Copie o planejamento atual para o proximo mes sem duplicar categorias existentes.</p>
              </div>
              <form action={copyPlanningToNextMonthAction}>
                <button className="mini-button mini-button-secondary" type="submit">
                  Copiar para o proximo mes
                </button>
              </form>
            </div>
          </section>
          <PlanningList
            planning={snapshot.planning}
            deleteAction={deletePlanningAction}
            editHrefBase="/planning"
            locked={monthState.isClosed}
          />
        </div>

        <div className="side-column">
          <IncomeForm
            action={selectedIncome ? updateIncomeAction : createIncomeAction}
            initialData={selectedIncome}
            cancelHref={selectedIncome ? "/planning" : undefined}
            redirectTo="/planning"
            disabled={monthState.isClosed}
          />
          <IncomesList incomes={snapshot.incomes} deleteAction={deleteIncomeAction} editHrefBase="/planning" locked={monthState.isClosed} />
          <QuickStats stats={snapshot.quickStats} />
          <TipPanel
            title="Automacao mensal"
            description={
              monthState.isClosed
                ? "O fechamento agora tambem protege receitas e planejamento para que o mes nao seja alterado acidentalmente."
                : "Receitas recorrentes anuais e mensais ja entram no mes atual pela vigencia. O proximo incremento pode gerar ocorrencias fechadas por mes se voce quiser historico detalhado."
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
