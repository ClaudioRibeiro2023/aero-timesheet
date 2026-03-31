// ============================================================================
// Aero Timesheet — Funções Utilitárias
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TimesheetStatus, TimesheetCategory } from "@/types/database";

// ============================================================================
// Tailwind + clsx
// ============================================================================

/** Combina classes CSS com suporte a conflitos Tailwind */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Formatação de Horas
// ============================================================================

/**
 * Formata horas decimais em formato legível.
 * @example formatHours(8.5) → "8h 30min"
 * @example formatHours(0) → "0h"
 * @example formatHours(2.25) → "2h 15min"
 */
export function formatHours(hours: number): string {
  if (hours === 0) return "0h";

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

// ============================================================================
// Formatação de Datas
// ============================================================================

/**
 * Formata uma data para exibição em pt-BR.
 * @example formatDate("2026-03-23") → "23 de mar. de 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formata data curta (sem ano).
 * @example formatDateShort("2026-03-23") → "23/03"
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ============================================================================
// Funções de Semana
// ============================================================================

/**
 * Retorna a segunda-feira da semana de uma data.
 * @example getWeekStart(new Date("2026-03-26")) → Date (2026-03-23, segunda)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay(): 0=dom, 1=seg, ..., 6=sab
  // Ajuste: se domingo (0), volta 6 dias; senão volta (day-1)
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Retorna as 7 datas da semana (seg-dom) a partir de uma segunda-feira.
 * @example getWeekDates("2026-03-23") → [Date(23), Date(24), ..., Date(29)]
 */
export function getWeekDates(weekStart: string | Date): Date[] {
  const start =
    typeof weekStart === "string"
      ? new Date(weekStart + "T00:00:00")
      : new Date(weekStart);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * Formata uma data como YYYY-MM-DD (ISO date string).
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ============================================================================
// Formatação de Moeda
// ============================================================================

/**
 * Formata valor em Reais (BRL).
 * @example formatCurrency(1500.5) → "R$ 1.500,50"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ============================================================================
// Labels em Português
// ============================================================================

const STATUS_LABELS: Record<TimesheetStatus, string> = {
  rascunho: "Rascunho",
  submetido: "Submetido",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const STATUS_COLORS: Record<TimesheetStatus, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  submetido: "bg-blue-100 text-blue-700",
  aprovado: "bg-green-100 text-green-700",
  rejeitado: "bg-red-100 text-red-700",
};

/**
 * Retorna o label em português para um status de timesheet.
 * @example getStatusLabel("rascunho") → "Rascunho"
 */
export function getStatusLabel(status: TimesheetStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Retorna classes CSS de cor para um status.
 * @example getStatusColor("aprovado") → "bg-green-100 text-green-700"
 */
export function getStatusColor(status: TimesheetStatus): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

const CATEGORY_LABELS: Record<TimesheetCategory, string> = {
  regular: "Regular",
  hora_extra: "Hora Extra",
  viagem: "Viagem",
  treinamento: "Treinamento",
};

const CATEGORY_COLORS: Record<TimesheetCategory, string> = {
  regular: "bg-slate-100 text-slate-700",
  hora_extra: "bg-amber-100 text-amber-700",
  viagem: "bg-purple-100 text-purple-700",
  treinamento: "bg-teal-100 text-teal-700",
};

/**
 * Retorna o label em português para uma categoria.
 * @example getCategoryLabel("hora_extra") → "Hora Extra"
 */
export function getCategoryLabel(category: TimesheetCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * Retorna classes CSS de cor para uma categoria.
 */
export function getCategoryColor(category: TimesheetCategory): string {
  return CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-700";
}

// ============================================================================
// Labels dos dias da semana
// ============================================================================

export const DAY_LABELS = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
} as const;

export const DAY_LABELS_FULL = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
  dom: "Domingo",
} as const;
