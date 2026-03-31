"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import {
  upsertEntry,
  submitWeek,
} from "@/lib/actions/timesheet";
import { getWeekDates, formatDateShort } from "@/lib/utils";
import type {
  TsWeekFull,
  TsProject,
  TsActivityCategory,
  TsEntryWithRelations,
} from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface WeekEditorClientProps {
  week: TsWeekFull;
  projects: TsProject[];
  categories: TsActivityCategory[];
}

interface LocalEntry {
  tempId: string;
  id: string | null; // null = novo
  project_id: string;
  category_id: string;
  hours: [number, number, number, number, number, number, number]; // seg-dom
  description: string;
  dirty: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;

// ============================================================================
// Helpers
// ============================================================================

function groupEntriesByProjectCategory(
  entries: TsEntryWithRelations[]
): LocalEntry[] {
  const map = new Map<string, LocalEntry>();

  for (const entry of entries) {
    const key = `${entry.project_id}-${entry.category_id}`;
    if (!map.has(key)) {
      map.set(key, {
        tempId: `group-${key}`,
        id: null,
        project_id: entry.project_id,
        category_id: entry.category_id,
        hours: [0, 0, 0, 0, 0, 0, 0],
        description: entry.description ?? "",
        dirty: false,
      });
    }
    const local = map.get(key)!;
    if (entry.day_of_week >= 0 && entry.day_of_week <= 6) {
      local.hours[entry.day_of_week] = entry.hours;
    }
  }

  return Array.from(map.values());
}

function newEntry(): LocalEntry {
  return {
    tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: null,
    project_id: "",
    category_id: "",
    hours: [0, 0, 0, 0, 0, 0, 0],
    description: "",
    dirty: true,
  };
}

function rowTotal(hours: number[]): number {
  return hours.reduce((a, b) => a + b, 0);
}

// ============================================================================
// Component
// ============================================================================

export function WeekEditorClient({
  week,
  projects,
  categories,
}: WeekEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<LocalEntry[]>(() => {
    const grouped = groupEntriesByProjectCategory(week.entries);
    return grouped.length > 0 ? grouped : [newEntry()];
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditable = week.status === "draft" || week.status === "rejected";
  const weekDates = useMemo(() => getWeekDates(week.week_start), [week.week_start]);

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.name}`,
      })),
    [projects]
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories]
  );

  // Totais
  const columnTotals = useMemo(() => {
    const totals: number[] = [0, 0, 0, 0, 0, 0, 0];
    rows.forEach((row) => {
      row.hours.forEach((h, i) => {
        totals[i] = (totals[i] ?? 0) + h;
      });
    });
    return totals;
  }, [rows]);

  const grandTotal = useMemo(
    () => columnTotals.reduce((a, b) => a + b, 0),
    [columnTotals]
  );

  // Handlers
  const updateRow = useCallback(
    (tempId: string, updates: Partial<LocalEntry>) => {
      setRows((prev) =>
        prev.map((r) =>
          r.tempId === tempId ? { ...r, ...updates, dirty: true } : r
        )
      );
    },
    []
  );

  const updateHour = useCallback(
    (tempId: string, dayIndex: number, value: string) => {
      const num = parseFloat(value) || 0;
      const clamped = Math.max(0, Math.min(24, num));
      // Round to nearest 0.25
      const rounded = Math.round(clamped * 4) / 4;
      setRows((prev) =>
        prev.map((r) => {
          if (r.tempId !== tempId) return r;
          const hours = [...r.hours] as LocalEntry["hours"];
          hours[dayIndex] = rounded;
          return { ...r, hours, dirty: true };
        })
      );
    },
    []
  );

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, newEntry()]);
  }, []);

  const removeRow = useCallback(
    (tempId: string) => {
      setRows((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((r) => r.tempId !== tempId);
      });
    },
    []
  );

  // Salvar todas as entradas
  const handleSave = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      for (const row of rows) {
        if (!row.project_id || !row.category_id) continue;

        // Salvar cada dia que tenha horas > 0
        for (let day = 0; day < 7; day++) {
          const dayHours = row.hours[day] ?? 0;
          if (dayHours > 0) {
            const result = await upsertEntry({
              week_id: week.id,
              project_id: row.project_id,
              category_id: row.category_id,
              day_of_week: day,
              hours: dayHours,
              description: row.description || null,
            });

            if (result.error) {
              setError(result.error);
              setSaving(false);
              return;
            }
          }
        }
      }

      setSuccess("Lancamentos salvos com sucesso!");
      router.refresh();
    } catch {
      setError("Erro inesperado ao salvar");
    } finally {
      setSaving(false);
    }
  }, [rows, week.id, router]);

  // Submeter semana
  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    // Salvar primeiro
    await handleSave();

    startTransition(async () => {
      const result = await submitWeek(week.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess("Semana enviada para aprovacao!");
      router.refresh();
    });
  }, [handleSave, week.id, router]);

  return (
    <div className="space-y-4">
      {/* Navegacao e acoes */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/timesheet">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <Badge variant={
            week.status === "submitted" ? "submitted" :
            week.status === "approved" ? "approved" :
            week.status === "rejected" ? "rejected" :
            "draft"
          } />
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              loading={saving}
            >
              Salvar Rascunho
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={isPending}
              icon={<Send className="h-4 w-4" />}
            >
              Enviar
            </Button>
          </div>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Rejeicao */}
      {week.status === "rejected" && week.rejection_reason && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">
            <span className="font-semibold">Motivo da rejeicao:</span>{" "}
            {week.rejection_reason}
          </p>
          <p className="text-xs text-red-400/70 mt-1">
            Corrija os lancamentos e envie novamente.
          </p>
        </div>
      )}

      {/* Grid */}
      <Card variant="elevated" padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-surface-400 font-medium min-w-[200px]">
                  Projeto
                </th>
                <th className="text-left px-2 py-3 text-surface-400 font-medium min-w-[140px]">
                  Categoria
                </th>
                {DAYS_PT.map((day, i) => (
                  <th
                    key={day}
                    className="text-center px-2 py-3 text-surface-400 font-medium w-16"
                  >
                    <div>{day}</div>
                    <div className="text-[10px] text-surface-500 font-normal">
                      {weekDates[i] ? formatDateShort(weekDates[i]) : ""}
                    </div>
                  </th>
                ))}
                <th className="text-center px-2 py-3 text-surface-300 font-semibold w-16">
                  Total
                </th>
                {isEditable && <th className="w-12 px-2 py-3" />}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.tempId}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Projeto */}
                  <td className="px-4 py-2">
                    {isEditable ? (
                      <Select
                        options={projectOptions}
                        placeholder="Selecione projeto"
                        value={row.project_id}
                        onChange={(e) =>
                          updateRow(row.tempId, { project_id: e.target.value })
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
                        options={categoryOptions}
                        placeholder="Categoria"
                        value={row.category_id}
                        onChange={(e) =>
                          updateRow(row.tempId, { category_id: e.target.value })
                        }
                        className="!py-2 !text-xs"
                      />
                    ) : (
                      <span className="text-surface-400 text-xs">
                        {categoryOptions.find(
                          (c) => c.value === row.category_id
                        )?.label ?? "—"}
                      </span>
                    )}
                  </td>

                  {/* Horas Seg-Dom */}
                  {row.hours.map((h, i) => (
                    <td key={i} className="px-1 py-2 text-center">
                      {isEditable ? (
                        <input
                          type="number"
                          min={0}
                          max={24}
                          step={0.25}
                          value={h || ""}
                          onChange={(e) =>
                            updateHour(row.tempId, i, e.target.value)
                          }
                          className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-xs text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                      ) : (
                        <span
                          className={`text-xs ${
                            h > 0 ? "text-surface-200" : "text-surface-600"
                          }`}
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
                        rowTotal(row.hours) > 0
                          ? "text-brand-400"
                          : "text-surface-500"
                      }`}
                    >
                      {rowTotal(row.hours)}h
                    </span>
                  </td>

                  {/* Remover */}
                  {isEditable && (
                    <td className="px-2 py-2">
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.tempId)}
                          className="p-1 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover linha"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

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
                {isEditable && <td />}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Botao adicionar linha */}
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
