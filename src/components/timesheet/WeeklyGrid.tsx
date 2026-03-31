"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Send, Save, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { WeekNavigator } from "./WeekNavigator";
import type {
  Project,
  TimesheetCategory,
  TimesheetEntry,
  TimesheetStatus,
} from "@/types/database";

// ============================================================================
// Tipos locais
// ============================================================================

interface GridRow {
  id: string; // temp ID para linhas novas
  project_id: string;
  categoria: TimesheetCategory;
  descricao: string;
  horas: [number, number, number, number, number, number, number]; // seg-dom
}

interface WeeklyGridProps {
  projects: Project[];
  initialEntries: TimesheetEntry[];
  weekStart: Date;
  onWeekChange: (d: Date) => void;
  status: TimesheetStatus;
}

// ============================================================================
// Constantes
// ============================================================================

const DAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const CATEGORY_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "hora_extra", label: "Hora Extra" },
  { value: "viagem", label: "Viagem" },
  { value: "treinamento", label: "Treinamento" },
];

const CATEGORY_COLORS: Record<TimesheetCategory, string> = {
  regular: "bg-brand-500/20 border-brand-500/30 text-brand-300",
  hora_extra: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  viagem: "bg-purple-500/20 border-purple-500/30 text-purple-300",
  treinamento: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
};

// ============================================================================
// Helpers
// ============================================================================

function entryToRow(entry: TimesheetEntry): GridRow {
  return {
    id: entry.id,
    project_id: entry.project_id,
    categoria: entry.categoria,
    descricao: entry.descricao ?? "",
    horas: [
      entry.horas_seg,
      entry.horas_ter,
      entry.horas_qua,
      entry.horas_qui,
      entry.horas_sex,
      entry.horas_sab,
      entry.horas_dom,
    ],
  };
}

function emptyRow(): GridRow {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    project_id: "",
    categoria: "regular",
    descricao: "",
    horas: [0, 0, 0, 0, 0, 0, 0],
  };
}

function rowTotal(row: GridRow): number {
  return row.horas.reduce((a, b) => a + b, 0);
}

// ============================================================================
// Componente
// ============================================================================

