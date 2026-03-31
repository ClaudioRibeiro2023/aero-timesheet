// ============================================================================
// Aero Timesheet — Cliente Supabase (Middleware)
// ============================================================================
// Gerencia refresh de sessão no middleware do Next.js.
// Atualiza cookies de auth automaticamente a cada request.
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Atualiza a sessão do Supabase no middleware.
 * Garante que tokens expirados sejam renovados automaticamente.
 */
export async function updateSession(request: NextRequest) {
  // Cria response inicial que será modificada com cookies atualizados
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          // Atualiza cookies no request (para Server Components downstream)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recria a response com os cookies atualizados
          supabaseResponse = NextResponse.next({
            request,
          });

          // Seta cookies na response (para o browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANTE: Não remover esta chamada.
  // getUser() força o refresh do token se necessário.
  // Sem isso, a sessão pode expirar silenciosamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirecionar para login se não autenticado e tentando acessar área protegida
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isAuthPage && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirecionar para dashboard se já autenticado e tentando acessar login
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
