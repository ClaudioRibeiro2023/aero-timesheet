"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { DashboardStats } from "@/lib/actions/dashboard";

// ============================================================================
// Tipos
// ============================================================================

interface DashboardChartsProps {
  stats: DashboardStats;
}

// ============================================================================
// Custom tooltip
// ============================================================================

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-surface-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-surface-100 font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Componente
// ============================================================================

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const statusData = [
    { name: "Rascunho", value: stats.draft_weeks, color: "#64748b" },
    { name: "Enviadas", value: stats.pending_weeks, color: "#3b82f6" },
    { name: "Aprovadas", value: stats.approved_weeks, color: "#10b981" },
    { name: "Rejeitadas", value: stats.rejected_weeks, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (statusData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status das semanas */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Semanas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumo visual */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Resumo do Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400">Total de horas</span>
              <span className="text-lg font-bold text-surface-100">
                {stats.total_hours_month}h
              </span>
            </div>
            <div className="h-px bg-white/5" />

            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-surface-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-surface-200">
                    {item.value} semana{item.value !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-400">Projetos ativos</span>
              <span className="text-lg font-bold text-brand-400">
                {stats.projects_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
