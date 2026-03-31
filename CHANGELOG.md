# Changelog — Aero Timesheet

Todas as mudanças significativas deste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] — 2026-03-27

Release inicial gerado pelo **Aero Factory H** via pipeline de 8 waves.

Agentes envolvidos: Rafael (planejamento), Marina (database), Lucas (backend), Sofia (frontend), Ana (qualidade), Amélia (documentação).

### Adicionado

#### Infraestrutura e Banco de Dados

- Schema completo do Supabase em `supabase/migrations/001_create_tables.sql`
- 5 tabelas: `profiles`, `projects`, `timesheet_weeks`, `timesheet_entries`, `approval_logs`
- 4 enums PostgreSQL: `user_role`, `timesheet_status`, `timesheet_category`, `approval_action`
- 3 views de agregação: `vw_horas_por_projeto`, `vw_horas_por_colaborador`, `vw_resumo_semanal`
- Função RPC `get_dashboard_summary` com filtros dinâmicos por período, projeto, colaborador, departamento e status
- Trigger `trg_recalcular_total_horas` — recalcula `total_horas` no cabeçalho semanal a cada alteração em `timesheet_entries`
- Trigger `trg_on_auth_user_created` — cria `profiles` automaticamente ao registrar usuário no Supabase Auth
- Triggers `updated_at` em todas as tabelas mutáveis
- Coluna gerada `total_linha` em `timesheet_entries` (soma dos 7 dias, `GENERATED ALWAYS AS STORED`)
- 20 policies de Row Level Security cobrindo todos os cargos: `colaborador`, `gestor`, `administrador`
- Constraints de integridade: semana sempre inicia na segunda-feira, semana_fim sempre semana_inicio + 6 dias, unicidade por usuário+semana, unicidade por projeto+categoria dentro da semana
- Índices compostos para queries do dashboard e aprovações
- 5 projetos de seed data: Plataforma Aeroespacial X1 (Embraer), Sistema de Telemetria T3 (INPE), Manutenção Frota Legacy (LATAM), Consultoria Regulatória ANAC (GOL), Atividades Internas (Aero Engenharia)

#### Autenticação e Segurança

- Autenticação via Supabase Auth (e-mail/senha e magic link)
- Middleware Next.js (`middleware.ts`) com proteção de todas as rotas autenticadas
- Redirect automático para `/login` quando não autenticado
- Callback OAuth em `/auth/callback/route.ts` para troca de authorization code por sessão
- Sessão gerenciada via cookies HttpOnly pelo `@supabase/ssr`
- Headers de segurança configurados no `netlify.toml`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Clientes Supabase separados para browser (`lib/supabase/client.ts`) e servidor (`lib/supabase/server.ts`)

#### Grid de Timesheet Semanal

- Página `/timesheet` com carregamento server-side dos dados da semana atual
- Grid editável segunda-a-domingo com uma linha por projeto/categoria
- Edição inline de horas por célula (input numérico com step 0.5)
- Seletor de semana `WeekNavigator` com navegação para semana anterior e próxima
- Adição dinâmica de novas linhas com seleção de projeto e categoria via dropdown
- Remoção de linhas existentes com confirmação
- Totais por linha calculados ao vivo no frontend e confirmados pelo banco via trigger
- Totais por dia calculados em tempo real na linha de rodapé do grid
- Auto-save com debounce de 1 segundo ao alterar qualquer célula
- Estado visual claro por status do timesheet (badge colorido: rascunho, submetido, aprovado, rejeitado)
- Histórico de semanas anteriores na barra lateral direita com status e total de horas
- Botão "Submeter Timesheet" com validação: bloqueia submissão se total de horas for zero
- Observações opcionais por timesheet (campo de texto livre)

#### Fluxo de Aprovação

- Página `/aprovacoes` restrita a gestores e administradores
- Listagem de timesheets com status `submetido` do departamento/subordinados
- Ordenação por data de submissão (mais antigo primeiro)
- Card de aprovação `ApprovalCard` com: nome do colaborador, semana de referência, total de horas, projetos e categorias
- Detalhes expandíveis: tabela completa de lançamentos da semana
- Ação **Aprovar** com comentário opcional
- Ação **Rejeitar** com comentário obrigatório e campo de motivo de rejeição
- Badge de pendências no menu lateral atualizado em tempo real
- Log completo de aprovações exibido ao colaborador na tela do timesheet
- Ação **Reabrir** disponível para timesheets rejeitados, voltando o status para `rascunho`

