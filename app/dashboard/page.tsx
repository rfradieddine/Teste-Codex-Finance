import { closeCurrentMonthAction, reopenCurrentMonthAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { DashboardOverview, FlashNotice, PageHead, TipPanel } from "@/components/finflow-sections";
import { getCurrentMonthLockState, getDatabaseStatus, getFinFlowSnapshot, getMonthlyClosureStatus } from "@/lib/repository";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ flash?: string; tone?: "success" | "error"; month?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getFinFlowSnapshot(params?.month);
  const closureStatus = await getMonthlyClosureStatus(snapshot.monthKey);
  const monthState = await getCurrentMonthLockState(snapshot.monthKey);

  return (
    <AppShell currentPath="/dashboard" monthKey={snapshot.monthKey} monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Dashboard"
        description="Painel central do FinFlow com saldo disponivel, comparativo mensal, lancamentos semanais e leitura rapida para celular."
        metrics={snapshot.heroMetrics}
      />
      <FlashNotice message={params?.flash} tone={params?.tone} />

      <DashboardOverview snapshot={snapshot} />

      <footer className="footer-actions">
        <form action={monthState.isClosed ? reopenCurrentMonthAction : closeCurrentMonthAction}>
          <input type="hidden" name="month_key" value={snapshot.monthKey} />
          <input type="hidden" name="redirect_to" value={`/dashboard?month=${snapshot.monthKey}`} />
          <button className="primary-button" type="submit">
            {monthState.actionLabel}
          </button>
        </form>
        <TipPanel
          title="Historico mensal ativo"
          description={`${getDatabaseStatus()} ${closureStatus} O saldo consolidado do mes atual agora tambem e materializado para alimentar o comparativo historico.`}
        />
      </footer>
    </AppShell>
  );
}