export function WeeklyGrid({
  projects,
  initialEntries,
  weekStart,
  onWeekChange,
  status,
}: WeeklyGridProps) {
  const [rows, setRows] = useState<GridRow[]>(() =>
    initialEntries.length > 0 ? initialEntries.map(entryToRow) : [emptyRow()]
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const isEditable = status === "rascunho" || status === "rejeitado";

  // Totais por coluna
  const columnTotals = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    rows.forEach((row) => {
      row.horas.forEach((h, i) => {
        totals[i] = (totals[i] ?? 0) + h;
      });
    });
    return totals;
  }, [rows]);

  const grandTotal = useMemo(() => columnTotals.reduce((a, b) => a + b, 0), [columnTotals]);

  // Projeto options
  const projectOptions = useMemo(
    () =>
      projects
        .filter((p) => p.ativo)
        .map((p) => ({ value: p.id, label: `${p.codigo} — ${p.nome}` })),
    [projects]
  );

  // Handlers
  const updateRow = useCallback(
    (rowId: string, updates: Partial<GridRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const updateHour = useCallback(
    (rowId: string, dayIndex: number, value: string) => {
      const num = parseFloat(value) || 0;
      const clamped = Math.max(0, Math.min(24, num));
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const horas = [...r.horas] as GridRow["horas"];
          horas[dayIndex] = clamped;
          return { ...r, horas };
        })
      );
    },
    []
  );

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== rowId);
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    // TODO: integrar com server action
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    // TODO: integrar com server action
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header com navegacao */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <WeekNavigator weekStart={weekStart} onWeekChange={onWeekChange} />

        {isEditable && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              loading={saving}
              icon={<Save className="h-4 w-4" />}
            >
              Salvar rascunho
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
              icon={<Send className="h-4 w-4" />}
            >
              Submeter
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <Card variant="elevated" padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-surface-400 font-medium min-w-[240px]">
                  Projeto
                </th>
                <th className="text-left px-2 py-3 text-surface-400 font-medium min-w-[120px]">
                  Categoria
                </th>
                {DAYS_PT.map((day) => (
                  <th
                    key={day}
                    className="text-center px-2 py-3 text-surface-400 font-medium w-16"
                  >
                    {day}
                  </th>
                ))}
                <th className="text-center px-2 py-3 text-surface-300 font-semibold w-16">
                  Total
                </th>
                <th className="w-20 px-2 py-3" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Projeto */}
                  <td className="px-4 py-2">
                    {isEditable ? (
                      <Select
                        options={projectOptions}
                        placeholder="Selecione um projeto"
                        value={row.project_id}
                        onChange={(e) =>
                          updateRow(row.id, { project_id: e.target.value })
                        }
                        className="!py-2 !text-xs"
                      />
                    ) : (
                      <span className="text-surface-200 text-xs">
                        {projectOptions.find((p) => p.value === row.project_id)
                          ?.label ?? "—"}
                      </span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="px-2 py-2">
                    {isEditable ? (
                      <Select
                        options={CATEGORY_OPTIONS}
                        value={row.categoria}
                        onChange={(e) =>
                          updateRow(row.id, {
                            categoria: e.target.value as TimesheetCategory,
                          })
                        }
                        className="!py-2 !text-xs"
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[row.categoria]}`}
                      >
                        {CATEGORY_OPTIONS.find((c) => c.value === row.categoria)
                          ?.label}
                      </span>
                    )}
                  </td>

                  {/* Horas Seg-Dom */}
                  {row.horas.map((h, i) => (
                    <td key={i} className="px-1 py-2 text-center">
                      {isEditable ? (
                        <input
                          type="number"
                          min={0}
                          max={24}
                          step={0.5}
                          value={h || ""}
                          onChange={(e) => updateHour(row.id, i, e.target.value)}
                          className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-xs text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                      ) : (
                        <span
                          className={`text-xs ${h > 0 ? "text-surface-200" : "text-surface-600"}`}
                        >
                          {h > 0 ? h : "—"}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Total da linha */}
                  <td className="px-2 py-2 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        rowTotal(row) > 0
                          ? "text-brand-400"
                          : "text-surface-500"
                      }`}
                    >
                      {rowTotal(row)}h
                    </span>
                  </td>

                  {/* Acoes */}
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setExpandedNotes(
                            expandedNotes === row.id ? null : row.id
                          )
                        }
                        className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-white/5 transition-colors"
                        title="Notas"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      {isEditable && rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="p-1 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover linha"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Notas expandidas */}
              {expandedNotes &&
                rows.find((r) => r.id === expandedNotes) && (
                  <tr className="border-b border-white/5">
                    <td colSpan={11} className="px-4 py-3">
                      {isEditable ? (
                        <textarea
                          value={
                            rows.find((r) => r.id === expandedNotes)
                              ?.descricao ?? ""
                          }
                          onChange={(e) =>
                            updateRow(expandedNotes, {
                              descricao: e.target.value,
                            })
                          }
                          placeholder="Notas sobre esta linha (opcional)..."
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-surface-50 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                          rows={2}
                        />
                      ) : (
                        <p className="text-xs text-surface-400">
                          {rows.find((r) => r.id === expandedNotes)
                            ?.descricao || "Sem notas"}
                        </p>
                      )}
                    </td>
                  </tr>
                )}

              {/* Totais por dia */}
              <tr className="bg-white/[0.03]">
                <td className="px-4 py-3 text-xs font-semibold text-surface-300">
                  Total
                </td>
                <td />
                {columnTotals.map((total, i) => (
                  <td key={i} className="px-2 py-3 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        total > 0 ? "text-surface-200" : "text-surface-600"
                      }`}
                    >
                      {total}h
                    </span>
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  <span className="text-sm font-bold text-brand-400">
                    {grandTotal}h
                  </span>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Botao adicionar projeto */}
        {isEditable && (
          <div className="p-4 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              icon={<Plus className="h-4 w-4" />}
            >
              Adicionar Projeto
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
