"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileDown, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { HorasPorProjeto, HorasPorColaborador } from "@/types/database";

// ============================================================================
// Tipos
// ============================================================================

interface RelatoriosClientProps {
  horasProjeto: HorasPorProjeto[];
  horasColaborador: HorasPorColaborador[];
}

// ============================================================================
// Constantes
// ============================================================================

const COLORS = {
  regular: "#06b6d4",
  hora_extra: "#f59e0b",
  viagem: "#a855f7",
  treinamento: "#10b981",
};

const DONUT_COLORS = [COLORS.regular, COLORS.hora_extra, COLORS.viagem, COLORS.treinamento];

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
          <span className="text-surface-400">{entry.name}:</span>
          <span className="text-surface-100 font-medium">{entry.value}h</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Componente
// ============================================================================

export function RelatoriosClient({
  horasProjeto,
  horasColaborador,
}: RelatoriosClientProps) {
  const [dateFrom, setDateFrom] = useState("2026-03-01");
  const [dateTo, setDateTo] = useState("2026-03-31");

  // Dados do grafico de projeto (stacked bar)
  const projetoStackedData = horasProjeto.map((p) => ({
    nome: p.projeto_codigo,
    Regular: p.horas_regular,
    "Hora Extra": p.horas_extra,
    Viagem: p.horas_viagem,
    Treinamento: p.horas_treinamento,
  }));

  // Dados do grafico de colaborador (horizontal bar)
  const colaboradorData = horasColaborador.map((c) => ({
    nome: c.nome_completo.split(" ")[0],
    horas: c.total_horas,
  }));

  // Dados do donut por categoria
  const totalRegular = horasProjeto.reduce((s, p) => s + p.horas_regular, 0);
  const totalExtra = horasProjeto.reduce((s, p) => s + p.horas_extra, 0);
  const totalViagem = horasProjeto.reduce((s, p) => s + p.horas_viagem, 0);
  const totalTreinamento = horasProjeto.reduce((s, p) => s + p.horas_treinamento, 0);

  const donutData = [
    { name: "Regular", value: totalRegular },
    { name: "Hora Extra", value: totalExtra },
    { name: "Viagem", value: totalViagem },
    { name: "Treinamento", value: totalTreinamento },
  ].filter((d) => d.value > 0);

  const grandTotal = totalRegular + totalExtra + totalViagem + totalTreinamento;

  return (
    <div className="space-y-6">
      {/* Filtro de datas */}
      <Card variant="default">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <CalendarDays className="h-4 w-4" />
            <span>Período:</span>
          </div>
          <div className="flex-1 max-w-[180px]">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              label="De"
              className="!py-2 !text-xs"
            />
          </div>
          <div className="flex-1 max-w-[180px]">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              label="Até"
              className="!py-2 !text-xs"
            />
          </div>
          <Link href="/relatorios/print" target="_blank">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown className="h-4 w-4" />}
            >
              Exportar PDF
            </Button>
          </Link>
        </div>
      </Card>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Horas por Projeto (stacked bar) */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Horas por Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projetoStackedData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    unit="h"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Regular" stackId="a" fill={COLORS.regular} />
                  <Bar dataKey="Hora Extra" stackId="a" fill={COLORS.hora_extra} />
                  <Bar dataKey="Viagem" stackId="a" fill={COLORS.viagem} />
                  <Bar
                    dataKey="Treinamento"
                    stackId="a"
                    fill={COLORS.treinamento}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Horas por Colaborador (horizontal bar) */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Horas por Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={colaboradorData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    unit="h"
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" name="Horas" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut por Categoria */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}h (${((value / grandTotal) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda customizada */}
              <div className="space-y-3">
                {donutData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[i] }}
                    />
                    <span className="text-sm text-surface-300 w-28">{entry.name}</span>
                    <span className="text-sm text-surface-100 font-semibold">
                      {entry.value}h
                    </span>
                    <span className="text-xs text-surface-500">
                      ({((entry.value / grandTotal) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3" />
                    <span className="text-sm text-surface-200 w-28 font-medium">Total</span>
                    <span className="text-sm text-brand-400 font-bold">
                      {grandTotal}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
