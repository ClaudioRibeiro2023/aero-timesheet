import { Briefcase, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProjects } from "@/lib/actions/projects";
import { ProjetosSearch } from "./ProjetosSearch";
import type { TsProject } from "@/lib/types";

// ============================================================================
// Project Card
// ============================================================================

function ProjectCard({ project }: { project: TsProject }) {
  return (
    <Card variant="elevated" className="hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-surface-400">
              {project.code}
            </span>
            <Badge variant={project.is_active ? "approved" : "draft"}>
              {project.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-surface-100">
            {project.name}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{
            backgroundColor: project.color
              ? `${project.color}20`
              : "rgba(51, 141, 255, 0.2)",
          }}
        >
          <Briefcase
            className="h-5 w-5"
            style={{
              color: project.color ?? "#338dff",
            }}
          />
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-surface-400 line-clamp-2">
          {project.description}
        </p>
      )}
    </Card>
  );
}

// ============================================================================
// Page (Server Component)
// ============================================================================

export default async function ProjetosPage() {
  const { data: projects, error } = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Projetos</h1>
        <p className="text-sm text-surface-400 mt-1">
          Projetos disponiveis para lancamento de horas
        </p>
      </div>

      {error && (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Erro ao carregar projetos"
          description={error}
        />
      )}

      {!error && projects && projects.length === 0 && (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="Nenhum projeto cadastrado"
          description="Nao ha projetos ativos no momento."
        />
      )}

      {projects && projects.length > 0 && (
        <ProjetosSearch
          projects={projects}
          renderCard={(project: TsProject) => (
            <ProjectCard key={project.id} project={project} />
          )}
        />
      )}
    </div>
  );
}
