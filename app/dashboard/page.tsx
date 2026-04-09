import { closeCurrentMonthAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { DashboardOverview, PageHead, TipPanel } from "@/components/finflow-sections";
import { getDatabaseStatus, getFinFlowSnapshot, getMonthlyClosureStatus } from "@/lib/repository";

export default async function DashboardPage() {
  const snapshot = await getFinFlowSnapshot();
  const closureStatus = await getMonthlyClosureStatus();

  return (
    <AppShell currentPath="/dashboard" monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Dashboard"
        description="Painel central do FinFlow com saldo disponivel, comparativo mensal, lancamentos semanais e leitura rapida para celular."
        metrics={snapshot.heroMetrics}
      />

      <DashboardOverview snapshot={snapshot} />

      <footer className="footer-actions">
        <form action={closeCurrentMonthAction}>
          <button className="primary-button" type="submit">
            Fechar mes atual
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
