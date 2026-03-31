# Banco de Dados — Aero Timesheet

## Diagrama do Schema

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│         auth.users          │       │          projects           │
│─────────────────────────────│       │─────────────────────────────│
│ id          UUID PK         │       │ id             UUID PK      │
│ email       TEXT             │       │ codigo         TEXT UNIQUE  │
│ ...                         │       │ nome           TEXT         │
└──────────────┬──────────────┘       │ cliente        TEXT         │
               │ trigger:             │ descricao      TEXT?        │
               │ fn_handle_new_user   │ ativo          BOOL         │
               ▼                      │ orcamento_horas NUMERIC?    │
┌─────────────────────────────┐       │ data_inicio    DATE         │
│          profiles           │       │ data_fim       DATE?        │
│─────────────────────────────│       └──────────────┬──────────────┘
│ id            UUID PK (FK)  │                      │
│ email         TEXT           │                      │
│ nome_completo TEXT           │                      │
│ cargo         user_role      │                      │
│ departamento  TEXT           │                      │
│ gestor_id     UUID? (FK→self)│                      │
│ ativo         BOOL           │                      │
│ avatar_url    TEXT?          │                      │
└──────────────┬──────────────┘                      │
               │                                     │
               │ 1:N                                 │
               ▼                                     │
┌─────────────────────────────┐                      │
│      timesheet_weeks        │                      │
│─────────────────────────────│                      │
│ id             UUID PK      │                      │
│ user_id        UUID (FK)    │──┐                   │
│ semana_inicio  DATE         │  │                   │
│ semana_fim     DATE         │  │                   │
│ status         ts_status    │  │                   │
│ total_horas    NUMERIC      │  │ trigger:          │
│ observacoes    TEXT?         │  │ fn_recalcular_    │
│ submetido_em   TIMESTAMPTZ? │  │ total_horas       │
│ aprovado_por   UUID? (FK)   │  │                   │
│ aprovado_em    TIMESTAMPTZ? │  │                   │
│ motivo_rejeicao TEXT?       │  │                   │
│ UNIQUE(user_id,semana_inicio│  │                   │
└──────────────┬──────────────┘  │                   │
               │                 │                   │
      ┌────────┴────────┐        │                   │
      │ 1:N             │ 1:N    │                   │
      ▼                 ▼        │                   │
┌──────────────┐ ┌──────────────────────────────┐    │
│approval_logs │ │     timesheet_entries         │    │
│──────────────│ │──────────────────────────────│    │
│id     UUID PK│ │ id               UUID PK     │    │
│ts_week UUID  │ │ timesheet_week_id UUID (FK)  │◄───┘
│acao   action │ │ project_id       UUID (FK)   │────┘
│realiz. UUID  │ │ categoria        ts_category │
│comentario T? │ │ descricao        TEXT?       │
│created_at    │ │ horas_seg..dom   NUMERIC     │
└──────────────┘ │ total_linha      NUMERIC GEN │
                 │ UNIQUE(week,project,categoria│
                 └──────────────────────────────┘
```

## Tabelas

### profiles
Estende `auth.users` do Supabase. Criado automaticamente via trigger quando um usuário se registra.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | FK para auth.users, cascata on delete |
| email | TEXT NOT NULL | Email do usuário |
| nome_completo | TEXT NOT NULL | Nome completo |
| cargo | user_role | `colaborador`, `gestor`, `administrador` |
| departamento | TEXT | Departamento (default: 'Geral') |
| gestor_id | UUID? | FK self-referencing para o gestor direto |
| ativo | BOOLEAN | Se o colaborador está ativo |
| avatar_url | TEXT? | URL do avatar |

**Índices:** `cargo`, `departamento`, `gestor_id`

### projects
Projetos/contratos onde horas são alocadas.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Auto-gerado |
| codigo | TEXT UNIQUE | Código do projeto (ex: AER-2026-001) |
| nome | TEXT NOT NULL | Nome do projeto |
| cliente | TEXT NOT NULL | Nome do cliente |
| descricao | TEXT? | Descrição detalhada |
| ativo | BOOLEAN | Se o projeto está ativo |
| orcamento_horas | NUMERIC(10,2)? | Total de horas orçadas |
| data_inicio | DATE | Data de início |
| data_fim | DATE? | Data de fim prevista |

**Índices:** `codigo`, `ativo`, `cliente`

### timesheet_weeks
Cabeçalho do timesheet semanal de cada colaborador. Um único registro por colaborador por semana.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Auto-gerado |
| user_id | UUID FK | Dono do timesheet |
| semana_inicio | DATE | Segunda-feira (CHECK ISODOW = 1) |
| semana_fim | DATE | Domingo (CHECK = inicio + 6 dias) |
| status | timesheet_status | `rascunho`, `submetido`, `aprovado`, `rejeitado` |
| total_horas | NUMERIC(6,2) | Calculado via trigger |
| observacoes | TEXT? | Observações do colaborador |
| submetido_em | TIMESTAMPTZ? | Quando foi submetido |
| aprovado_por | UUID? FK | Quem aprovou/rejeitou |
| aprovado_em | TIMESTAMPTZ? | Quando foi aprovado/rejeitado |
| motivo_rejeicao | TEXT? | Motivo da rejeição |

**Constraints:** `UNIQUE(user_id, semana_inicio)`, `CHECK(ISODOW = 1)`, `CHECK(semana_fim = semana_inicio + 6)`
**Índices:** `user_id`, `status`, `semana_inicio`, `aprovado_por`

### timesheet_entries
Lançamentos individuais de horas por projeto/categoria dentro de uma semana.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Auto-gerado |
| timesheet_week_id | UUID FK | FK para timesheet_weeks (CASCADE) |
| project_id | UUID FK | FK para projects (RESTRICT) |
| categoria | timesheet_category | `regular`, `hora_extra`, `viagem`, `treinamento` |
| descricao | TEXT? | Descrição da atividade |
| horas_seg..dom | NUMERIC(4,2) | Horas por dia (CHECK 0-24) |
| total_linha | NUMERIC(6,2) GENERATED | Soma automática seg+ter+...+dom |

**Constraints:** `UNIQUE(timesheet_week_id, project_id, categoria)`, `CHECK(horas >= 0 AND <= 24)`
**Índices:** `timesheet_week_id`, `project_id`, `categoria`

### approval_logs
Trilha de auditoria imutável para todas as ações sobre timesheets.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Auto-gerado |
| timesheet_week_id | UUID FK | FK para timesheet_weeks (CASCADE) |
| acao | approval_action | `submetido`, `aprovado`, `rejeitado`, `reaberto` |
| realizado_por | UUID FK | Quem executou a ação |
| comentario | TEXT? | Comentário opcional |
| created_at | TIMESTAMPTZ | Timestamp da ação |

**Índices:** `timesheet_week_id`, `acao`, `realizado_por`

## Enums

| Enum | Valores |
|---|---|
| user_role | `colaborador`, `gestor`, `administrador` |
| timesheet_status | `rascunho`, `submetido`, `aprovado`, `rejeitado` |
| timesheet_category | `regular`, `hora_extra`, `viagem`, `treinamento` |
| approval_action | `submetido`, `aprovado`, `rejeitado`, `reaberto` |

## Views

### vw_horas_por_projeto
Horas agrupadas por projeto (somente timesheets aprovados). Retorna total_horas, horas_regular, horas_extra, horas_viagem, horas_treinamento.

### vw_horas_por_colaborador
Horas agrupadas por colaborador. Retorna total_horas, semanas_submetidas, semanas_aprovadas, semanas_pendentes.

### vw_resumo_semanal
Resumo semanal geral: total_colaboradores, total_horas, timesheets por status. Ordenado por semana_inicio DESC.

## Funções

### get_dashboard_summary(...)
Função RPC que retorna resumo do dashboard com filtros opcionais:
- `periodo_inicio` / `periodo_fim` — Intervalo de datas
- `p_project_id` — Filtrar por projeto
- `p_user_id` — Filtrar por colaborador
- `p_departamento` — Filtrar por departamento
- `p_status` — Filtrar por status

Retorna o mesmo schema de `vw_resumo_semanal` mas filtrado. Definida como `STABLE SECURITY DEFINER`.

## Triggers

### fn_recalcular_total_horas
**Evento:** AFTER INSERT/UPDATE/DELETE em `timesheet_entries`
**Ação:** Recalcula `total_horas` no `timesheet_weeks` pai somando todas as entries.

### fn_updated_at
**Evento:** BEFORE UPDATE em `profiles`, `projects`, `timesheet_weeks`, `timesheet_entries`
**Ação:** Atualiza o campo `updated_at` para `now()`.

### fn_handle_new_user
**Evento:** AFTER INSERT em `auth.users`
**Ação:** Cria automaticamente um registro em `profiles` com email e nome do novo usuário.

## Políticas RLS (Row Level Security)

Todas as 5 tabelas têm RLS habilitado.

### profiles
| Política | Operação | Regra |
|---|---|---|
| profiles_select_all | SELECT | Todos podem ver todos os perfis |
| profiles_update_own | UPDATE | Cada um edita o próprio perfil |
| profiles_update_admin | UPDATE | Administradores editam qualquer perfil |

### projects
| Política | Operação | Regra |
|---|---|---|
| projects_select_authenticated | SELECT | Qualquer autenticado pode ver |
| projects_insert_admin | INSERT | Apenas administradores |
| projects_update_admin | UPDATE | Apenas administradores |
| projects_delete_admin | DELETE | Apenas administradores |

### timesheet_weeks
| Política | Operação | Regra |
|---|---|---|
| tw_select_own | SELECT | Colaborador vê os próprios |
| tw_select_manager | SELECT | Gestor vê subordinados + departamento; admin vê todos |
| tw_insert_own | INSERT | Apenas para o próprio user_id |
| tw_update_own_draft | UPDATE | Dono edita se status = rascunho/rejeitado |
| tw_update_manager | UPDATE | Gestor atualiza status (aprovar/rejeitar) |
| tw_delete_own_draft | DELETE | Dono exclui se status = rascunho |

### timesheet_entries
| Política | Operação | Regra |
|---|---|---|
| te_select_own | SELECT | Herda permissão do timesheet_week pai |
| te_select_manager | SELECT | Gestor vê entries de subordinados |
| te_insert_own | INSERT | Dono, se timesheet em rascunho/rejeitado |
| te_update_own | UPDATE | Dono, se timesheet em rascunho/rejeitado |
| te_delete_own | DELETE | Dono, se timesheet em rascunho/rejeitado |

### approval_logs
| Política | Operação | Regra |
|---|---|---|
| al_select_own | SELECT | Dono do timesheet vê histórico |
| al_select_manager | SELECT | Gestores e admins vêem todos |
| al_insert_authenticated | INSERT | Qualquer autenticado (valida realizado_por = auth.uid()) |

## Seed Data

5 projetos pré-configurados:
- AER-2026-001 — Plataforma Aeroespacial X1 (Embraer)
- AER-2026-002 — Sistema de Telemetria T3 (INPE)
- AER-2026-003 — Manutenção Frota Legacy (LATAM)
- AER-2026-004 — Consultoria Regulatória ANAC (GOL)
- INT-2026-001 — Atividades Internas (Aero Engenharia)
