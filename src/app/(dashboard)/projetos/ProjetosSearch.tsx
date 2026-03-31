"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Search, Filter } from "lucide-react";
import type { TsProject } from "@/lib/types";

interface ProjetosSearchProps {
  projects: TsProject[];
  renderCard: (project: TsProject) => ReactNode;
}

export function ProjetosSearch({
  projects,
  renderCard,
}: ProjetosSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou codigo..."
          className="block w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-surface-50 placeholder:text-surface-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {/* Contagem */}
      <p className="text-xs text-surface-400">
        {filtered.length} projeto{filtered.length !== 1 ? "s" : ""} encontrado
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-10 w-10 text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-400">
            Nenhum projeto encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
}
