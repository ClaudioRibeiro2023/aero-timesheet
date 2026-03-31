# API — Aero Timesheet

## Visão Geral

O Aero Timesheet utiliza duas abordagens para comunicação com o backend:

1. **API Routes (Next.js)** — Para endpoints REST tradicionais (dashboard, health check)
2. **Server Actions** — Para mutações (CRUD de entries, fluxo de aprovação)

Toda comunicação com o Supabase passa pela camada `lib/queries/timesheets.ts`, que centraliza as queries.

---

## API Routes

### GET /api/health

Health check da aplicação e conexão com o banco.

**Autenticação:** Nenhuma

**Resposta 200 (saudável):**
```json
{
  "status": "saudável",
  "versao": "1.0.0",
  "timestamp": "2026-03-25T22:00:00.000Z",
  "latencia_total_ms": 45,
  "servicos": {
    "banco_de_dados": {
      "status": "connected",
      "latencia_ms": 32
    }
  },
  "ambiente": "production"
}
```

**Resposta 503 (degradado):**
```json
{
  "status": "degradado",
  "servicos": {
    "banco_de_dados": {
      "status": "error",
      "latencia_ms": 0,
      "erro": "mensagem de erro"
    }
  }
}
```

---

### GET /api/dashboard

Retorna estatísticas agregadas para o dashboard.

**Autenticação:** Requerida (cookie de sessão Supabase)

**Query Params (todos opcionais):**
| Parâmetro | Tipo | Formato | Descrição |
|---|---|---|---|
| periodo_inicio | string | YYYY-MM-DD | Início do período |
| periodo_fim | string | YYYY-MM-DD | Fim do período |
| project_id | string | UUID | Filtrar por projeto |
| user_id | string | UUID | Filtrar por colaborador |
| departamento | string | texto | Filtrar por departamento |
| status | string | enum | `rascunho`, `submetido`, `aprovado`, `rejeitado` |

**Resposta 200:**
```json
{
  "resumo": {
    "total_horas": 1250.5,
    "total_colaboradores": 15,
    "total_projetos": 5
  },
  "por_semana": [
    {
      "semana_inicio": "2026-03-17",
      "total_colaboradores": 12,
      "total_horas": 480.0,
      "timesheets_submetidos": 3,
      "timesheets_aprovados": 8,
      "timesheets_rejeitados": 1,
      "timesheets_rascunho": 0
    }
  ],
  "por_projeto": [
    {
      "project_id": "uuid",
      "projeto_nome": "Plataforma Aeroespacial X1",
      "projeto_codigo": "AER-2026-001",
      "cliente": "Embraer",
      "total_horas": 450.0,
      "horas_regular": 400.0,
      "horas_extra": 30.0,
      "horas_viagem": 12.0,
      "horas_treinamento": 8.0
    }
  ],
  "por_colaborador": [
    {
      "user_id": "uuid",
      "nome_completo": "Pedro Silva",
      "departamento": "Engenharia",
      "total_horas": 160.0,
      "semanas_submetidas": 1,
      "semanas_aprovadas": 3,
      "semanas_pendentes": 0
    }
  ]
}
```

**Erros:**
| Status | Descrição |
|---|---|
| 401 | Não autenticado |
| 400 | Filtros inválidos (validação Zod) |
| 500 | Erro interno |

---

### GET /auth/callback

Callback do OAuth/magic link do Supabase Auth. Troca o `code` por sessão e redireciona.

**Query Params:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| code | string | Código de autorização do Supabase |

**Resposta:** Redirect 302 para `/dashboard` (sucesso) ou `/login` (erro)

---

## Server Actions

Todas as Server Actions estão em `src/lib/actions/timesheet-actions.ts` e retornam:

```typescript
interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}
```

### createEntry(formData: FormData)

Cria um novo lançamento de horas.

**FormData:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| timesheet_week_id | UUID | Sim | ID do timesheet semanal |
| project_id | UUID | Sim | ID do projeto |
| categoria | enum | Sim | `regular`, `hora_extra`, `viagem`, `treinamento` |
| descricao | string | Não | Descrição da atividade (max 500 chars) |
| horas_seg | number | Sim | Horas segunda (0-24, step 0.25) |
| horas_ter | number | Sim | Horas terça |
| horas_qua | number | Sim | Horas quarta |
| horas_qui | number | Sim | Horas quinta |
| horas_sex | number | Sim | Horas sexta |
| horas_sab | number | Sim | Horas sábado |
| horas_dom | number | Sim | Horas domingo |

