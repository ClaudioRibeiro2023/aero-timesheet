# Arquitetura — Aero Timesheet

Documento de arquitetura do sistema de registro de horas da Aero Engenharia. Descreve a visão geral, modelo de dados, fluxo de requisições, decisões arquiteturais (ADRs) e padrões adotados.

---

## Visão Geral

O Aero Timesheet é uma aplicação **full-stack serverless** construída sobre o App Router do Next.js 14. Não há servidor dedicado: toda lógica de negócio roda em Server Components, Server Actions e Edge Functions da Netlify.

### Princípios arquiteturais

| Princípio | Aplicação no sistema |
|---|---|
| **Segurança na camada de dados** | RLS no PostgreSQL garante isolamento independente da aplicação |
| **Server-first** | Dados carregados em Server Components; Client Components apenas para interatividade |
| **Mutações via Server Actions** | Sem endpoints REST separados para escritas — Server Actions com validação Zod |
| **Consistência garantida por triggers** | Totais de horas calculados pelo banco, nunca pelo frontend |
| **TypeScript strict** | Todos os arquivos em modo estrito; `any` proibido |

---

## Modelo de Dados

### Diagrama de Entidades

```
auth.users (Supabase Auth)
    │
    └── profiles (1:1, trigger fn_handle_new_user)
            │
            ├── gestor_id ──────────────────► profiles (auto-referência: gestor direto)
            │
            └── timesheet_weeks (1:N por user_id)
                    │
                    ├── timesheet_entries (1:N por timesheet_week_id)
                    │       └── projects (N:1 por project_id)
                    │
                    └── approval_logs (1:N por timesheet_week_id)
                            └── profiles (N:1 por realizado_por)
```

### Tabelas

#### `profiles`

Estende `auth.users` do Supabase. Criado automaticamente via trigger quando o usuário se registra.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | Referência a `auth.users(id)` |
| `email` | `TEXT` | E-mail do usuário |
| `nome_completo` | `TEXT` | Nome exibido na interface |
| `cargo` | `user_role` | `colaborador` / `gestor` / `administrador` |
| `departamento` | `TEXT` | Departamento (usado para escopo de aprovação) |
| `gestor_id` | `UUID FK` | Referência ao gestor direto (auto-referência) |
| `ativo` | `BOOLEAN` | Soft delete — desativar sem excluir histórico |
| `avatar_url` | `TEXT` | URL opcional de avatar |
| `created_at` | `TIMESTAMPTZ` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | Atualizado automaticamente por trigger |

Índices: `cargo`, `departamento`, `gestor_id`

#### `projects`

Projetos e contratos onde horas são alocadas. Gerenciado por administradores.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | Identificador único |
| `codigo` | `TEXT UNIQUE` | Código do projeto (ex: `AER-2026-001`) |
| `nome` | `TEXT` | Nome descritivo do projeto |
| `cliente` | `TEXT` | Cliente ou contratante |
| `descricao` | `TEXT` | Descrição opcional |
| `ativo` | `BOOLEAN` | Soft delete |
| `orcamento_horas` | `NUMERIC(10,2)` | Orçamento total de horas (nullable) |
| `data_inicio` | `DATE` | Início do projeto |
| `data_fim` | `DATE` | Término previsto (nullable) |
| `created_at` | `TIMESTAMPTZ` | — |
| `updated_at` | `TIMESTAMPTZ` | Atualizado por trigger |

Índices: `codigo`, `ativo`, `cliente`

Seed data incluído: 5 projetos (Embraer, INPE, LATAM, GOL, Atividades Internas).

#### `timesheet_weeks`

Cabeçalho do timesheet semanal. Um registro por colaborador por semana (constraint `UNIQUE(user_id, semana_inicio)`).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | — |
| `user_id` | `UUID FK` | Referência a `profiles(id)` |
| `semana_inicio` | `DATE` | Sempre segunda-feira (validado por `CHECK`) |
| `semana_fim` | `DATE` | Sempre `semana_inicio + 6 dias` (validado por `CHECK`) |
| `status` | `timesheet_status` | `rascunho` / `submetido` / `aprovado` / `rejeitado` |
| `total_horas` | `NUMERIC(6,2)` | Soma calculada automaticamente pelo trigger `trg_recalcular_total_horas` |
| `observacoes` | `TEXT` | Nota livre do colaborador |
| `submetido_em` | `TIMESTAMPTZ` | Data/hora da submissão |
| `aprovado_por` | `UUID FK` | Referência ao gestor que aprovou |
| `aprovado_em` | `TIMESTAMPTZ` | Data/hora da aprovação |
| `motivo_rejeicao` | `TEXT` | Preenchido pelo gestor ao rejeitar |
| `created_at` | `TIMESTAMPTZ` | — |
| `updated_at` | `TIMESTAMPTZ` | Atualizado por trigger |

