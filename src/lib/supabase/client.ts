// ============================================================================
// Aero Timesheet — Cliente Supabase (Browser)
// ============================================================================
// Cliente para uso em componentes client-side (React).
// Utiliza createBrowserClient do @supabase/ssr.
// ============================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Cria instância do cliente Supabase para o browser.
 * Reutiliza a mesma instância via singleton implícito do @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