**Validações:**
- Usuário autenticado e dono do timesheet
- Timesheet em status `rascunho` ou `rejeitado`
- Total de horas > 0 (pelo menos um dia preenchido)
- Horas entre 0 e 24, múltiplos de 0.25

**Revalidação:** `/timesheet`, `/dashboard`

---

### updateEntry(entryId: string, formData: FormData)

Atualiza um lançamento existente. Mesmos campos do `createEntry` (todos opcionais).

**Validações:** Mesmas do `createEntry` + entry deve existir.

---

### deleteEntry(entryId: string)

Remove um lançamento de horas.

**Validações:**
- Usuário autenticado e dono do timesheet
- Timesheet em status `rascunho` ou `rejeitado`

---

### submitTimesheet(timesheetId: string)

Submete o timesheet para aprovação do gestor. Muda status `rascunho`/`rejeitado` para `submetido`.

**Validações:**
- Pelo menos uma entry no timesheet
- Status atual é `rascunho` ou `rejeitado`
- Usuário é o dono

**Efeitos:** Registra log de auditoria com ação `submetido`.

**Revalidação:** `/timesheet`, `/aprovacoes`, `/dashboard`

---

### approveTimesheet(formData: FormData)

Gestor aprova um timesheet submetido.

**FormData:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| timesheet_week_id | UUID | Sim |
| comentario | string | Não |

**Validações:**
- Usuário é `gestor` ou `administrador`
- Timesheet em status `submetido`

**Efeitos:** Status muda para `aprovado`, registra `aprovado_por` e `aprovado_em`, log de auditoria.

---

### rejectTimesheet(formData: FormData)

Gestor rejeita um timesheet submetido.

**FormData:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| timesheet_week_id | UUID | Sim |
| comentario | string | **Sim** (motivo da rejeição é obrigatório) |

**Validações:**
- Usuário é `gestor` ou `administrador`
- Timesheet em status `submetido`
- Comentário preenchido

**Efeitos:** Status muda para `rejeitado`, registra `motivo_rejeicao`, log de auditoria.

---

### reopenTimesheet(timesheetId: string)

Reabre um timesheet rejeitado (volta para rascunho).

**Validações:**
- Usuário é o dono do timesheet
- Status atual é `rejeitado`

**Efeitos:** Status volta para `rascunho`, limpa campos de aprovação, log de auditoria com ação `reaberto`.

---

## Funções de Query (lib/queries/timesheets.ts)

Camada de acesso ao banco de dados, usada pelas Server Actions e API Routes.

| Função | Descrição |
|---|---|
| `getWeeklyTimesheet(userId, weekStart)` | Busca timesheet da semana (ou null) |
| `getOrCreateWeeklyTimesheet(userId, weekStart)` | Busca ou cria timesheet da semana |
| `getTimesheetEntries(timesheetId)` | Lista entries com dados do projeto |
| `createTimeEntry(timesheetId, entry)` | Cria nova entry |
| `updateTimeEntry(entryId, updates)` | Atualiza entry parcialmente |
| `deleteTimeEntry(entryId)` | Remove entry |
| `submitTimesheet(timesheetId, userId, obs?)` | Submete para aprovação |
| `approveTimesheet(timesheetId, reviewerId, notes?)` | Aprova timesheet |
| `rejectTimesheet(timesheetId, reviewerId, notes?)` | Rejeita timesheet |
| `reopenTimesheet(timesheetId, adminId, notes?)` | Reabre timesheet |
| `getTimesheetsByStatus(status, dept?)` | Lista por status (tela aprovação) |
| `getUserTimesheets(userId, limit?)` | Histórico do colaborador |
| `getApprovalHistory(timesheetId)` | Log de aprovações |
| `getDashboardStats(filters?)` | Resumo via RPC |
| `getHorasPorProjeto()` | View agregada por projeto |
| `getHorasPorColaborador()` | View agregada por colaborador |
| `getActiveProjects()` | Projetos ativos para dropdowns |
| `getCurrentProfile()` | Perfil do usuário logado |

## Schemas de Validação (Zod)

Definidos em `src/lib/validations/timesheet.ts`:

| Schema | Usado em |
|---|---|
| `timeEntrySchema` | createEntry |
| `timeEntryUpdateSchema` | updateEntry |
| `timesheetSubmitSchema` | submitTimesheet |
| `approvalSchema` | approveTimesheet, rejectTimesheet |
| `reopenSchema` | reopenTimesheet |
| `dashboardFiltersSchema` | GET /api/dashboard |