Constraints notáveis:
- `UNIQUE(user_id, semana_inicio)` — um timesheet por semana por colaborador
- `CHECK(EXTRACT(ISODOW FROM semana_inicio) = 1)` — garante segunda-feira
- `CHECK(semana_fim = semana_inicio + INTERVAL '6 days')` — garante domingo

Índices: `user_id`, `status`, `semana_inicio`, `aprovado_por`

#### `timesheet_entries`

Lançamentos de horas por linha do grid (projeto + categoria). Vinculados ao `timesheet_week_id`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | — |
| `timesheet_week_id` | `UUID FK` | Referência ao cabeçalho da semana |
| `project_id` | `UUID FK` | Referência ao projeto |
| `categoria` | `timesheet_category` | `regular` / `hora_extra` / `viagem` / `treinamento` |
| `descricao` | `TEXT` | Descrição opcional da atividade |
| `horas_seg` ... `horas_dom` | `NUMERIC(4,2)` | Horas por dia (0–24, validado por `CHECK`) |
| `total_linha` | `NUMERIC(6,2) GENERATED` | Soma dos 7 dias — coluna gerada pelo PostgreSQL (`STORED`) |
| `created_at` | `TIMESTAMPTZ` | — |
| `updated_at` | `TIMESTAMPTZ` | Atualizado por trigger |

Constraint: `UNIQUE(timesheet_week_id, project_id, categoria)` — mesmo projeto/categoria só uma vez por semana.

Índices: `timesheet_week_id`, `project_id`, `categoria`

#### `approval_logs`

Trilha de auditoria imutável. Registra cada transição de estado do timesheet.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | — |
| `timesheet_week_id` | `UUID FK` | Referência ao timesheet |
| `acao` | `approval_action` | `submetido` / `aprovado` / `rejeitado` / `reaberto` |
| `realizado_por` | `UUID FK` | Quem executou a ação |
| `comentario` | `TEXT` | Comentário livre (obrigatório em rejeições) |
| `created_at` | `TIMESTAMPTZ` | Imutável — sem `updated_at` |

Índices: `timesheet_week_id`, `acao`, `realizado_por`

---

### Enums PostgreSQL

```sql
user_role:        colaborador | gestor | administrador
timesheet_status: rascunho | submetido | aprovado | rejeitado
timesheet_category: regular | hora_extra | viagem | treinamento
approval_action:  submetido | aprovado | rejeitado | reaberto
```

---

### Views de Agregação

| View | Propósito | Filtro base |
|---|---|---|
| `vw_horas_por_projeto` | Horas totais por projeto, quebradas por categoria | `status = 'aprovado'` |
| `vw_horas_por_colaborador` | Horas totais, semanas submetidas/aprovadas/pendentes por colaborador | Todos os status |
| `vw_resumo_semanal` | Resumo semanal: colaboradores ativos, total horas, contagem por status | Agrupado por `semana_inicio` |

Função RPC `get_dashboard_summary(periodo_inicio, periodo_fim, project_id, user_id, departamento, status)` combina filtros dinâmicos e retorna dados paginados para o dashboard.

---

### Triggers

| Trigger | Tabela | Evento | Função | Descrição |
|---|---|---|---|---|
| `trg_recalcular_total_horas` | `timesheet_entries` | INSERT / UPDATE / DELETE | `fn_recalcular_total_horas()` | Atualiza `total_horas` no `timesheet_weeks` pai |
| `trg_profiles_updated_at` | `profiles` | UPDATE | `fn_updated_at()` | Atualiza `updated_at` |
| `trg_projects_updated_at` | `projects` | UPDATE | `fn_updated_at()` | Atualiza `updated_at` |
| `trg_timesheet_weeks_updated_at` | `timesheet_weeks` | UPDATE | `fn_updated_at()` | Atualiza `updated_at` |
| `trg_timesheet_entries_updated_at` | `timesheet_entries` | UPDATE | `fn_updated_at()` | Atualiza `updated_at` |
| `trg_on_auth_user_created` | `auth.users` | INSERT | `fn_handle_new_user()` | Cria `profiles` automaticamente ao registrar |

---

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. As 20 policies garantem isolamento estrito por cargo.

### Resumo das policies

