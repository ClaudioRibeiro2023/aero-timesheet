"use server";

// ============================================================================
// Aero Timesheet — Server Actions: Projetos e Categorias (Wave 2 Backend)
// ============================================================================
// Leitura de projetos e categorias ativas para uso em selects/dropdowns.
// Tabelas: ts_projects, ts_activity_categories
// ============================================================================

import { createUntypedClient } from "@/lib/supabase/server-untyped";
import type {
  ActionResult,
  TsProject,
  TsActivityCategory,
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
// getProjects — Listar projetos ativos
// ============================================================================

export async function getProjects(): Promise<ActionResult<TsProject[]>> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    const { data, error } = await supabase
      .from("ts_projects")
      .select("id, name, code, description, color, is_active, created_at")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return {
        data: null,
        error: `Erro ao listar projetos: ${error.message}`,
      };
    }

    return { data: data as TsProject[], error: null };
  } catch (err) {
    console.error("[getProjects]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

// ============================================================================
// getCategories — Listar categorias de atividade ativas
// ============================================================================

export async function getCategories(): Promise<
  ActionResult<TsActivityCategory[]>
> {
  try {
    const { supabase, user } = await getAuthUser();
    if (!supabase || !user) {
      return { data: null, error: "Usuário não autenticado" };
    }

    const { data, error } = await supabase
      .from("ts_activity_categories")
      .select("id, name, description, is_active, created_at")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return {
        data: null,
        error: `Erro ao listar categorias: ${error.message}`,
      };
    }

    return { data: data as TsActivityCategory[], error: null };
  } catch (err) {
    console.error("[getCategories]", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
