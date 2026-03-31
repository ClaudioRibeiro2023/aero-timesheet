// ============================================================================
// Aero Timesheet — Tipos do Banco de Dados (Supabase)
// ============================================================================

/** Cargos disponíveis no sistema */
export type UserRole = "colaborador" | "gestor" | "administrador";

/** Categorias de horas trabalhadas */
export type TimesheetCategory = "regular" | "hora_extra" | "viagem" | "treinamento";

/** Status do timesheet semanal */
export type TimesheetStatus = "rascunho" | "submetido" | "aprovado" | "rejeitado";

/** Dias da semana (seg-dom) */
export type DayOfWeek = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

// ============================================================================
// Entidades principais
// ============================================================================

/** Perfil do usuário (extends Supabase Auth) */
export interface Profile {
  id: string; // UUID, FK para auth.users
  email: string;
  nome_completo: string;
  cargo: UserRole;
  departamento: string;
  gestor_id: string | null; // UUID do gestor direto
  ativo: boolean;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string;
}

/** Projeto / Contrato onde horas são alocadas */
export interface Project {
  id: string; // UUID
  codigo: string; // Ex: "AER-2026-001"
  nome: string;
  cliente: string;
  descricao: string | null;
  ativo: boolean;
  orcamento_horas: number | null; // Total de horas orçadas
  data_inicio: string; // ISO date
  data_fim: string | null;
  created_at: string;
  updated_at: string;
}

/** Cabeçalho do timesheet semanal */
export interface TimesheetWeek {
  id: string; // UUID
  user_id: string; // FK Profile
  semana_inicio: string; // ISO date (segunda-feira)
  semana_fim: string; // ISO date (domingo)
  status: TimesheetStatus;
  total_horas: number; // Soma calculada
  observacoes: string | null;
  submetido_em: string | null;
  aprovado_por: string | null; // FK Profile (gestor)
  aprovado_em: string | null;
  motivo_rejeicao: string | null;
  created_at: string;
  updated_at: string;
}

/** Linha individual de lançamento de horas */
export interface TimesheetEntry {
  id: string; // UUID
  timesheet_week_id: string; // FK TimesheetWeek
  project_id: string; // FK Project
  categoria: TimesheetCategory;
  descricao: string | null;
  // Horas por dia da semana
  horas_seg: number;
  horas_ter: number;
  horas_qua: number;
  horas_qui: number;
  horas_sex: number;
  horas_sab: number;
  horas_dom: number;
  total_linha: number; // Soma seg-dom
  created_at: string;
  updated_at: string;
}

/** Log de aprovações / rejeições */
export interface ApprovalLog {
  id: string; // UUID
  timesheet_week_id: string; // FK TimesheetWeek
  acao: "submetido" | "aprovado" | "rejeitado" | "reaberto";
  realizado_por: string; // FK Profile
  comentario: string | null;
  created_at: string;
}

// ============================================================================
// Views / Agregações (para dashboard)
// ============================================================================

/** Resumo de horas por projeto */
export interface HorasPorProjeto {
  project_id: string;
  projeto_nome: string;
  projeto_codigo: string;
  cliente: string;
  total_horas: number;
  horas_regular: number;
  horas_extra: number;
  horas_viagem: number;
  horas_treinamento: number;
}

/** Resumo de horas por colaborador */
export interface HorasPorColaborador {
  user_id: string;
  nome_completo: string;
  departamento: string;
  total_horas: number;
  semanas_submetidas: number;
  semanas_aprovadas: number;
  semanas_pendentes: number;
}

/** Resumo semanal geral */
export interface ResumoSemanal {
  semana_inicio: string;
  total_colaboradores: number;
  total_horas: number;
  timesheets_submetidos: number;
  timesheets_aprovados: number;
  timesheets_rejeitados: number;
  timesheets_rascunho: number;
}

// ============================================================================
// DTOs (Data Transfer Objects) para formulários
// ============================================================================

/** Payload para criar/atualizar entrada de timesheet */
export interface TimesheetEntryInput {
  project_id: string;
  categoria: TimesheetCategory;
  descricao?: string;
  horas_seg: number;
  horas_ter: number;
  horas_qua: number;
  horas_qui: number;
  horas_sex: number;
  horas_sab: number;
  horas_dom: number;
}

/** Payload para submeter timesheet da semana */
export interface SubmitTimesheetInput {
  semana_inicio: string; // YYYY-MM-DD (segunda)
  entries: TimesheetEntryInput[];
  observacoes?: string;
}

/** Payload de ação do gestor */
export interface ApprovalActionInput {
  timesheet_week_id: string;
  acao: "aprovado" | "rejeitado";
  comentario?: string;
}

/** Filtros para o dashboard */
export interface DashboardFilters {
  periodo_inicio?: string;
  periodo_fim?: string;
  project_id?: string;
  user_id?: string;
  departamento?: string;
  status?: TimesheetStatus;
}

// ============================================================================
// Tipagem do Supabase (schema helper)
// ============================================================================
// Usa tipos gerados automaticamente via `supabase gen types typescript`
// para compatibilidade total com @supabase/supabase-js v2.100+.
// ============================================================================

export type { Database } from "@/types/supabase";
