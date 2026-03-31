// ============================================================================
// Aero Timesheet — OAuth Callback Handler
// ============================================================================
// Processa o callback do Supabase Auth após login via OAuth (Google, etc.).
// Troca o code por uma sessão e redireciona para o dashboard.
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Erro na troca do código — redireciona para login com mensagem
  return NextResponse.redirect(
    `${origin}/login?error=Falha na autenticação. Tente novamente.`
  );
}
