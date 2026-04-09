import {
  createAccountAction,
  createCardAction,
  createWeeklyLogAction,
  deleteAccountAction,
  deleteCardAction,
  deleteWeeklyLogAction,
  updateAccountAction,
  updateCardAction,
  updateWeeklyLogAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { AccountForm, CardForm, WeeklyLogForm } from "@/components/finflow-forms";
import {
  AccountsList,
  CardPreview,
  CardsList,
  FlashNotice,
  FixedExpensesList,
  PageHead,
  QuickStats,
  TipPanel,
  WeeklyLogsList,
} from "@/components/finflow-sections";
import { getCurrentMonthLockState, getDatabaseStatus, getFinFlowSnapshot } from "@/lib/repository";

export default async function CardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; id?: string; flash?: string; tone?: "success" | "error" }>;
}) {
  const snapshot = await getFinFlowSnapshot();
  const monthState = await getCurrentMonthLockState();
  const params = await searchParams;
  const edit = params?.edit;
  const id = params?.id;

  const selectedAccount = edit === "account" ? snapshot.accounts.find((item) => item.id === id) : undefined;
  const selectedCard = edit === "card" ? snapshot.cards.find((item) => item.id === id) : undefined;
  const selectedWeeklyLog = edit === "weekly-log" ? snapshot.weeklyLogs.find((item) => item.id === id) : undefined;

  return (
    <AppShell currentPath="/cards" monthLabel={snapshot.currentMonth} closingInfo={snapshot.closingInfo}>
      <PageHead
        title="Accounts & Cards"
        description="Tela principal de contas e cartoes baseada no UI/UX de referencia, agora com persistencia server-side pronta para Vercel."
        metrics={snapshot.heroMetrics}
      />
      <FlashNotice message={params?.flash} tone={params?.tone} />
      {monthState.isClosed ? (
        <FlashNotice
          message={`Mes ${monthState.monthKey} fechado. Reabra em Configuracoes ou Dashboard para editar contas, cartoes e lancamentos.`}
          tone="error"
        />
      ) : null}

      <div className="dashboard-grid">
        <div className="main-column">
          <AccountForm
            action={selectedAccount ? updateAccountAction : createAccountAction}
            initialData={selectedAccount}
            cancelHref={selectedAccount ? "/cards" : undefined}
            redirectTo="/cards"
            disabled={monthState.isClosed}
          />
          <CardForm
            action={selectedCard ? updateCardAction : createCardAction}
            initialData={selectedCard}
            cancelHref={selectedCard ? "/cards" : undefined}
            redirectTo="/cards"
            disabled={monthState.isClosed}
          />
          <WeeklyLogForm
            action={selectedWeeklyLog ? updateWeeklyLogAction : createWeeklyLogAction}
            hasCards={snapshot.cards.length > 0}
            cards={snapshot.cards}
            initialData={selectedWeeklyLog}
            cancelHref={selectedWeeklyLog ? "/cards" : undefined}
            redirectTo="/cards"
            disabled={monthState.isClosed}
          />
          <WeeklyLogsList
            weeklyLogs={snapshot.weeklyLogs}
            deleteAction={deleteWeeklyLogAction}
            editHrefBase="/cards"
            locked={monthState.isClosed}
          />
        </div>

        <div className="side-column">
          <CardPreview card={snapshot.cards[0]} />
          <QuickStats stats={snapshot.quickStats.slice(0, 2)} />
          <AccountsList accounts={snapshot.accounts} deleteAction={deleteAccountAction} editHrefBase="/cards" locked={monthState.isClosed} />
          <CardsList cards={snapshot.cards} deleteAction={deleteCardAction} editHrefBase="/cards" locked={monthState.isClosed} />
          <FixedExpensesList fixedExpenses={snapshot.fixedExpenses} locked={monthState.isClosed} />
          <TipPanel
            title="Direcao de UX"
            description={
              monthState.isClosed
                ? "O mes atual esta fechado, entao as acoes financeiras ficam bloqueadas ate a reabertura."
                : "As secoes desta tela agora criam, editam e removem dados reais quando DATABASE_URL estiver configurada."
            }
          />
        </div>
      </div>

      <footer className="footer-actions">
        <TipPanel
          title="Modo atual"
          description={getDatabaseStatus()}
        />
      </footer>
    </AppShell>
  );
}