#### Dashboard Gerencial

- Página `/dashboard` com dados carregados server-side
- 4 KPI cards: total de horas aprovadas no período, timesheets pendentes, colaboradores com lançamentos, projetos com horas alocadas
- Gráfico de barras `ChartHorasProjeto` (Recharts `BarChart`): horas aprovadas por projeto, com breakdown por categoria
- Gráfico de pizza `ChartCategoriaPizza` (Recharts `PieChart`): distribuição percentual de horas por categoria
- Gráfico de linha `ChartEvolucaoSemanal` (Recharts `LineChart`): evolução semanal de horas aprovadas ao longo do tempo
- Filtros combinados: período de datas (de/até), projeto, colaborador e departamento
- Tabela detalhada com todos os timesheets do período filtrado e totais agregados
- Skeleton loaders em todas as seções durante carregamento

#### Gestão de Projetos

- Página `/projetos` com listagem de projetos ativos
- Tabela com colunas: código, nome, cliente, orçamento de horas, horas alocadas (de aprovados) e status
- Barra de progresso de utilização de horas (horas alocadas / orçamento)
- Filtro de busca por código, nome ou cliente (`ProjetosSearch` client-side)
- Formulário de criação e edição de projeto (restrito a admins): código, nome, cliente, descrição, orçamento, datas
- Ação de desativar projeto (soft delete — preserva histórico)
- Proteção via RLS: somente admins conseguem criar, editar ou desativar projetos

#### Exportação PDF

- API route `GET /api/export/pdf` com geração server-side via `@react-pdf/renderer`
- Template de timesheet individual: cabeçalho com dados do colaborador, semana e status; tabela de lançamentos por projeto/categoria; totais por dia e por linha
- Template de relatório gerencial: consolidado de horas por projeto e categoria para o período filtrado
- Download direto com `Content-Disposition: attachment`
- Limitado a no máximo 52 semanas por solicitação para evitar timeout em Netlify Functions

#### Componentes de Interface

- `Sidebar` — Menu lateral com links de navegação, logo e botão de logout; badge de pendências na rota de aprovações
- `Header` — Barra superior com título da página atual, breadcrumbs e avatar + nome do usuário logado
- `Button` — Variantes: `primary`, `secondary`, `ghost`, `danger`; estados: `loading`, `disabled`
- `Card` — Container com padding e sombra padrão
- `Badge` — Cores semânticas mapeadas para status: cinza (rascunho), amarelo (submetido), verde (aprovado), vermelho (rejeitado)
- `Input` — Campo de texto com label integrado, mensagem de erro e suporte a `required`
- `Select` — Dropdown com label e validação de erro
- `LoadingOverlay` — Overlay com spinner para operações assíncronas
- `EmptyState` — Estado vazio padronizado com ícone, título e descrição

#### Validação e Qualidade

- Schemas Zod para todas as entradas de Server Actions (`lib/validations/timesheet.ts`)
- TypeScript em modo estrito (`strict: true`) em todos os arquivos
- Tipagem completa do schema do banco em `src/types/database.ts`
- Utilitários tipados: `cn()` para classes Tailwind, `formatDate()`, `formatHoras()`, `getSemanaLabel()`

#### Deploy e Configuração

- `netlify.toml` com `@netlify/plugin-nextjs`, Node 20, `NEXT_USE_NETLIFY_EDGE: true`
- Redirect de `/api/*` preservando os status codes
- `next.config.mjs` configurado para produção
- `postcss.config.mjs` com Autoprefixer
- `tailwind.config.ts` com fontes, cores e plugins `@tailwindcss/forms` e `@tailwindcss/typography`

---

## Próximas Versões (Roadmap)

### [1.1.0] — Previsto

- Notificações por e-mail ao submeter e ao receber aprovação/rejeição (Supabase Edge Functions + Resend)
- Importação de horas via CSV
- Relatório de banco de horas (saldo de horas extras por colaborador)

### [1.2.0] — Previsto

- Integração com calendário de feriados nacionais (API IBGE)
- Aprovação em lote para gestores (selecionar múltiplos timesheets)
- Exportação para Excel (.xlsx)

### [2.0.0] — Futuro

- Multi-empresa (isolamento por tenant)
- Fluxo de aprovação em múltiplos níveis (gestor + diretor)
- API pública REST para integração com sistemas ERP
