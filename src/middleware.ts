// ============================================================================
// Aero Timesheet — Next.js Middleware
// ============================================================================
// Ponto de entrada do middleware. Delega para o handler do Supabase
// que gerencia refresh de sessão e proteção de rotas.
// ============================================================================

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Matcher: todas as rotas EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do browser)
     * - Arquivos de imagem públicos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
