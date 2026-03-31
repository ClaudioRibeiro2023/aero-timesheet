"use server";

// ============================================================================
// Aero Timesheet — Server Actions: Dashboard (Wave 2 Backend)
// ============================================================================
// Estatísticas agregadas para o dashboard do usuário.
// Tabelas: ts_timesheet_weeks, ts_timesheet_entries
// ============================================================================

import { createUntypedClient } from "@/lib/supabase/server-untyped";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// Types do Dashboard
// ============================================================================

export interface DashboardStats {
  /** Total de horas no mês corrente */
  total_hours_month: number;
  /** Quantidade de projetos com horas no mês */
  projects_count: number;
  /** Semanas pendentes de aprovação (submitted) */
  pending_weeks: number;
  /** Semanas em rascunho (draft) */
  draft_weeks: number;
  /** Semanas aprovadas no mês */
  approved_weeks: number;
  /** Semanas rejeitadas no mês */
  rejected_weeks: number;
}

// ============================================================================
// Helpers
// ============================================================================

async function getAuthUser() {
  const supabase = await createUntypedClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null };
  }
  return { supabase, user };
}

/**
 * Retorna o primeiro e último dia do mês corrente no formato YYYY-MM-DD.
 */
function getCurrentMonthRange(): { monthStart: string; monthEnd: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const lastDay = new Date(year, month + 1, 0);

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    monthStart: `${year}-${pad(month + 1)}-01`,
    monthEnd: `${year}-${pad(month + 1)}-${pad(lastDay.getDate())}`,
  };
}

// ============================================================================
// getDashboardStats — Estatísticas do mês para o usuário
// ============================================================================

export async function getDashboardStats(): Promise<
  ActionResult<DashboardStats>
> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    const { monthStart, monthEnd } = getCurrentMonthRange();

    // Busca semanas do mês corrente do usuário
    const { data: weeksRaw, error: weeksError } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, status, total_hours")
      .eq("user_id", user.id)
      .gte("week_start", monthStart)
      .lte("week_start", monthEnd);

    if (weeksError) {
      return {
        data: null,
        error: `Erro ao buscar semanas: ${weeksError.message}`,
      };
    }

    const weeksList = (weeksRaw ?? []) as Array<{
      id: string;
      status: string | null;
      total_hours: number | null;
    }>;

    // Calcula total de horas do mês
    const totalHoursMonth = weeksList.reduce(
      (acc, w) => acc + (Number(w.total_hours) || 0),
      0
    );

    // Conta status
    const pendingWeeks = weeksList.filter((w) => w.status === "submitted").length;
    const draftWeeks = weeksList.filter((w) => w.status === "draft").length;
    const approvedWeeks = weeksList.filter((w) => w.status === "approved").length;
    const rejectedWeeks = weeksList.filter((w) => w.status === "rejected").length;

    // Busca projetos distintos com horas no mês
    const weekIds = weeksList.map((w) => w.id);
    let projectsCount = 0;

    if (weekIds.length > 0) {
      const { data: entriesRaw, error: entriesError } = await supabase
        .from("ts_timesheet_entries")
        .select("project_id")
        .in("week_id", weekIds);

      if (!entriesError && entriesRaw) {
        const entries = entriesRaw as Array<{ project_id: string }>;
        const uniqueProjects = new Set(entries.map((e) => e.project_id));
        projectsCount = uniqueProjects.size;
      }
    }

    const stats: DashboardStats = {
      total_hours_month: totalHoursMonth,
      projects_count: projectsCount,
      pending_weeks: pendingWeeks,
      draft_weeks: draftWeeks,
      approved_weeks: approvedWeeks,
      rejected_weeks: rejectedWeeks,
    };

    return { data: stats, error: null };
  } catch (err) {
    console.error("[getDashboardStats]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
