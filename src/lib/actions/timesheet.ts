"use server";

// ============================================================================
// Aero Timesheet — Server Actions: Timesheet (Wave 2 Backend)
// ============================================================================
// CRUD de semanas e entries. Valida inputs com Zod, retorna { data, error }.
// Tabelas: ts_timesheet_weeks, ts_timesheet_entries, ts_approval_log
// ============================================================================

import { revalidatePath } from "next/cache";
import { createUntypedClient } from "@/lib/supabase/server-untyped";
import {
  createWeekSchema,
  upsertEntrySchema,
  deleteEntrySchema,
  submitWeekSchema,
  type ActionResult,
  type TsTimesheetWeek,
  type TsTimesheetEntry,
  type TsWeekFull,
  type TsEntryWithRelations,
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
// getWeeks — Listar semanas do usuário
// ============================================================================

export async function getWeeks(): Promise<ActionResult<TsTimesheetWeek[]>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false });

    if (error) {
      return { data: null, error: `Erro ao listar semanas: ${error.message}` };
    }

    return { data: data as TsTimesheetWeek[], error: null };
  } catch (err) {
    console.error("[getWeeks]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// getWeekWithEntries — Semana com entries + relações
// ============================================================================

export async function getWeekWithEntries(
  weekId: string
): Promise<ActionResult<TsWeekFull>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Busca a semana
    const { data: week, error: weekError } = await supabase
      .from("ts_timesheet_weeks")
      .select("*")
      .eq("id", weekId)
      .single();

    if (weekError || !week) {
      return { data: null, error: "Semana não encontrada" };
    }

    const weekData = week as TsTimesheetWeek;

    // Verifica que pertence ao usuário
    if (weekData.user_id !== user.id) {
      return { data: null, error: "Sem permissão para acessar esta semana" };
    }

    // Busca entries com joins em projeto e categoria
    const { data: entries, error: entriesError } = await supabase
      .from("ts_timesheet_entries")
      .select(
        `
        *,
        project:project_id ( id, name, code, description, color, is_active, created_at ),
        category:category_id ( id, name, description, is_active, created_at )
      `
      )
      .eq("week_id", weekId)
      .order("day_of_week", { ascending: true });

    if (entriesError) {
      return {
        data: null,
        error: `Erro ao buscar lançamentos: ${entriesError.message}`,
      };
    }

    const result: TsWeekFull = {
      ...weekData,
      entries: (entries ?? []) as TsEntryWithRelations[],
    };

    return { data: result, error: null };
  } catch (err) {
    console.error("[getWeekWithEntries]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// createWeek — Criar nova semana em draft
// ============================================================================

export async function createWeek(
  weekStart: string
): Promise<ActionResult<TsTimesheetWeek>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = createWeekSchema.safeParse({ week_start: weekStart });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    // Verifica se já existe semana para esse usuário nesta data
    const { data: existing } = await supabase
      .from("ts_timesheet_weeks")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", parsed.data.week_start)
      .maybeSingle();

    if (existing) {
      return { data: null, error: "Já existe um timesheet para esta semana" };
    }

    // Cria semana com status draft
    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .insert({
        user_id: user.id,
        week_start: parsed.data.week_start,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: `Erro ao criar semana: ${error.message}` };
    }

    revalidatePath("/timesheet");
    return { data: data as TsTimesheetWeek, error: null };
  } catch (err) {
    console.error("[createWeek]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// upsertEntry — Criar ou atualizar entry
// ============================================================================

export async function upsertEntry(
  input: unknown
): Promise<ActionResult<TsTimesheetEntry>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = upsertEntrySchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    const { id, week_id, project_id, category_id, day_of_week, hours, description } =
      parsed.data;

    // Verifica que a semana pertence ao usuário e está em draft
    const { data: weekRaw, error: weekError } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, user_id, status")
      .eq("id", week_id)
      .single();

    if (weekError || !weekRaw) {
      return { data: null, error: "Semana não encontrada" };
    }

    const week = weekRaw as { id: string; user_id: string; status: string };

    if (week.user_id !== user.id) {
      return { data: null, error: "Sem permissão para editar esta semana" };
    }

    if (week.status !== "draft") {
      return {
        data: null,
        error: "Só é possível editar semanas em rascunho (draft)",
      };
    }

    let result;

    if (id) {
      // UPDATE — verifica que a entry pertence a esta semana
      const { data: existingEntry } = await supabase
        .from("ts_timesheet_entries")
        .select("id, week_id")
        .eq("id", id)
        .single();

      const entry = existingEntry as { id: string; week_id: string } | null;
      if (!entry || entry.week_id !== week_id) {
        return { data: null, error: "Lançamento não encontrado nesta semana" };
      }

      const { data, error } = await supabase
        .from("ts_timesheet_entries")
        .update({
          project_id,
          category_id,
          day_of_week,
          hours,
          description: description ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: `Erro ao atualizar lançamento: ${error.message}`,
        };
      }
      result = data;
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("ts_timesheet_entries")
        .insert({
          week_id,
          project_id,
          category_id,
          day_of_week,
          hours,
          description: description ?? null,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: `Erro ao criar lançamento: ${error.message}`,
        };
      }
      result = data;
    }

    revalidatePath("/timesheet");
    return { data: result as TsTimesheetEntry, error: null };
  } catch (err) {
    console.error("[upsertEntry]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// deleteEntry — Deletar entry
// ============================================================================

export async function deleteEntry(
  entryId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = deleteEntrySchema.safeParse({ entry_id: entryId });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    // Busca entry para verificar permissão
    const { data: entryRaw, error: entryError } = await supabase
      .from("ts_timesheet_entries")
      .select("id, week_id")
      .eq("id", parsed.data.entry_id)
      .single();

    if (entryError || !entryRaw) {
      return { data: null, error: "Lançamento não encontrado" };
    }

    const entry = entryRaw as { id: string; week_id: string };

    // Verifica que a semana pertence ao usuário e está em draft
    const { data: weekRaw } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, user_id, status")
      .eq("id", entry.week_id)
      .single();

    const week = weekRaw as { id: string; user_id: string; status: string } | null;

    if (!week || week.user_id !== user.id) {
      return { data: null, error: "Sem permissão para excluir este lançamento" };
    }

    if (week.status !== "draft") {
      return {
        data: null,
        error: "Só é possível excluir lançamentos de semanas em rascunho (draft)",
      };
    }

    const { error: deleteError } = await supabase
      .from("ts_timesheet_entries")
      .delete()
      .eq("id", parsed.data.entry_id);

    if (deleteError) {
      return {
        data: null,
        error: `Erro ao excluir lançamento: ${deleteError.message}`,
      };
    }

    revalidatePath("/timesheet");
    return { data: { deleted: true }, error: null };
  } catch (err) {
    console.error("[deleteEntry]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// submitWeek — Submeter semana para aprovação (draft → submitted)
// ============================================================================

export async function submitWeek(
  weekId: string
): Promise<ActionResult<TsTimesheetWeek>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    // Validação Zod
    const parsed = submitWeekSchema.safeParse({ week_id: weekId });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Dados inválidos";
      return { data: null, error: msg };
    }

    // Verifica que a semana pertence ao usuário e está em draft
    const { data: weekRaw, error: weekError } = await supabase
      .from("ts_timesheet_weeks")
      .select("id, user_id, status")
      .eq("id", parsed.data.week_id)
      .single();

    if (weekError || !weekRaw) {
      return { data: null, error: "Semana não encontrada" };
    }

    const week = weekRaw as { id: string; user_id: string; status: string };

    if (week.user_id !== user.id) {
      return { data: null, error: "Sem permissão para submeter esta semana" };
    }

    if (week.status !== "draft") {
      return {
        data: null,
        error: "Só é possível submeter semanas em rascunho (draft)",
      };
    }

    // Verifica que tem pelo menos uma entry
    const { count } = await supabase
      .from("ts_timesheet_entries")
      .select("id", { count: "exact", head: true })
      .eq("week_id", parsed.data.week_id);

    if (!count || count === 0) {
      return {
        data: null,
        error: "Adicione pelo menos um lançamento antes de submeter",
      };
    }

    // Atualiza status para submitted
    const { data, error } = await supabase
      .from("ts_timesheet_weeks")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
      })
      .eq("id", parsed.data.week_id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Erro ao submeter semana: ${error.message}`,
      };
    }

    // Registra no log de aprovação
    await supabase.from("ts_approval_log").insert({
      week_id: parsed.data.week_id,
      action: "submitted",
      actor_id: user.id,
      comment: null,
    });

    revalidatePath("/timesheet");
    revalidatePath("/aprovacoes");
    return { data: data as TsTimesheetWeek, error: null };
  } catch (err) {
    console.error("[submitWeek]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