| Tabela | Policy | Acesso |
|---|---|---|
| `profiles` | `profiles_select_all` | Qualquer autenticado pode ver todos os perfis |
| `profiles` | `profiles_update_own` | Cada usuário edita o próprio perfil |
| `profiles` | `profiles_update_admin` | Admins editam qualquer perfil |
| `projects` | `projects_select_authenticated` | Qualquer autenticado vê projetos |
| `projects` | `projects_insert/update/delete_admin` | Somente admins gerenciam projetos |
| `timesheet_weeks` | `tw_select_own` | Colaborador vê os próprios timesheets |
| `timesheet_weeks` | `tw_select_manager` | Gestor/admin vê timesheets do departamento |
| `timesheet_weeks` | `tw_insert_own` | Colaborador cria o próprio timesheet |
| `timesheet_weeks` | `tw_update_own_draft` | Colaborador edita rascunhos e rejeitados próprios |
| `timesheet_weeks` | `tw_update_manager` | Gestor/admin muda status (aprovar/rejeitar) |
| `timesheet_weeks` | `tw_delete_own_draft` | Colaborador exclui apenas rascunhos |
| `timesheet_entries` | `te_select_own / te_select_manager` | Segue permissão do `timesheet_week` pai |
| `timesheet_entries` | `te_insert/update/delete_own` | Apenas em timesheets de status `rascunho` ou `rejeitado` |
| `approval_logs` | `al_select_own` | Dono do timesheet vê o próprio histórico |
| `approval_logs` | `al_select_manager` | Gestores/admins veem todos os logs |
| `approval_logs` | `al_insert_authenticated` | Qualquer autenticado insere o próprio log |

---

## Fluxo de Dados

### Leitura (Server Components)

```
Browser
  │
  └── Server Component (page.tsx)
        │
        └── lib/queries/timesheets.ts
              │
              └── Supabase server client (lib/supabase/server.ts)
                    │
                    └── PostgreSQL + RLS (retorna apenas dados autorizados)
                          │
                          └── Renderiza HTML no servidor → entrega ao browser
```

### Mutação (Server Actions)

```
Browser (Client Component)
  │
  └── Chama Server Action (lib/actions/timesheet-actions.ts)
        │
        ├── Valida entrada com Zod (lib/validations/timesheet.ts)
        │
        ├── Supabase server client com sessão do usuário
        │
        ├── INSERT/UPDATE via Supabase RPC ou query direta
        │     │
        │     └── PostgreSQL executa trigger → recalcula totais
        │
        └── revalidatePath('/timesheet') → atualiza dados na tela
```

### Autenticação

```
Usuário acessa qualquer rota
  │
  └── middleware.ts intercepta a requisição
        │
        ├── lib/supabase/middleware.ts: verifica cookie de sessão
        │
        ├── Não autenticado? → Redirect 302 para /login
        │
        └── Autenticado? → Passa a requisição para o handler

Login (/login/page.tsx)
  │
  └── Supabase Auth (email/senha ou magic link)
        │
        └── Redirect para /auth/callback/route.ts
              │
              └── Troca authorization code por sessão
                    │
                    └── Seta cookie HttpOnly → Redirect para /dashboard
```

---

## Máquina de Estados do Timesheet

```
                    ┌──────────┐
          Criação   │          │
        ──────────► │ rascunho │
                    │          │
                    └────┬─────┘
                         │ Colaborador submete
                         ▼
                    ┌──────────┐
                    │          │
                    │submetido │
                    │          │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │ Gestor aprova       │ Gestor rejeita
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │          │         │          │
        │ aprovado │         │ rejeitado│
        │          │         │          │
        └──────────┘         └────┬─────┘
                                  │ Colaborador reabre
                                  ▼
                            ┌──────────┐
                            │          │
                            │ rascunho │ (volta ao início)
                            │          │
                            └──────────┘
```

Cada transição registra uma entrada em `approval_logs` com data, responsável e comentário.

---

## Decisões Arquiteturais (ADRs)

### ADR-001 — Timesheet como grid semanal, não diário

**Decisão:** Usar formato de grid segunda-a-domingo com uma linha por projeto/categoria, permitindo edição inline de todas as horas da semana simultaneamente.

**Justificativa:** Padrão consolidado de mercado para timesheets corporativos. Reduz fricção — o colaborador preenche toda a semana de uma vez em vez de fazer 5 a 7 lançamentos separados. Consistente com ferramentas como Harvest, Toggl Track e SAP CrossProject.

