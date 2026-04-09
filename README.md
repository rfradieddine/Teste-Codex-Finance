# FinFlow

Aplicacao financeira pessoal em `Next.js` com deploy na `Vercel` e persistencia em `Neon Postgres`.

O projeto foi desenhado para funcionar em dois modos:

- `modo demo`: quando `DATABASE_URL` nao existe, usa snapshot local em memoria
- `modo persistido`: quando `DATABASE_URL` existe, usa Postgres real e cria o schema automaticamente

## Stack

- `Next.js 15`
- `React 19`
- `TypeScript`
- `postgres` para acesso ao Neon
- `Vercel Analytics`
- `Vercel Speed Insights`

## Funcionalidades atuais

- Dashboard com saldo disponivel, projecao e comparativo mensal
- Cadastro de contas bancarias
- Cadastro de cartoes de credito
- Lancamentos semanais por cartao
- Cadastro de gastos fixos recorrentes
- Planejamento por categoria
- Cadastro de receitas recorrentes e pontuais
- Fechamento do mes atual
- Copia do planejamento para o proximo mes
- Feedback visual de sucesso e erro nos formularios

## Rotas principais

- `/dashboard`
- `/cards`
- `/fixed-expenses`
- `/planning`
- `/settings`

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Crie `.env.local`:

```env
DATABASE_URL=postgresql://...
```

3. Rode o projeto:

```bash
npm run dev
```

4. Acesse:

```text
http://localhost:3000/dashboard
```

## Variaveis de ambiente

- `DATABASE_URL`
  - obrigatoria para persistencia real
  - use a URL pooled da Neon, a marcada como `Recommended for most uses`
- `APP_PIN`
  - opcional
  - se configurada, protege o app com uma tela de desbloqueio por PIN

## Deploy

Fluxo recomendado:

1. push para `main`
2. deploy na `Vercel`
3. configurar `DATABASE_URL` em:
   - `Development`
   - `Preview`
   - `Production`
4. abrir o app e validar criacao das tabelas
5. se quiser protecao minima, configurar tambem `APP_PIN`

## Como validar se o banco esta funcionando

1. cadastre uma conta em `/cards`
2. abra o `SQL Editor` no Neon
3. rode:

```sql
select id, name, bank, balance, status, created_at
from accounts
order by created_at desc;
```

Se a linha aparecer, a persistencia esta funcionando.

## Estrutura resumida

- [app/layout.tsx](/g:/Projetos/Teste%20codex/app/layout.tsx): layout global, fontes, analytics e speed insights
- [app/actions.ts](/g:/Projetos/Teste%20codex/app/actions.ts): server actions de CRUD e fechamento mensal
- [lib/db.ts](/g:/Projetos/Teste%20codex/lib/db.ts): conexao com Postgres e bootstrap SQL
- [lib/repository.ts](/g:/Projetos/Teste%20codex/lib/repository.ts): leitura consolidada do snapshot financeiro
- [components/finflow-forms.tsx](/g:/Projetos/Teste%20codex/components/finflow-forms.tsx): formularios principais
- [components/finflow-sections.tsx](/g:/Projetos/Teste%20codex/components/finflow-sections.tsx): listas, cards e estados vazios

## Proximos passos recomendados

1. permitir fechamento manual de qualquer mes
2. permitir reabertura de mes fechado
3. proteger o app com PIN ou autenticacao leve
4. adicionar testes de server actions e repositorio
5. evoluir historico mensal com relatorios por competencia

## Documentacao detalhada

Veja [docs/SYSTEM.md](/g:/Projetos/Teste%20codex/docs/SYSTEM.md).
