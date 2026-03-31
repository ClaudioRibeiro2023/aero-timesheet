// ============================================================================
// Aero Timesheet — API Route: Health Check
// ============================================================================
// GET /api/health — Verifica status da aplicação e conexão com banco.
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APP_VERSION = "1.0.0";

export async function GET() {
  const startTime = Date.now();

  let dbStatus: "connected" | "error" = "error";
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const supabase = await createClient();

    // Testa conexão com o banco via query simples
    const dbStart = Date.now();
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);

    dbLatencyMs = Date.now() - dbStart;

    if (error) {
      dbError = error.message;
    } else {
      dbStatus = "connected";
    }
  } catch (err) {
    dbError =
      err instanceof Error ? err.message : "Falha ao conectar com o banco";
  }

  const totalLatencyMs = Date.now() - startTime;
  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "saudável" : "degradado",
      versao: APP_VERSION,
      timestamp: new Date().toISOString(),
      latencia_total_ms: totalLatencyMs,
      servicos: {
        banco_de_dados: {
          status: dbStatus,
          latencia_ms: dbLatencyMs,
          ...(dbError && { erro: dbError }),
        },
      },
      ambiente: process.env.NODE_ENV ?? "development",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
