import { closeCurrentMonthAction, reopenCurrentMonthAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { PageHead, TipPanel } from "@/components/finflow-sections";
import { bootstrapSql } from "@/lib/db";
import { getCurrentMonthLockState, getDatabaseStatus, getFinFlowSnapshot, getMonthlyClosureStatus } from "@/lib/repository";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const snapshot = await getFinFlowSnapshot(params?.month);
  const closureStatus = await getMonthlyClosureStatus(snapshot.monthKey);
  const monthState = await getCurrentMonthLockState(snapshot.monthKey);

  return (
    <AppShell currentPath="/settings" monthKey={snapshot.monthKey} monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Configuracoes"
        description="Espaco para preparar a conexao com Postgres na Vercel e guardar detalhes tecnicos sem atrapalhar o fluxo principal."
        metrics={snapshot.quickStats.slice(0, 2)}
      />

      <div className="settings-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Status do banco</h2>
              <p>{getDatabaseStatus()}</p>
            </div>
            <form action={monthState.isClosed ? reopenCurrentMonthAction : closeCurrentMonthAction}>
              <input type="hidden" name="month_key" value={snapshot.monthKey} />
              <input type="hidden" name="redirect_to" value={`/settings?month=${snapshot.monthKey}`} />
              <button className="mini-button mini-button-secondary" type="submit">
                {monthState.actionLabel}
              </button>
            </form>
          </div>

          <p>{closureStatus}</p>

          <div className="code-panel">
            <pre>{bootstrapSql}</pre>
          </div>
        </section>

        <TipPanel
          title="Como publicar"
          description={
            process.env.APP_PIN
              ? "O app ja aceita protecao minima por PIN via APP_PIN. Mantenha APP_PIN e DATABASE_URL configuradas na Vercel."
              : "Na Vercel, conecte um banco Postgres compativel com DATABASE_URL. Se quiser protecao minima, configure tambem APP_PIN."
          }
        />
      </div>
    </AppShell>
  );
}
