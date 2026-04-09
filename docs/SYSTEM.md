# FinFlow - Documentacao do Sistema

## 1. Objetivo

O FinFlow e um painel financeiro pessoal com foco em:

- visao mensal consolidada
- controle de contas e cartoes
- previsao com receitas e gastos fixos
- planejamento por categoria
- persistencia simples para uso em celular e desktop

O projeto foi pensado para deploy na `Vercel`, usando `Neon Postgres` como banco.

## 2. Arquitetura

### Camadas

- `UI`
  - paginas do `App Router`
  - componentes visuais e formularios
- `Server Actions`
  - criacao, atualizacao e remocao de dados
  - redirecionamento com mensagens de feedback
- `Repository`
  - leitura consolidada do estado financeiro
  - calculo de metricas e snapshot
- `Database`
  - Postgres via Neon
  - bootstrap automatico do schema

### Principais arquivos

- [app/layout.tsx](/g:/Projetos/Teste%20codex/app/layout.tsx)
- [app/actions.ts](/g:/Projetos/Teste%20codex/app/actions.ts)
- [app/dashboard/page.tsx](/g:/Projetos/Teste%20codex/app/dashboard/page.tsx)
- [app/cards/page.tsx](/g:/Projetos/Teste%20codex/app/cards/page.tsx)
- [app/fixed-expenses/page.tsx](/g:/Projetos/Teste%20codex/app/fixed-expenses/page.tsx)
- [app/planning/page.tsx](/g:/Projetos/Teste%20codex/app/planning/page.tsx)
- [app/settings/page.tsx](/g:/Projetos/Teste%20codex/app/settings/page.tsx)
- [lib/db.ts](/g:/Projetos/Teste%20codex/lib/db.ts)
- [lib/repository.ts](/g:/Projetos/Teste%20codex/lib/repository.ts)
- [lib/types.ts](/g:/Projetos/Teste%20codex/lib/types.ts)

## 3. Fluxo de dados

### Leitura

1. A pagina chama `getFinFlowSnapshot()`
2. O repositorio verifica `DATABASE_URL`
3. Se nao existir:
   - retorna `mockSnapshot`
4. Se existir:
   - conecta no banco
   - executa `bootstrapSql`
   - busca contas, cartoes, gastos, receitas, planejamento e snapshots
   - calcula metricas
   - atualiza `monthly_snapshots` se o mes estiver aberto

### Escrita

1. O formulario chama uma `server action`
2. A action valida/converte os campos
3. A action persiste no banco
4. O app executa `revalidatePath`
5. O usuario volta para a rota com `flash` de sucesso ou erro

## 4. Funcionalidades implementadas

### Dashboard

- saldo disponivel
- projecao do mes
- comparativo dos ultimos meses
- resumo de contas
- resumo de gastos fixos
- resumo de uso de cartao

### Cartoes e contas

- criar conta
- editar conta
- excluir conta
- criar cartao
- editar cartao
- excluir cartao
- criar lancamento semanal
- editar lancamento semanal
- excluir lancamento semanal

### Gastos fixos

- criar gasto fixo
- editar gasto fixo
- excluir gasto fixo
- recorrencia mensal ou anual

### Planejamento

- criar categoria de planejamento
- editar categoria
- excluir categoria
- copiar planejamento para o proximo mes

### Receitas

- receita recorrente
- receita pontual
- criar, editar e excluir

### Fechamento mensal

- fechar o mes atual
- congelar dados em `monthly_snapshots.closed_at`
- impedir sobrescrita automatica de mes fechado

## 5. Schema atual

O schema e criado em [lib/db.ts](/g:/Projetos/Teste%20codex/lib/db.ts).

### Tabelas

#### `accounts`

- `id`
- `name`
- `bank`
- `balance`
- `status`
- `created_at`

#### `cards`

- `id`
- `nickname`
- `credit_limit`
- `closing_day`
- `due_day`
- `active`
- `created_at`

#### `weekly_card_logs`

- `id`
- `card_id`
- `month_key`
- `week_label`
- `cumulative_amount`
- `created_at`

#### `fixed_expenses`

- `id`
- `name`
- `amount`
- `category`
- `payment_method`
- `starts_on`
- `ends_on`
- `recurring_type`
- `active`
- `created_at`

#### `recurring_income`

