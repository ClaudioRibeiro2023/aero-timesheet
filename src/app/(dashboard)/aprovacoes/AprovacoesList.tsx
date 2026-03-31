"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { approveWeek, rejectWeek } from "@/lib/actions/approval";
import { formatDate, formatHours } from "@/lib/utils";
import type { TsTimesheetWeek } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface AprovacoesListProps {
  weeks: TsTimesheetWeek[];
}

// ============================================================================
// Component
// ============================================================================

export function AprovacoesList({ weeks }: AprovacoesListProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-surface-400">
        {weeks.length} semana{weeks.length !== 1 ? "s" : ""} pendente
        {weeks.length !== 1 ? "s" : ""} de aprovacao
      </p>

      {weeks.map((week) => (
        <ApprovalItem key={week.id} week={week} />
      ))}
    </div>
  );
}

// ============================================================================
// Approval Item
// ============================================================================

function ApprovalItem({ week }: { week: TsTimesheetWeek }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  function weekEndDate(weekStart: string): string {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + 6);
    return formatDate(d);
  }

  async function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveWeek(week.id, comment || undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActionDone("approved");
      router.refresh();
    });
  }

  async function handleReject() {
    setError(null);
    if (!comment.trim()) {
      setError("Informe o motivo da rejeicao.");
      return;
    }
    startTransition(async () => {
      const result = await rejectWeek(week.id, comment);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActionDone("rejected");
      router.refresh();
    });
  }

  if (actionDone) {
    return (
      <Card variant="elevated" className="opacity-60">
        <div className="flex items-center gap-3">
          {actionDone === "approved" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
          <span className="text-sm text-surface-300">
            Semana {actionDone === "approved" ? "aprovada" : "rejeitada"} com sucesso.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-100">
              {week.user_id.slice(0, 8)}...
            </p>
            <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(week.week_start)} - {weekEndDate(week.week_start)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-surface-200 font-medium">
                  {formatHours(Number(week.total_hours) || 0)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <Badge variant="submitted" />
      </div>

      {/* Acoes */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario (obrigatorio para rejeicao)..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-surface-50 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          rows={2}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            loading={isPending}
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            Aprovar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReject}
            loading={isPending}
            disabled={!comment.trim()}
            icon={<XCircle className="h-4 w-4" />}
          >
            Rejeitar
          </Button>
        </div>
      </div>
    </Card>
  );
}
