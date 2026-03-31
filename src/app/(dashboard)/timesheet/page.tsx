import Link from "next/link";
import { CalendarClock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getWeeks } from "@/lib/actions/timesheet";
import { formatDate, formatHours } from "@/lib/utils";
import { TimesheetNewWeekButton } from "./TimesheetNewWeekButton";
import type { TimesheetStatus } from "@/lib/types";

// ============================================================================
// Helpers
// ============================================================================

function statusToBadgeVariant(
  status: TimesheetStatus | null
): "draft" | "submitted" | "approved" | "rejected" {
  switch (status) {
    case "submitted":
      return "submitted";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "draft";
  }
}

function weekEndDate(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return formatDate(d);
}

// ============================================================================
// Page
// ============================================================================

export default async function TimesheetPage() {
  const { data: weeks, error } = await getWeeks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Timesheet</h1>
          <p className="text-sm text-surface-400 mt-1">
            Gerencie suas semanas de trabalho
          </p>
        </div>
        <TimesheetNewWeekButton />
      </div>

      {/* Erro */}
      {error && (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Erro ao carregar semanas"
          description={error}
        />
      )}

      {/* Lista vazia */}
      {!error && weeks && weeks.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6" />}
          title="Nenhuma semana registrada"
          description="Crie sua primeira semana para comecar a registrar horas."
          action={<TimesheetNewWeekButton />}
        />
      )}

      {/* Lista de semanas */}
      {weeks && weeks.length > 0 && (
        <div className="space-y-3">
          {weeks.map((week) => (
            <Link key={week.id} href={`/timesheet/${week.id}`}>
              <Card
                variant="elevated"
                className="hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 shrink-0 group-hover:bg-brand-500/30 transition-colors">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-100 group-hover:text-surface-50 transition-colors">
                        Semana de {formatDate(week.week_start)}
                      </p>
                      <p className="text-xs text-surface-400">
                        {formatDate(week.week_start)} ate {weekEndDate(week.week_start)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-surface-200">
                      {formatHours(Number(week.total_hours) || 0)}
                    </span>
                    <Badge variant={statusToBadgeVariant(week.status)} />
                  </div>
                </div>

                {/* Motivo de rejeicao */}
                {week.status === "rejected" && week.rejection_reason && (
                  <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <p className="text-xs text-red-400">
                      <span className="font-medium">Motivo:</span>{" "}
                      {week.rejection_reason}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
