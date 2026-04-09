import { SubmitButton } from "@/components/form-status";

type ActionFn = (formData: FormData) => Promise<void>;

type CancelProps = {
  cancelHref?: string;
};

export function AccountForm({
  action,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  initialData?: {
    id?: string;
    name?: string;
    bank?: string;
    balanceInput?: string;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel panel-primary">
      <div className="panel-heading">
        <div className="panel-icon panel-icon-primary">R$</div>
        <div>
          <h2>Conta bancaria</h2>
          <p>Cadastro rapido para saldo inicial e controle da reserva.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field field-span-2">
          <span>Nome da conta</span>
          <input defaultValue={initialData?.name} name="name" placeholder="Ex.: Nubank principal" required />
        </label>

        <label className="field">
          <span>Banco</span>
          <input defaultValue={initialData?.bank} name="bank" placeholder="Ex.: Nubank" />
        </label>

        <label className="field">
          <span>Saldo inicial</span>
          <input defaultValue={initialData?.balanceInput} name="balance" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/cards"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={initialData?.id ? "Atualizar conta" : "Vincular nova conta"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function CardForm({
  action,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  initialData?: {
    id?: string;
    nickname?: string;
    creditLimitInput?: string;
    closingDay?: number;
    dueDay?: number;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel panel-secondary">
      <div className="panel-heading">
        <div className="panel-icon panel-icon-secondary">CC</div>
        <div>
          <h2>Cartao de credito</h2>
          <p>Espaco para limite, fechamento, vencimento e lancamento semanal acumulado.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field field-span-2">
          <span>Apelido do cartao</span>
          <input defaultValue={initialData?.nickname} name="nickname" placeholder="Ex.: Ultravioleta" required />
        </label>

        <label className="field">
          <span>Limite</span>
          <input defaultValue={initialData?.creditLimitInput} name="credit_limit" inputMode="decimal" placeholder="R$ 5.000" required />
        </label>

        <label className="field">
          <span>Fechamento</span>
          <select name="closing_day" defaultValue={String(initialData?.closingDay ?? 5)}>
            <option value="5">Dia 05</option>
            <option value="10">Dia 10</option>
            <option value="15">Dia 15</option>
          </select>
        </label>

        <label className="field">
          <span>Vencimento</span>
          <select name="due_day" defaultValue={String(initialData?.dueDay ?? 12)}>
            <option value="12">Dia 12</option>
            <option value="20">Dia 20</option>
            <option value="28">Dia 28</option>
          </select>
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/cards"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={initialData?.id ? "Atualizar cartao" : "Salvar cartao"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function WeeklyLogForm({
  action,
  hasCards,
  cards,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  hasCards: boolean;
  cards: { id?: string; nickname: string }[];
  initialData?: {
    id?: string;
    cardId?: string;
    week?: string;
    amountInput?: string;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel">
      <div className="section-header">
        <div>
          <h2>Novo lancamento semanal</h2>
          <p>Registre o acumulado do cartao para o mes atual.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field">
          <span>Cartao</span>
          <select name="card_id" defaultValue={initialData?.cardId ?? cards[0]?.id ?? ""} disabled={!hasCards}>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.nickname}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Semana</span>
          <input defaultValue={initialData?.week} name="week_label" placeholder="Semana 1" required />
        </label>

        <label className="field">
          <span>Acumulado</span>
          <input defaultValue={initialData?.amountInput} name="cumulative_amount" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/cards"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={hasCards ? (initialData?.id ? "Atualizar lancamento" : "Salvar lancamento") : "Cadastre um cartao primeiro"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
          disabled={!hasCards}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function FixedExpenseForm({
  action,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  initialData?: {
    id?: string;
    title?: string;
    amountInput?: string;
    category?: string;
    paymentMethod?: string;
    startsOn?: string;
    recurringType?: string;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel panel-primary">
      <div className="panel-heading">
        <div className="panel-icon panel-icon-primary">FX</div>
        <div>
          <h2>Novo gasto fixo</h2>
          <p>Cadastro simplificado para aluguel, assinaturas, contas e despesas anuais.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field field-span-2">
          <span>Nome do gasto</span>
          <input defaultValue={initialData?.title} name="name" placeholder="Ex.: Aluguel" required />
        </label>
        <label className="field">
          <span>Valor</span>
          <input defaultValue={initialData?.amountInput} name="amount" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
        <label className="field">
          <span>Categoria</span>
          <input defaultValue={initialData?.category} name="category" placeholder="Moradia" required />
        </label>
        <label className="field">
          <span>Forma de pagamento</span>
          <input defaultValue={initialData?.paymentMethod} name="payment_method" placeholder="Debito em conta" required />
        </label>
        <label className="field">
          <span>Inicio</span>
          <input defaultValue={initialData?.startsOn} name="starts_on" type="date" required />
        </label>
        <label className="field">
          <span>Recorrencia</span>
          <select name="recurring_type" defaultValue={initialData?.recurringType ?? "monthly"}>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/fixed-expenses"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={initialData?.id ? "Atualizar gasto fixo" : "Salvar gasto fixo"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function PlanningForm({
  action,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  initialData?: {
    id?: string;
    category?: string;
    plannedInput?: string;
    actualInput?: string;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel panel-secondary">
      <div className="panel-heading">
        <div className="panel-icon panel-icon-secondary">PL</div>
        <div>
          <h2>Orcamento por categoria</h2>
          <p>Defina o planejado e acompanhe o realizado no mes atual.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field field-span-2">
          <span>Categoria</span>
          <input defaultValue={initialData?.category} name="category" placeholder="Ex.: Mercado" required />
        </label>
        <label className="field">
          <span>Planejado</span>
          <input defaultValue={initialData?.plannedInput} name="planned_amount" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
        <label className="field">
          <span>Realizado</span>
          <input defaultValue={initialData?.actualInput} name="actual_amount" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/planning"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={initialData?.id ? "Atualizar planejamento" : "Salvar planejamento"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function IncomeForm({
  action,
  initialData,
  cancelHref,
  redirectTo,
}: {
  action: ActionFn;
  initialData?: {
    id?: string;
    name?: string;
    amountInput?: string;
    type?: "recurring" | "one_time";
    frequency?: "monthly" | "yearly" | "one_time";
    startsOn?: string;
  };
  redirectTo?: string;
} & CancelProps) {
  return (
    <form action={action} className="panel panel-primary">
      <div className="panel-heading">
        <div className="panel-icon panel-icon-primary">IN</div>
        <div>
          <h2>Receitas</h2>
          <p>Cadastre recorrencias mensais ou entradas pontuais do mes.</p>
        </div>
      </div>

      <div className="form-grid form-grid-three">
        <label className="field field-span-2">
          <span>Nome</span>
          <input defaultValue={initialData?.name} name="name" placeholder="Ex.: Salario" required />
        </label>
        <label className="field">
          <span>Valor</span>
          <input defaultValue={initialData?.amountInput} name="amount" inputMode="decimal" placeholder="R$ 0,00" required />
        </label>
        <label className="field">
          <span>Tipo</span>
          <select name="type" defaultValue={initialData?.type ?? "recurring"}>
            <option value="recurring">Recorrente</option>
            <option value="one_time">Pontual</option>
          </select>
        </label>
        <label className="field">
          <span>Frequencia</span>
          <select name="frequency" defaultValue={initialData?.frequency ?? "monthly"}>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
            <option value="one_time">Pontual</option>
          </select>
        </label>
        <label className="field">
          <span>Data base</span>
          <input defaultValue={initialData?.startsOn} name="starts_on" type="date" required />
        </label>
      </div>

      {initialData?.id ? <input type="hidden" name="id" value={initialData.id} /> : null}
      <input type="hidden" name="redirect_to" value={redirectTo ?? "/planning"} />

      <div className="form-actions">
        <SubmitButton
          className="ghost-button"
          idleLabel={initialData?.id ? "Atualizar receita" : "Salvar receita"}
          pendingLabel={initialData?.id ? "Atualizando..." : "Salvando..."}
        />
        {cancelHref ? (
          <a className="text-link" href={cancelHref}>
            Cancelar edicao
          </a>
        ) : null}
      </div>
    </form>
  );
}
