import type { HorasPorProjeto, HorasPorColaborador } from "@/types/database";

// ============================================================================
// Mock data (mesmos dados da page principal)
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
  { user_id: "u1", nome_completo: "Ana Silva", departamento: "Engenharia", total_horas: 168, semanas_submetidas: 4, semanas_aprovadas: 3, semanas_pendentes: 1 },
  { user_id: "u2", nome_completo: "Carlos Mendes", departamento: "Design", total_horas: 160, semanas_submetidas: 4, semanas_aprovadas: 4, semanas_pendentes: 0 },
  { user_id: "u3", nome_completo: "Maria Oliveira", departamento: "Engenharia", total_horas: 176, semanas_submetidas: 4, semanas_aprovadas: 3, semanas_pendentes: 1 },
  { user_id: "u4", nome_completo: "Pedro Santos", departamento: "QA", total_horas: 152, semanas_submetidas: 4, semanas_aprovadas: 4, semanas_pendentes: 0 },
  { user_id: "u5", nome_completo: "Julia Costa", departamento: "Engenharia", total_horas: 164, semanas_submetidas: 4, semanas_aprovadas: 2, semanas_pendentes: 2 },
];

// ============================================================================
// Helpers
// ============================================================================

function formatDate(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

// ============================================================================
// Print Page (Server Component)
// ============================================================================

export default async function PrintPage() {
  const horasProjeto = MOCK_HORAS_PROJETO;
  const horasColaborador = MOCK_HORAS_COLABORADOR;

  const totalGeral = horasProjeto.reduce((s, p) => s + p.total_horas, 0);
  const totalRegular = horasProjeto.reduce((s, p) => s + p.horas_regular, 0);
  const totalExtra = horasProjeto.reduce((s, p) => s + p.horas_extra, 0);
  const totalViagem = horasProjeto.reduce((s, p) => s + p.horas_viagem, 0);
  const totalTreinamento = horasProjeto.reduce((s, p) => s + p.horas_treinamento, 0);

  return (
    <div className="print-page bg-white text-gray-900 min-h-screen p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { padding: 0; }
          .no-print { display: none !important; }
          table { page-break-inside: avoid; }
          h2 { page-break-after: avoid; }
        }
        @media screen {
          .print-page { font-family: 'Inter', system-ui, sans-serif; }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Relatório de Horas — Aero Timesheet
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Período: Março 2026 | Gerado em: {formatDate()}
        </p>
      </div>

      {/* Resumo */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Resumo Geral
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalGeral}h</p>
            <p className="text-xs text-gray-500 mt-1">Total de Horas</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{horasProjeto.length}</p>
            <p className="text-xs text-gray-500 mt-1">Projetos</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{horasColaborador.length}</p>
            <p className="text-xs text-gray-500 mt-1">Colaboradores</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {(totalGeral / horasColaborador.length).toFixed(0)}h
            </p>
            <p className="text-xs text-gray-500 mt-1">Média/Colaborador</p>
          </div>
        </div>
      </section>

      {/* Tabela por Projeto */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Horas por Projeto
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Código
              </th>
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Projeto
              </th>
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Cliente
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Regular
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Extra
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Viagem
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Treino
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-800">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {horasProjeto.map((p) => (
              <tr key={p.project_id}>
                <td className="border border-gray-200 px-3 py-2 text-gray-700 font-mono text-xs">
                  {p.projeto_codigo}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-800">
                  {p.projeto_nome}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-600">
                  {p.cliente}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {p.horas_regular}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {p.horas_extra}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {p.horas_viagem}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {p.horas_treinamento}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right font-semibold text-gray-900">
                  {p.total_horas}h
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={3} className="border border-gray-200 px-3 py-2 text-gray-800">
                Total
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                {totalRegular}h
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                {totalExtra}h
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                {totalViagem}h
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">
                {totalTreinamento}h
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">
                {totalGeral}h
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tabela por Colaborador */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Horas por Colaborador
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Colaborador
              </th>
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Departamento
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Horas
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Sem. Submetidas
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Sem. Aprovadas
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Sem. Pendentes
              </th>
            </tr>
          </thead>
          <tbody>
            {horasColaborador.map((c) => (
              <tr key={c.user_id}>
                <td className="border border-gray-200 px-3 py-2 text-gray-800">
                  {c.nome_completo}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-600">
                  {c.departamento}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right font-semibold text-gray-900">
                  {c.total_horas}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {c.semanas_submetidas}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {c.semanas_aprovadas}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {c.semanas_pendentes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Distribuição por Categoria */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Distribuição por Categoria
        </h2>
        <table className="w-full border-collapse text-sm max-w-md">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                Categoria
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                Horas
              </th>
              <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-600">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Regular", value: totalRegular },
              { label: "Hora Extra", value: totalExtra },
              { label: "Viagem", value: totalViagem },
              { label: "Treinamento", value: totalTreinamento },
            ].map((cat) => (
              <tr key={cat.label}>
                <td className="border border-gray-200 px-3 py-2 text-gray-800">
                  {cat.label}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {cat.value}h
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">
                  {((cat.value / totalGeral) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-200 px-3 py-2 text-gray-800">
                Total
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">
                {totalGeral}h
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center">
        Aero Timesheet — Relatório gerado automaticamente | {formatDate()}
      </div>

      {/* Botao de imprimir (so na tela) */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
        >
          Imprimir / Salvar PDF
        </button>
      </div>
    </div>
  );
}
