// ============================================================================
// Aero Timesheet — Schemas de Validação (Zod)
// ============================================================================
// Validação de entrada para todas as operações de timesheet.
// Mensagens de erro em português para exibição direta na UI.
// ============================================================================

import { z } from "zod";

// ============================================================================
// Helpers
// ============================================================================

/** Valida um campo de horas (0-24, incrementos de 0.25) */
const horasSchema = z
  .number({
    required_error: "Informe as horas",
    invalid_type_error: "Horas deve ser um número",
  })
  .min(0, "Horas não pode ser negativo")
  .max(24, "Máximo de 24 horas por dia")
  .multipleOf(0.25, "Horas deve ser múltiplo de 15 minutos (0.25)");

/** UUID v4 */
const uuidSchema = z
  .string({ required_error: "ID é obrigatório" })
  .uuid("ID inválido");

// ============================================================================
// Lançamento de Horas (Time Entry)
// ============================================================================

/** Schema para criar/atualizar uma linha de lançamento */
export const timeEntrySchema = z
  .object({
    project_id: uuidSchema.describe("Projeto"),
    categoria: z.enum(["regular", "hora_extra", "viagem", "treinamento"], {
      required_error: "Selecione uma categoria",
      invalid_type_error: "Categoria inválida",
    }),
    descricao: z
      .string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .optional()
      .nullable(),
    horas_seg: horasSchema.default(0),
    horas_ter: horasSchema.default(0),
    horas_qua: horasSchema.default(0),
    horas_qui: horasSchema.default(0),
    horas_sex: horasSchema.default(0),
    horas_sab: horasSchema.default(0),
    horas_dom: horasSchema.default(0),
  })
  .refine(
    (data) => {
      const total =
        data.horas_seg +
        data.horas_ter +
        data.horas_qua +
        data.horas_qui +
        data.horas_sex +
        data.horas_sab +
        data.horas_dom;
      return total > 0;
    },
    {
      message: "Informe pelo menos uma hora em algum dia da semana",
      path: ["horas_seg"],
    }
  );

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

// ============================================================================
// Atualização de Entry (parcial)
// ============================================================================

/** Schema para atualizar parcialmente uma entry */
export const timeEntryUpdateSchema = z.object({
  project_id: uuidSchema.optional(),
  categoria: z
    .enum(["regular", "hora_extra", "viagem", "treinamento"])
    .optional(),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
  horas_seg: horasSchema.optional(),
  horas_ter: horasSchema.optional(),
  horas_qua: horasSchema.optional(),
  horas_qui: horasSchema.optional(),
  horas_sex: horasSchema.optional(),
  horas_sab: horasSchema.optional(),
  horas_dom: horasSchema.optional(),
});

export type TimeEntryUpdateInput = z.infer<typeof timeEntryUpdateSchema>;

// ============================================================================
// Submissão de Timesheet
// ============================================================================

/** Schema para submeter o timesheet semanal */
export const timesheetSubmitSchema = z.object({
  timesheet_week_id: uuidSchema.describe("ID do timesheet"),
  observacoes: z
    .string()
    .max(1000, "Observações devem ter no máximo 1.000 caracteres")
    .optional()
    .nullable(),
});

export type TimesheetSubmitInput = z.infer<typeof timesheetSubmitSchema>;

// ============================================================================
// Aprovação / Rejeição
// ============================================================================

/** Schema para ação do gestor (aprovar ou rejeitar) */
export const approvalSchema = z
  .object({
    timesheet_week_id: uuidSchema.describe("ID do timesheet"),
    acao: z.enum(["aprovado", "rejeitado"], {
      required_error: "Selecione uma ação",
      invalid_type_error: "Ação deve ser 'aprovado' ou 'rejeitado'",
    }),
    comentario: z
      .string()
      .max(1000, "Comentário deve ter no máximo 1.000 caracteres")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Rejeição exige comentário
      if (data.acao === "rejeitado") {
        return data.comentario && data.comentario.trim().length > 0;
      }
      return true;
    },
    {
      message: "Informe o motivo da rejeição",
      path: ["comentario"],
    }
  );

export type ApprovalInput = z.infer<typeof approvalSchema>;

// ============================================================================
// Reabertura
// ============================================================================

/** Schema para reabrir um timesheet */
export const reopenSchema = z.object({
  timesheet_week_id: uuidSchema.describe("ID do timesheet"),
  comentario: z
    .string()
    .max(1000, "Comentário deve ter no máximo 1.000 caracteres")
    .optional()
    .nullable(),
});

export type ReopenInput = z.infer<typeof reopenSchema>;

// ============================================================================
// Filtros do Dashboard
// ============================================================================

/** Schema para filtros de consulta do dashboard */
export const dashboardFiltersSchema = z.object({
  periodo_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  periodo_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  project_id: z.string().uuid("ID de projeto inválido").optional(),
  user_id: z.string().uuid("ID de usuário inválido").optional(),
  departamento: z.string().optional(),
  status: z
    .enum(["rascunho", "submetido", "aprovado", "rejeitado"])
    .optional(),
});

export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;

// ============================================================================
// Helpers de Parsing
// ============================================================================

/**
 * Extrai dados de timeEntry a partir de FormData.
 * Converte campos de horas de string para number.
 */
export function parseTimeEntryFormData(formData: FormData): unknown {
  return {
    project_id: formData.get("project_id"),
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao") || null,
    horas_seg: Number(formData.get("horas_seg") ?? 0),
    horas_ter: Number(formData.get("horas_ter") ?? 0),
    horas_qua: Number(formData.get("horas_qua") ?? 0),
    horas_qui: Number(formData.get("horas_qui") ?? 0),
    horas_sex: Number(formData.get("horas_sex") ?? 0),
    horas_sab: Number(formData.get("horas_sab") ?? 0),
    horas_dom: Number(formData.get("horas_dom") ?? 0),
  };
}
