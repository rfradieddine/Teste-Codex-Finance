import { closeCurrentMonthAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { PageHead, TipPanel } from "@/components/finflow-sections";
import { bootstrapSql } from "@/lib/db";
import { getDatabaseStatus, getFinFlowSnapshot, getMonthlyClosureStatus } from "@/lib/repository";

export default async function SettingsPage() {
  const snapshot = await getFinFlowSnapshot();
  const closureStatus = await getMonthlyClosureStatus();

  return (
    <AppShell currentPath="/settings" monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
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
            <form action={closeCurrentMonthAction}>
              <button className="mini-button mini-button-secondary" type="submit">
                Fechar mes atual
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
          description="Na Vercel, conecte um banco Postgres compativel com DATABASE_URL. A camada server-side ja esta isolada para a integracao entrar sem refazer a UI."
        />
      </div>
    </AppShell>
  );
}