**Alternativa rejeitada:** Lançamento diário individual por entrada — mais cliques, UX inferior.

---

### ADR-002 — Supabase RLS como camada primária de segurança

**Decisão:** Usar Row Level Security do PostgreSQL via Supabase para garantir que colaboradores só vejam seus próprios timesheets, gestores vejam os do departamento, e admins vejam tudo.

**Justificativa:** RLS garante segurança na camada de dados, independente de bugs no frontend ou na API. Impossível vazar dados mesmo com erro de programação na aplicação. A política é declarada no banco, não no código.

**Alternativa rejeitada:** Filtros apenas no código da aplicação — vulnerável a bypass por erros de lógica.

---

### ADR-003 — PDF gerado server-side com @react-pdf/renderer

**Decisão:** Gerar PDFs em Server Actions/API routes do Next.js usando `@react-pdf/renderer`, retornando o buffer como download direto.

**Justificativa:** Permite templates React para o PDF (consistência visual com a aplicação), funciona sem dependência de browser/Puppeteer e roda em serverless (Netlify Functions). Cold start aceitável para os volumes esperados (limitado a 52 semanas).

**Alternativa rejeitada:** html2pdf/Puppeteer — pesado para serverless, cold start alto, dependência de Chrome headless.

**Risco mitigado:** Limitar relatório PDF a máximo de 52 semanas. Implementar loading indicator. Para volumes maiores, considerar geração assíncrona com link por e-mail.

---

### ADR-004 — Máquina de estados com 4 estados lineares

**Decisão:** Fluxo linear com 4 estados: `rascunho → submetido → aprovado | rejeitado`. Rejeitado pode voltar para rascunho (reabrir).

**Justificativa:** Cobre 95% dos casos de uso corporativos de registro de horas sem complexidade desnecessária. O `approval_log` registra todo o histórico de ações, garantindo auditoria completa mesmo com o modelo simplificado.

**Alternativa rejeitada:** Workflow engine completo com estados customizáveis por empresa — overengineering para o escopo e a maturidade atual do sistema.

---

### ADR-005 — Cálculo de totais via triggers PostgreSQL

**Decisão:** `total_linha` em `timesheet_entries` é uma coluna gerada (`GENERATED ALWAYS AS ... STORED`). `total_horas` em `timesheet_weeks` é atualizado pelo trigger `trg_recalcular_total_horas` após qualquer INSERT, UPDATE ou DELETE em `timesheet_entries`.

**Justificativa:** Garante consistência dos dados independente da origem (UI, API, importação direta, scripts de migração). Elimina divergência entre a soma exibida na tela e o valor real no banco.

**Alternativa rejeitada:** Calcular apenas no frontend — risco de inconsistência quando dados são alterados por múltiplos caminhos.

---

## Estrutura de Camadas

```
┌─────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO                      │
│   Server Components (page.tsx) + Loading States      │
│   Client Components (interatividade e formulários)   │
└─────────────────────────────┬───────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────┐
│                    APLICAÇÃO                         │
│   Server Actions (lib/actions/timesheet-actions.ts)  │
│   Validação Zod (lib/validations/timesheet.ts)       │
│   Queries de leitura (lib/queries/timesheets.ts)     │
└─────────────────────────────┬───────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────┐
│                    INFRAESTRUTURA                    │
│   Supabase Client (lib/supabase/client.ts)           │
│   Supabase Server (lib/supabase/server.ts)           │
│   Supabase Middleware (lib/supabase/middleware.ts)   │
└─────────────────────────────┬───────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────┐
│                    DADOS                             │
│   PostgreSQL (Supabase)                              │
│   RLS Policies (20 policies, 5 tabelas)              │
│   Triggers (cálculo de totais + updated_at)          │
│   Views (vw_horas_por_projeto, etc.)                 │
│   Função RPC (get_dashboard_summary)                 │
└─────────────────────────────────────────────────────┘
```

---

## Riscos e Mitigações

| ID | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| RISK-001 | Cold start da Netlify Function impacta geração de PDF para relatórios grandes | Média | Baixo | Limitar a 52 semanas, implementar loading indicator |
| RISK-002 | RLS policies complexas causam queries lentas em dashboards com muitos dados | Baixa | Médio | Views de agregação pré-calculadas e índices compostos em `(user_id, semana_inicio, status)` |
| RISK-003 | Grid de timesheet com UX ruim em telas mobile abaixo de 768px | Alta | Médio | Layout alternativo: lista vertical de dias em vez de grid horizontal. Responsive via breakpoints Tailwind. |
