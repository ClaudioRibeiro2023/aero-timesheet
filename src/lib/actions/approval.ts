"use server";

// ============================================================================
// Aero Timesheet — Server Actions: Aprovação (Wave 2 Backend)
// ============================================================================
// Fluxo de aprovação do gestor: listar pendentes, aprovar, rejeitar.
// Tabelas: ts_timesheet_weeks, ts_approval_log
// ============================================================================

import { revalidatePath } from "next/cache";
import { createUntypedClient } from "@/lib/supabase/server-untyped";
import {
  approveWeekSchema,
  rejectWeekSchema,
  type ActionResult,
  type TsTimesheetWeek,
} from "@/lib/types";

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

// ============================================================================
// getPendingApprovals — Listar semanas submetidas (para gestor)
// ============================================================================

export async function getPendingApprovals(): Promise<
  ActionResult<TsTimesheetWeek[]>
> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .select("*")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: true });

    if (error) {
      return {
        data: null,
        error: `Erro ao listar aprovações pendentes: ${error.message}`,
      };
    }

    return { data: data as TsTimesheetWeek[], error: null };
  } catch (err) {
    console.error("[getPendingApprovals]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// approveWeek — Aprovar semana (submitted → approved)
// ============================================================================

export async function approveWeek(
  weekId: string,
  comment?: string
): Promise<ActionResult<TsTimesheetWeek>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = approveWeekSchema.safeParse({
      week_id: weekId,
      comment: comment ?? null,
    });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    // Verifica que a semana está submitted
    const { data: weekRaw, error: weekError } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, user_id, status")
      .eq("id", parsed.data.week_id)
      .single();

    if (weekError || !weekRaw) {
      return { data: null, error: "Semana não encontrada" };
    }

    const week = weekRaw as { id: string; user_id: string; status: string };

    if (week.status !== "submitted") {
      return {
        data: null,
        error: "Só é possível aprovar semanas submetidas",
      };
    }

    if (week.user_id === user.id) {
      return {
        data: null,
        error: "Você não pode aprovar seu próprio timesheet",
      };
    }

    // Atualiza status para approved
    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.week_id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Erro ao aprovar semana: ${error.message}`,
      };
    }

    // Registra no log de aprovação
    await supabase.from("ts_approval_log").insert({
      week_id: parsed.data.week_id,
      action: "approved",
      actor_id: user.id,
      comment: parsed.data.comment ?? null,
    });

    revalidatePath("/timesheet");
    revalidatePath("/aprovacoes");
    revalidatePath("/dashboard");
    return { data: data as TsTimesheetWeek, error: null };
  } catch (err) {
    console.error("[approveWeek]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// rejectWeek — Rejeitar semana (submitted → rejected)
// ============================================================================

export async function rejectWeek(
  weekId: string,
  reason: string
): Promise<ActionResult<TsTimesheetWeek>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = rejectWeekSchema.safeParse({
      week_id: weekId,
      reason,
    });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    // Verifica que a semana está submitted
    const { data: weekRaw, error: weekError } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, user_id, status")
      .eq("id", parsed.data.week_id)
      .single();

    if (weekError || !weekRaw) {
      return { data: null, error: "Semana não encontrada" };
    }

    const week = weekRaw as { id: string; user_id: string; status: string };

    if (week.status !== "submitted") {
      return {
        data: null,
        error: "Só é possível rejeitar semanas submetidas",
      };
    }

    if (week.user_id === user.id) {
      return {
        data: null,
        error: "Você não pode rejeitar seu próprio timesheet",
      };
    }

    // Atualiza status para rejected
    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .update({
        status: "rejected",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: parsed.data.reason,
      })
      .eq("id", parsed.data.week_id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Erro ao rejeitar semana: ${error.message}`,
      };
    }

    // Registra no log de aprovação
    await supabase.from("ts_approval_log").insert({
      week_id: parsed.data.week_id,
      action: "rejected",
      actor_id: user.id,
      comment: parsed.data.reason,
    });

    revalidatePath("/timesheet");
    revalidatePath("/aprovacoes");
    revalidatePath("/dashboard");
    return { data: data as TsTimesheetWeek, error: null };
  } catch (err) {
    console.error("[rejectWeek]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
