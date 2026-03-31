import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getWeekWithEntries } from "@/lib/actions/timesheet";
import { getProjects, getCategories } from "@/lib/actions/projects";
import { WeekEditorClient } from "./WeekEditorClient";
import { formatDate } from "@/lib/utils";

// ============================================================================
// Page (Server Component)
// ============================================================================

interface PageProps {
  params: Promise<{ weekId: string }>;
}

export default async function WeekEditorPage({ params }: PageProps) {
  const { weekId } = await params;

  const [weekResult, projectsResult, categoriesResult] = await Promise.all([
    getWeekWithEntries(weekId),
    getProjects(),
    getCategories(),
  ]);

  if (weekResult.error || !weekResult.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Timesheet</h1>
        </div>
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Semana nao encontrada"
          description={weekResult.error ?? "Nao foi possivel carregar esta semana."}
        />
      </div>
    );
  }

  const week = weekResult.data;
  const projects = projectsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">
          Semana de {formatDate(week.week_start)}
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Registre suas horas por projeto e categoria
        </p>
      </div>

      <WeekEditorClient
        week={week}
        projects={projects}
        categories={categories}
      />
    </div>
  );
}
