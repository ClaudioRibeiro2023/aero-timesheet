// ============================================================================
// Aero Timesheet — Cliente Supabase (Server)
// ============================================================================
// Cliente para uso em Server Components, Route Handlers e Server Actions.
// Gerencia cookies de sessão via Next.js cookies().
// ============================================================================

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cria instância do cliente Supabase para o servidor.
 * Deve ser chamado dentro de Server Components ou Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // Isso é esperado — o middleware cuida da atualização.
          }
        },
      },
    }
  );
}
