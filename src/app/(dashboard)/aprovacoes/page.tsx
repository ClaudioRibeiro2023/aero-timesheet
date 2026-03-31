import { AlertCircle, CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPendingApprovals } from "@/lib/actions/approval";
import { AprovacoesList } from "./AprovacoesList";

// ============================================================================
// Page (Server Component)
// ============================================================================

export default async function AprovacoesPage() {
  const { data: weeks, error } = await getPendingApprovals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Aprovacoes</h1>
        <p className="text-sm text-surface-400 mt-1">
          Gerencie os timesheets submetidos pela equipe
        </p>
      </div>

      {error && (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Erro ao carregar aprovacoes"
          description={error}
        />
      )}

      {!error && weeks && weeks.length === 0 && (
        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title="Nenhuma aprovacao pendente"
          description="Todas as semanas submetidas ja foram processadas."
        />
      )}

      {weeks && weeks.length > 0 && <AprovacoesList weeks={weeks} />}
    </div>
  );
}