- `id`
- `name`
- `amount`
- `starts_on`
- `recurring_type`
- `active`
- `created_at`

#### `income_entries`

- `id`
- `name`
- `amount`
- `month_key`
- `entry_type`
- `occurs_on`
- `created_at`

#### `planning_budgets`

- `id`
- `category`
- `planned_amount`
- `actual_amount`
- `month_key`
- `created_at`

#### `monthly_snapshots`

- `month_key`
- `income_total`
- `fixed_total`
- `card_total`
- `account_total`
- `available_balance`
- `closed_at`
- `updated_at`

## 6. Regras de negocio atuais

### Recorrencias

- gasto fixo mensal entra em todos os meses a partir de `starts_on`
- gasto fixo anual entra apenas no mesmo mes de `starts_on`
- receita recorrente segue a mesma logica
- se `ends_on` existir e o periodo acabar antes do mes consultado, a recorrencia nao entra

### Cartao

- o total gasto do mes usa o ultimo `cumulative_amount` do mes atual
- o percentual de uso considera `total gasto / soma dos limites ativos`

### Snapshot mensal

- ao ler o dashboard, o sistema faz `upsert` do mes atual em `monthly_snapshots`
- se o mes estiver fechado, o `upsert` nao sobrescreve os numeros

### Fechamento mensal

- ao fechar o mes atual:
  - soma contas
  - soma cartoes
  - soma gastos fixos ativos no mes
  - soma receitas recorrentes e pontuais do mes
  - salva em `monthly_snapshots`
  - grava `closed_at`

## 7. Experiencia atual do usuario

Ja existe suporte para:

- mensagens de sucesso e erro
- botoes com estado de envio
- estados vazios em listas
- modo demo quando o banco nao esta configurado

Arquivos relevantes:

- [components/form-status.tsx](/g:/Projetos/Teste%20codex/components/form-status.tsx)
- [components/finflow-forms.tsx](/g:/Projetos/Teste%20codex/components/finflow-forms.tsx)
- [components/finflow-sections.tsx](/g:/Projetos/Teste%20codex/components/finflow-sections.tsx)

## 8. Telemetria

O projeto ja inclui:

- `@vercel/analytics`
- `@vercel/speed-insights`

Os componentes estao em [app/layout.tsx](/g:/Projetos/Teste%20codex/app/layout.tsx).

## 9. Infraestrutura necessaria para continuar

### Obrigatorio

- repositorio no GitHub
- projeto na Vercel
- banco Neon conectado
- `DATABASE_URL` configurada na Vercel
- `.env.local` com a mesma `DATABASE_URL`

### Recomendado

- `APP_PIN` configurada na Vercel para bloquear o app por PIN
- rotacionar credenciais do banco se elas foram expostas
- manter apenas a URL pooled no app
- validar sempre em `Preview` antes de `Production`

## 10. Checklist operacional

### Ambiente local

```bash
npm install
npm run dev
```

### Build de validacao

```bash
npm run build
```

### Teste rapido de persistencia

1. criar uma conta em `/cards`
2. abrir o Neon
3. rodar:

```sql
select * from accounts order by created_at desc;
```

## 11. O que falta fazer

### Prioridade alta

1. fechar qualquer mes manualmente
2. expandir a reabertura para meses anteriores
3. definir suporte a operacoes futuras sem afetar mes fechado
4. evoluir do PIN para autenticacao mais robusta, se necessario

### Prioridade media

1. testes das server actions
2. testes do repositorio
3. indices adicionais no banco
4. seeds para ambiente de demonstracao

### Prioridade de produto

1. filtros por mes em mais telas
2. relatorio mais detalhado por competencia
3. exportacao simples
4. refinamento de dashboard mobile

## 12. Riscos e observacoes

- hoje o projeto nao tem autenticacao
- hoje existe protecao minima via `APP_PIN`, mas ainda nao ha usuarios ou perfis
- o schema esta sendo bootstrapped em runtime; para MVP funciona bem, mas em producao madura o ideal e migrar para migrations formais
- o projeto ainda nao tem suite de testes automatizada

## 13. Recomendacao de continuidade

Se a meta for transformar isso em um app mais pronto para uso real, a ordem mais forte e:

1. seguranca minima
2. regras completas de fechamento mensal
3. testes
4. relatorios
