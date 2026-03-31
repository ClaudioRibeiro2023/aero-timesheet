import Link from "next/link";

const features = [
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    titulo: "Registro de Horas",
    descricao:
      "Registre horas por projeto e contrato com categorias: regular, hora extra, viagem e treinamento.",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    titulo: "Aprovacao por Gestor",
    descricao:
      "Fluxo completo de submissao e aprovacao semanal com historico de rejeicoes e comentarios.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    titulo: "Dashboard Gerencial",
    descricao:
      "Visualize totais por projeto, colaborador e semana com graficos interativos e exportacao PDF.",
  },
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    titulo: "Visao Semanal",
    descricao:
      "Timesheet no formato segunda a domingo com preenchimento rapido e duplicacao de semanas anteriores.",
  },
  {
    icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    titulo: "Exportar PDF",
    descricao:
      "Gere relatorios em PDF por colaborador, projeto ou periodo para auditoria e contabilidade.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    titulo: "Autenticacao Segura",
    descricao:
      "Login via Supabase Auth com controle de permissoes por cargo: colaborador, gestor e administrador.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-surface-300 ring-1 ring-white/10 hover:ring-white/20 transition-colors">
              <span className="font-semibold text-brand-400">
                Aero Engenharia
              </span>{" "}
              — Sistema interno de gestao
            </div>
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="gradient-text">Aero Timesheet</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-surface-300 max-w-2xl mx-auto">
            Controle preciso de horas trabalhadas por projeto e contrato.
            Aprovacao simplificada, dashboards em tempo real e exportacao
            profissional em PDF.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 transition-all duration-200 hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Acessar Sistema
            </Link>
            <Link
              href="#funcionalidades"
              className="text-sm font-semibold leading-6 text-surface-300 hover:text-white transition-colors"
            >
              Conhecer funcionalidades{" "}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Decorativo: grid de linhas */}
        <div className="absolute inset-0 -z-10 opacity-20" aria-hidden="true">
          <svg className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-surface-700"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que voce precisa para{" "}
              <span className="gradient-text">gestao de horas</span>
            </h2>
            <p className="mt-4 text-lg text-surface-400">
              Ferramentas completas para colaboradores, gestores e
              administradores.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.titulo}
                className="glass-card group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/20 group-hover:bg-brand-600/30 transition-colors">
                    <svg
                      className="h-6 w-6 text-brand-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{feature.titulo}</h3>
                </div>
                <p className="text-surface-400 text-sm leading-relaxed">
                  {feature.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card py-16 px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Pronto para comecar?
            </h2>
            <p className="text-surface-400 mb-8 max-w-xl mx-auto">
              Acesse o sistema com suas credenciais corporativas e comece a
              registrar suas horas de trabalho agora mesmo.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 transition-all duration-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Entrar no Aero Timesheet
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            &copy; 2026 Aero Engenharia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-surface-600">
            Aero Timesheet v0.1.0 &mdash; Sistema interno
          </p>
        </div>
      </footer>
    </main>
  );
}
