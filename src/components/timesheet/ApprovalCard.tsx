"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  TimesheetWeek,
  TimesheetEntry,
  TimesheetCategory,
  TimesheetStatus,
} from "@/types/database";

// ============================================================================
// Tipos
// ============================================================================

interface ApprovalCardProps {
  timesheet: TimesheetWeek & {
    profile: { nome_completo: string; departamento: string; avatar_url: string | null };
    entries: (TimesheetEntry & { project: { codigo: string; nome: string } })[];
  };
  onApprove: (id: string, comment: string) => Promise<void>;
  onReject: (id: string, comment: string) => Promise<void>;
}

// ============================================================================
// Helpers
// ============================================================================

const STATUS_MAP: Record<TimesheetStatus, "draft" | "submitted" | "approved" | "rejected"> = {
  rascunho: "draft",
  submetido: "submitted",
  aprovado: "approved",
  rejeitado: "rejected",
};

const CATEGORY_LABELS: Record<TimesheetCategory, string> = {
  regular: "Regular",
  hora_extra: "Hora Extra",
  viagem: "Viagem",
  treinamento: "Treinamento",
};

const DAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

function formatWeekRange(inicio: string, fim: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  return `${fmt(inicio)} — ${fmt(fim)}`;
}

function categoryHours(entries: TimesheetEntry[]): Record<TimesheetCategory, number> {
  const result: Record<TimesheetCategory, number> = {
    regular: 0,
    hora_extra: 0,
    viagem: 0,
    treinamento: 0,
  };
  entries.forEach((e) => {
    result[e.categoria] += e.total_linha;
  });
  return result;
}

// ============================================================================
// Componente
// ============================================================================

export function ApprovalCard({ timesheet, onApprove, onReject }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const catHours = categoryHours(timesheet.entries);
  const isActionable = timesheet.status === "submetido";

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await onApprove(timesheet.id, comment);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await onReject(timesheet.id, comment);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Cabecalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-100">
              {timesheet.profile.nome_completo}
            </h4>
            <p className="text-xs text-surface-400">
              {timesheet.profile.departamento}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={STATUS_MAP[timesheet.status]} />
        </div>
      </div>

      {/* Info resumida */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatWeekRange(timesheet.semana_inicio, timesheet.semana_fim)}
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-surface-200 font-semibold">{timesheet.total_horas}h</span> total
        </div>
        {Object.entries(catHours)
          .filter(([, h]) => h > 0)
          .map(([cat, h]) => (
            <div key={cat} className="text-xs text-surface-400">
              {CATEGORY_LABELS[cat as TimesheetCategory]}: {" "}
              <span className="text-surface-200 font-medium">{h}h</span>
            </div>
          ))}
      </div>

      {/* Detalhes expandiveis */}
      <div className="mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? "Recolher detalhes" : "Ver detalhes diários"}
        </button>

        {expanded && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-surface-400 font-medium">
                    Projeto
                  </th>
                  <th className="text-left py-2 px-2 text-surface-400 font-medium">
                    Categoria
                  </th>
                  {DAYS_PT.map((d) => (
                    <th key={d} className="text-center py-2 px-1 text-surface-400 font-medium">
                      {d}
                    </th>
                  ))}
                  <th className="text-center py-2 px-2 text-surface-300 font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheet.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5">
                    <td className="py-2 px-2 text-surface-200">
                      {entry.project.codigo}
                    </td>
                    <td className="py-2 px-2 text-surface-400">
                      {CATEGORY_LABELS[entry.categoria]}
                    </td>
                    {[
                      entry.horas_seg,
                      entry.horas_ter,
                      entry.horas_qua,
                      entry.horas_qui,
                      entry.horas_sex,
                      entry.horas_sab,
                      entry.horas_dom,
                    ].map((h, i) => (
                      <td
                        key={i}
                        className={`text-center py-2 px-1 ${h > 0 ? "text-surface-200" : "text-surface-600"}`}
                      >
                        {h > 0 ? h : "—"}
                      </td>
                    ))}
                    <td className="text-center py-2 px-2 font-semibold text-brand-400">
                      {entry.total_linha}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acoes do gestor */}
      {isActionable && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário (obrigatório para rejeição)..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-surface-50 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              loading={processing}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              Aprovar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              loading={processing}
              disabled={!comment.trim()}
              icon={<XCircle className="h-4 w-4" />}
            >
              Rejeitar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
