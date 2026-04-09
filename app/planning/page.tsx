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
  searchParams?: Promise<{ edit?: string; id?: string; incomeType?: "recurring" | "one_time"; flash?: string; tone?: "success" | "error"; month?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getFinFlowSnapshot(params?.month);
  const monthState = await getCurrentMonthLockState(snapshot.monthKey);
  const monthRoute = `/planning?month=${snapshot.monthKey}`;

  const selectedPlanning =
    params?.edit === "planning" ? snapshot.planning.find((item) => item.id === params.id) : undefined;

  const selectedIncome =
    params?.edit === "income" ? snapshot.incomes.find((item) => item.id === params.id && item.type === params.incomeType) : undefined;

  return (
    <AppShell currentPath="/planning" monthKey={snapshot.monthKey} monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
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
            cancelHref={selectedPlanning ? monthRoute : undefined}
            redirectTo={monthRoute}
            disabled={monthState.isClosed}
            monthKey={snapshot.monthKey}
          />
          <section className="panel compact-panel">
            <div className="section-header">
              <div>
                <h2>Operacao mensal</h2>
                <p>Copie o planejamento atual para o proximo mes sem duplicar categorias existentes.</p>
              </div>
              <form action={copyPlanningToNextMonthAction}>
                <input type="hidden" name="month_key" value={snapshot.monthKey} />
                <button className="mini-button mini-button-secondary" type="submit">
                  Copiar para o proximo mes
                </button>
              </form>
            </div>
          </section>
          <PlanningList
            planning={snapshot.planning}
            deleteAction={deletePlanningAction}
            editHrefBase={monthRoute}
            locked={monthState.isClosed}
            monthKey={snapshot.monthKey}
          />
        </div>

        <div className="side-column">
          <IncomeForm
            action={selectedIncome ? updateIncomeAction : createIncomeAction}
            initialData={selectedIncome}
            cancelHref={selectedIncome ? monthRoute : undefined}
            redirectTo={monthRoute}
            disabled={monthState.isClosed}
            monthKey={snapshot.monthKey}
          />
          <IncomesList incomes={snapshot.incomes} deleteAction={deleteIncomeAction} editHrefBase={monthRoute} locked={monthState.isClosed} monthKey={snapshot.monthKey} />
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
