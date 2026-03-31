import { RelatoriosClient } from "./RelatoriosClient";
import type { HorasPorProjeto, HorasPorColaborador } from "@/types/database";

// ============================================================================
// Mock data
// ============================================================================

const MOCK_HORAS_PROJETO: HorasPorProjeto[] = [
  {
    project_id: "1",
    projeto_nome: "Portal Corporativo",
    projeto_codigo: "AER-2026-001",
    cliente: "Aero Corp",
    total_horas: 248,
    horas_regular: 200,
    horas_extra: 32,
    horas_viagem: 0,
    horas_treinamento: 16,
  },
  {
    project_id: "2",
    projeto_nome: "App Mobile Vendas",
    projeto_codigo: "AER-2026-002",
    cliente: "Vendas SA",
    total_horas: 186,
    horas_regular: 160,
    horas_extra: 16,
    horas_viagem: 10,
    horas_treinamento: 0,
  },
  {
    project_id: "3",
    projeto_nome: "ERP Integração",
    projeto_codigo: "AER-2026-003",
    cliente: "LogTech",
    total_horas: 320,
    horas_regular: 280,
    horas_extra: 24,
    horas_viagem: 8,
    horas_treinamento: 8,
  },
  {
    project_id: "4",
    projeto_nome: "Dashboard BI",
    projeto_codigo: "AER-2026-004",
    cliente: "Analytics Co",
    total_horas: 138,
    horas_regular: 120,
    horas_extra: 8,
    horas_viagem: 0,
    horas_treinamento: 10,
  },
];

const MOCK_HORAS_COLABORADOR: HorasPorColaborador[] = [
  {
    user_id: "u1",
    nome_completo: "Ana Silva",
    departamento: "Engenharia",
    total_horas: 168,
    semanas_submetidas: 4,
    semanas_aprovadas: 3,
    semanas_pendentes: 1,
  },
  {
    user_id: "u2",
    nome_completo: "Carlos Mendes",
    departamento: "Design",
    total_horas: 160,
    semanas_submetidas: 4,
    semanas_aprovadas: 4,
    semanas_pendentes: 0,
  },
  {
    user_id: "u3",
    nome_completo: "Maria Oliveira",
    departamento: "Engenharia",
    total_horas: 176,
    semanas_submetidas: 4,
    semanas_aprovadas: 3,
    semanas_pendentes: 1,
  },
  {
    user_id: "u4",
    nome_completo: "Pedro Santos",
    departamento: "QA",
    total_horas: 152,
    semanas_submetidas: 4,
    semanas_aprovadas: 4,
    semanas_pendentes: 0,
  },
  {
    user_id: "u5",
    nome_completo: "Julia Costa",
    departamento: "Engenharia",
    total_horas: 164,
    semanas_submetidas: 4,
    semanas_aprovadas: 2,
    semanas_pendentes: 2,
  },
];

// ============================================================================
// Page
// ============================================================================

export default async function RelatoriosPage() {
  // TODO: fetch from Supabase
  const horasProjeto = MOCK_HORAS_PROJETO;
  const horasColaborador = MOCK_HORAS_COLABORADOR;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Relatórios</h1>
        <p className="text-sm text-surface-400 mt-1">
          Análise consolidada de horas por projeto, colaborador e categoria
        </p>
      </div>

      <RelatoriosClient
        horasProjeto={horasProjeto}
        horasColaborador={horasColaborador}
      />
    </div>
  );
}
