// ============================================================================
// Aero Timesheet — Cliente Supabase Sem Tipagem (Server)
// ============================================================================
// Versão sem generics do Database type para uso em server actions
// onde a inferência de tipos do supabase-js falha.
// Os tipos de retorno são garantidos via casts explícitos nos actions.
// ============================================================================

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria instância do cliente Supabase sem tipagem estrita.
 * Usar quando o Database type não infere corretamente.
 */
export async function createUntypedClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll pode falhar em Server Components (read-only).
          }
        },
      },
    }
  );
}
