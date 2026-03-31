// ============================================================================
// Aero Timesheet — Types do Banco + Zod Schemas (Wave 2 Backend)
// ============================================================================
// Types alinhados ao schema REAL do Supabase (tabelas ts_*).
// Enums: timesheet_status_enum (draft/submitted/approved/rejected)
//        approval_action_enum (submitted/approved/rejected)
// ============================================================================

import { z } from "zod";

// ============================================================================
// Enums do Banco
// ============================================================================

export const TimesheetStatusEnum = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
]);
export type TimesheetStatus = z.infer<typeof TimesheetStatusEnum>;

export const ApprovalActionEnum = z.enum([
  "submitted",
  "approved",
  "rejected",
]);
export type ApprovalAction = z.infer<typeof ApprovalActionEnum>;

// ============================================================================
// Entidades do Banco (Row types)
// ============================================================================

/** ts_projects — Projetos onde horas são alocadas */
export interface TsProject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

/** ts_activity_categories — Categorias de atividade */
export interface TsActivityCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

/** ts_timesheet_weeks — Semana de timesheet (cabeçalho) */
export interface TsTimesheetWeek {
  id: string;
  user_id: string;
  week_start: string; // date (YYYY-MM-DD, segunda-feira)
  status: TimesheetStatus | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  total_hours: number | null;
  created_at: string | null;
  updated_at: string | null;
}

/** ts_timesheet_entries — Lançamento individual de horas */
export interface TsTimesheetEntry {
  id: string;
  week_id: string;
  project_id: string;
  category_id: string;
  day_of_week: number; // 0=seg, 1=ter, ..., 6=dom
  hours: number;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** ts_approval_log — Log de ações de aprovação */
export interface TsApprovalLog {
  id: string;
  week_id: string;
  action: ApprovalAction;
  actor_id: string;
  comment: string | null;
  created_at: string | null;
}

// ============================================================================
// Types compostos (para queries com joins)
// ============================================================================

/** Semana com suas entries */
export interface TsWeekWithEntries extends TsTimesheetWeek {
  entries: TsTimesheetEntry[];
}

/** Entry com dados do projeto e categoria */
export interface TsEntryWithRelations extends TsTimesheetEntry {
  project: TsProject | null;
  category: TsActivityCategory | null;
}

/** Semana com entries + relações completas */
export interface TsWeekFull extends TsTimesheetWeek {
  entries: TsEntryWithRelations[];
}

// ============================================================================
// Tipos de retorno padrão (ActionResult)
// ============================================================================

export interface ActionResult<T = unknown> {
  data: T | null;
  error: string | null;
}

// ============================================================================
// Zod Schemas — Validação de inputs
// ============================================================================

/** UUID v4 reusável */
const uuidSchema = z
  .string({ required_error: "ID é obrigatório" })
  .uuid("ID inválido");

// ---------------------------------------------------------------------------
// createWeek
// ---------------------------------------------------------------------------

export const createWeekSchema = z.object({
  week_start: z
    .string({ required_error: "Data de início da semana é obrigatória" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Data deve estar no formato YYYY-MM-DD"
    )
    .refine(
      (dateStr) => {
        const d = new Date(dateStr + "T00:00:00");
        // getDay(): 0=dom, 1=seg
        return d.getDay() === 1;
      },
      { message: "A data deve ser uma segunda-feira" }
    ),
});

export type CreateWeekInput = z.infer<typeof createWeekSchema>;

// ---------------------------------------------------------------------------
// upsertEntry
// ---------------------------------------------------------------------------

export const upsertEntrySchema = z.object({
  id: uuidSchema.optional(), // se presente, update; senão, insert
  week_id: uuidSchema,
  project_id: uuidSchema,
  category_id: uuidSchema,
  day_of_week: z
    .number({ required_error: "Dia da semana é obrigatório" })
    .int("Dia da semana deve ser inteiro")
    .min(0, "Dia da semana mínimo é 0 (segunda)")
    .max(6, "Dia da semana máximo é 6 (domingo)"),
  hours: z
    .number({ required_error: "Horas é obrigatório" })
    .min(0, "Horas não pode ser negativo")
    .max(24, "Máximo de 24 horas por dia")
    .multipleOf(0.25, "Horas deve ser múltiplo de 15 minutos (0.25)"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
});

export type UpsertEntryInput = z.infer<typeof upsertEntrySchema>;

// ---------------------------------------------------------------------------
// deleteEntry
// ---------------------------------------------------------------------------

export const deleteEntrySchema = z.object({
  entry_id: uuidSchema,
});

export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>;

// ---------------------------------------------------------------------------
// submitWeek
// ---------------------------------------------------------------------------

export const submitWeekSchema = z.object({
  week_id: uuidSchema,
});

export type SubmitWeekInput = z.infer<typeof submitWeekSchema>;

// ---------------------------------------------------------------------------
// approveWeek
// ---------------------------------------------------------------------------

export const approveWeekSchema = z.object({
  week_id: uuidSchema,
  comment: z
    .string()
    .max(1000, "Comentário deve ter no máximo 1.000 caracteres")
    .optional()
    .nullable(),
});

export type ApproveWeekInput = z.infer<typeof approveWeekSchema>;

// ---------------------------------------------------------------------------
// rejectWeek
// ---------------------------------------------------------------------------

export const rejectWeekSchema = z.object({
  week_id: uuidSchema,
  reason: z
    .string({ required_error: "Motivo da rejeição é obrigatório" })
    .min(1, "Motivo da rejeição não pode ser vazio")
    .max(1000, "Motivo deve ter no máximo 1.000 caracteres"),
});

export type RejectWeekInput = z.infer<typeof rejectWeekSchema>;
