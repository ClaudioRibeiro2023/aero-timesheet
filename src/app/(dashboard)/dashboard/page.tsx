import {
  Clock,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardCharts } from "./DashboardCharts";
import { getDashboardStats } from "@/lib/actions/dashboard";

// ============================================================================
// KPI Card Component
// ============================================================================

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
}

function KpiCard({ title, value, subtitle, icon, iconColor }: KpiCardProps) {
  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-surface-50">{value}</p>
          {subtitle && (
            <p className="text-xs text-surface-400">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
            iconColor ?? "bg-brand-500/20 text-brand-400"
          }`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Page
// ============================================================================

export default async function DashboardPage() {
  const { data: stats, error } = await getDashboardStats();

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Dashboard</h1>
          <p className="text-sm text-surface-400 mt-1">
            Visao geral do mes corrente
          </p>
        </div>
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Erro ao carregar dados"
          description={error ?? "Nao foi possivel carregar as estatisticas do dashboard."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titulo */}
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Dashboard</h1>
        <p className="text-sm text-surface-400 mt-1">
          Visao geral do mes corrente
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Horas no Mes"
          value={`${stats.total_hours_month}h`}
          subtitle="Total de horas registradas"
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          title="Projetos"
          value={stats.projects_count}
          subtitle="Com horas no mes"
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <KpiCard
          title="Pendentes"
          value={stats.pending_weeks + stats.draft_weeks}
          subtitle={`${stats.pending_weeks} enviadas + ${stats.draft_weeks} rascunhos`}
          icon={<AlertCircle className="h-5 w-5" />}
          iconColor="bg-amber-500/20 text-amber-400"
        />
        <KpiCard
          title="Aprovadas"
          value={stats.approved_weeks}
          subtitle={stats.rejected_weeks > 0 ? `${stats.rejected_weeks} rejeitada(s)` : "Nenhuma rejeicao"}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconColor="bg-emerald-500/20 text-emerald-400"
        />
      </div>

      {/* Charts */}
      <DashboardCharts stats={stats} />
    </div>
  );
}
