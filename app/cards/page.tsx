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
  FixedExpensesList,
  PageHead,
  QuickStats,
  TipPanel,
  WeeklyLogsList,
} from "@/components/finflow-sections";
import { getFinFlowSnapshot } from "@/lib/repository";

export default async function CardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; id?: string }>;
}) {
  const snapshot = await getFinFlowSnapshot();
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

      <div className="dashboard-grid">
        <div className="main-column">
          <AccountForm
            action={selectedAccount ? updateAccountAction : createAccountAction}
            initialData={selectedAccount}
            cancelHref={selectedAccount ? "/cards" : undefined}
          />
          <CardForm
            action={selectedCard ? updateCardAction : createCardAction}
            initialData={selectedCard}
            cancelHref={selectedCard ? "/cards" : undefined}
          />
          <WeeklyLogForm
            action={selectedWeeklyLog ? updateWeeklyLogAction : createWeeklyLogAction}
            hasCards={snapshot.cards.length > 0}
            cards={snapshot.cards}
            initialData={selectedWeeklyLog}
            cancelHref={selectedWeeklyLog ? "/cards" : undefined}
          />
          <WeeklyLogsList
            weeklyLogs={snapshot.weeklyLogs}
            deleteAction={deleteWeeklyLogAction}
            editHrefBase="/cards"
          />
        </div>

        <div className="side-column">
          <CardPreview card={snapshot.cards[0]} />
          <QuickStats stats={snapshot.quickStats.slice(0, 2)} />
          <AccountsList accounts={snapshot.accounts} deleteAction={deleteAccountAction} editHrefBase="/cards" />
          <CardsList cards={snapshot.cards} deleteAction={deleteCardAction} editHrefBase="/cards" />
          <FixedExpensesList fixedExpenses={snapshot.fixedExpenses} />
          <TipPanel
            title="Direcao de UX"
            description="As secoes desta tela agora criam, editam e removem dados reais quando DATABASE_URL estiver configurada."
          />
        </div>
      </div>

      <footer className="footer-actions">
        <TipPanel
          title="Modo atual"
          description={
            snapshot.cards[0]?.id?.startsWith("card-")
              ? "Sem banco configurado: a tela continua operando com dados demo."
              : "Banco ativo: mudancas aplicadas via server actions."
          }
        />
      </footer>
    </AppShell>
  );
}
