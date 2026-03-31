# Aero Timesheet

Sistema de registro e aprovação de horas trabalhadas para colaboradores da Aero Engenharia. Permite que equipes registrem horas semanais por projeto e categoria, submetam para aprovação do gestor direto, acompanhem indicadores pelo dashboard gerencial e exportem relatórios em PDF.

Gerado automaticamente pelo **Aero Factory H** em 27/03/2026 via pipeline de 8 waves.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.21 |
| Banco de Dados | Supabase (PostgreSQL + Auth + RLS) | — |
| Estilização | Tailwind CSS + @tailwindcss/forms | 3.4 |
| Gráficos | Recharts | 2.15 |
| Linguagem | TypeScript (strict mode) | 5.7 |
| PDF | @react-pdf/renderer | 4.x |
| Validação | Zod | 3.24 |
| Ícones | Lucide React | 0.468 |
| Datas | date-fns + date-fns-tz | 4.x |
| Notificações | react-hot-toast | 2.4 |
| Deploy | Netlify (@netlify/plugin-nextjs) | — |

---

## Funcionalidades

### Timesheet Semanal

- Grid segunda-a-domingo com uma linha por projeto/categoria
- Edição inline de horas por dia diretamente na célula
- Seletor de semana com navegação para semanas anteriores e próximas
- Adição e remoção dinâmica de linhas (projeto + categoria)
- Auto-save com debounce ao digitar — nenhuma hora perdida
- Totais calculados automaticamente por linha e por coluna (via trigger PostgreSQL)
- Histórico completo de semanas anteriores com status visual em badge
- Categorias disponíveis: `regular`, `hora extra`, `viagem`, `treinamento`

### Fluxo de Aprovação

- Submissão do timesheet com validação (total de horas > 0 obrigatório)
- Máquina de estados linear: `rascunho → submetido → aprovado | rejeitado`
- Fila de aprovação para gestores com listagem de timesheets pendentes do departamento
- Visualização detalhada do timesheet em modo read-only pelo gestor
- Ações de aprovar ou rejeitar com campo de comentário opcional na aprovação e obrigatório na rejeição
- Notificação visual via badge com contagem de timesheets pendentes no menu lateral
- Histórico de log imutável: data, responsável, ação e comentário de cada etapa
- Reabertura de timesheet rejeitado para edição e nova submissão

### Dashboard Gerencial

- KPIs em cards: total de horas aprovadas, timesheets pendentes, colaboradores ativos e projetos em andamento
- Gráfico de barras: horas por projeto (Recharts BarChart)
- Gráfico de pizza: distribuição por categoria (regular, hora extra, viagem, treinamento)
- Gráfico de linha: evolução de horas aprovadas por semana
- Filtros combinados por período, projeto, colaborador e departamento
- Tabela detalhada com dados completos do período filtrado

### Gestão de Projetos

- Listagem de projetos ativos com código, cliente, orçamento de horas e status
- Criação e edição de projetos restrita a administradores
- Indicador de utilização: horas alocadas vs orçamento definido
- Desativação de projetos sem exclusão de histórico de horas

### Exportação PDF

- Relatório individual: timesheet de um colaborador por semana
- Relatório gerencial: consolidado por projeto e período
- Gerado server-side via API route do Next.js com `@react-pdf/renderer`
- Download direto no browser sem dependência de Puppeteer ou Chrome headless

### Controle de Acesso

| Cargo | Permissões |
|---|---|
| `colaborador` | Registra, edita e submete os próprios timesheets. Visualiza dashboard e projetos. |
| `gestor` | Tudo do colaborador + aprova/rejeita timesheets do departamento e subordinados diretos. |
| `administrador` | Acesso total + gerencia projetos e perfis de usuários. |

Permissões garantidas por **Row Level Security (RLS)** no PostgreSQL. Invioláveis mesmo com bugs de aplicação.

---

## Setup Local

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) com projeto criado
- npm

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

> As chaves estão em **Supabase Dashboard → Settings → API**.

### 3. Criar o banco de dados

Execute a migration no SQL Editor do Supabase:

```bash
# Arquivo de migration:
supabase/migrations/001_create_tables.sql
```

A migration cria:
- 5 tabelas: `profiles`, `projects`, `timesheet_weeks`, `timesheet_entries`, `approval_logs`
- 3 views: `vw_horas_por_projeto`, `vw_horas_por_colaborador`, `vw_resumo_semanal`
- 1 função RPC: `get_dashboard_summary` (com filtros por período, projeto, colaborador e departamento)
- Triggers de cálculo automático de totais de horas
- Trigger de criação automática de perfil ao registrar usuário
- Row Level Security completo (20 policies)
- 5 projetos de seed data (clientes Embraer, INPE, LATAM, GOL e Atividades Internas)

### 4. Criar usuários de teste

No painel **Supabase Auth → Users**, crie 3 usuários. Depois execute no SQL Editor:

```sql
UPDATE profiles SET nome_completo = 'Claudio Ribeiro', cargo = 'administrador', departamento = 'Diretoria'
WHERE email = 'admin@aero.eng.br';

UPDATE profiles SET nome_completo = 'Ana Costa', cargo = 'gestor', departamento = 'Engenharia'
WHERE email = 'gestor@aero.eng.br';

UPDATE profiles SET nome_completo = 'Pedro Silva', cargo = 'colaborador', departamento = 'Engenharia',
  gestor_id = (SELECT id FROM profiles WHERE email = 'gestor@aero.eng.br')
WHERE email = 'colab@aero.eng.br';
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção local |
| `npm run lint` | Lint com ESLint |
| `npm run type-check` | Verificação TypeScript sem emitir arquivos |

---

## Estrutura do Projeto

```
aero-timesheet/
├── supabase/
│   └── migrations/
│       └── 001_create_tables.sql      # Schema completo (tabelas, views, triggers, RLS, seed)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (html, body, Toaster)
│   │   ├── page.tsx                   # Redirect / → /dashboard
│   │   ├── globals.css                # Estilos globais + diretivas Tailwind
│   │   ├── login/
│   │   │   └── page.tsx              # Página de login (email/senha)
│   │   ├── auth/callback/
│   │   │   └── route.ts              # OAuth callback — troca code por sessão
│   │   ├── api/
│   │   │   ├── dashboard/route.ts    # GET stats para o dashboard
│   │   │   └── health/route.ts       # Health check
│   │   └── (dashboard)/              # Route group autenticado
│   │       ├── layout.tsx            # Shell: Sidebar + Header + Content Area
│   │       ├── dashboard/            # KPIs + gráficos Recharts
│   │       ├── timesheet/            # Grid semanal de horas
│   │       ├── aprovacoes/           # Fila de aprovação (gestor/admin)
│   │       ├── projetos/             # Listagem e cadastro de projetos
│   │       └── relatorios/           # Relatórios filtráveis + export PDF
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Menu lateral (links, logo, logout)
│   │   │   └── Header.tsx            # Barra superior (título, avatar)
│   │   ├── timesheet/
│   │   │   ├── WeeklyGrid.tsx        # Grid semanal editável inline
│   │   │   ├── WeekNavigator.tsx     # Seletor de semana ◄ ►
│   │   │   └── ApprovalCard.tsx      # Card de aprovação para gestores
│   │   └── ui/
│   │       ├── Button.tsx            # Botão com variantes (primary, ghost, danger)
│   │       ├── Card.tsx              # Container de conteúdo
│   │       ├── Badge.tsx             # Badge de status colorido
│   │       ├── Input.tsx             # Input com label e mensagem de erro
│   │       ├── Select.tsx            # Dropdown select
│   │       └── LoadingOverlay.tsx    # Overlay de carregamento
│   │
│   ├── lib/
│   │   ├── actions/
│   │   │   └── timesheet-actions.ts  # Server Actions (CRUD + submissão + aprovação)
│   │   ├── queries/
│   │   │   └── timesheets.ts         # Funções de leitura de dados do Supabase
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente browser (cookies do usuário)
│   │   │   ├── server.ts             # Cliente server (SSR e server actions)
│   │   │   └── middleware.ts         # Cliente para o middleware.ts
│   │   ├── validations/
│   │   │   └── timesheet.ts          # Schemas Zod para validação de entrada
│   │   └── utils.ts                  # cn(), formatDate(), formatHoras() e helpers
│   │
│   ├── types/
│   │   └── database.ts               # Tipos TypeScript gerados do schema Supabase
│   │
│   └── middleware.ts                 # Proteção de rotas: redireciona não autenticados para /login
│
├── docs/
│   ├── database.md                   # Documentação das tabelas, views e RLS
│   └── api.md                        # Documentação das API routes e Server Actions
│
├── netlify.toml                      # Configuração de deploy Netlify
├── next.config.mjs                   # Configuração Next.js
├── tailwind.config.ts                # Configuração Tailwind CSS
├── tsconfig.json                     # TypeScript strict mode
└── package.json                      # Dependências e scripts
```

---

## Deploy (Netlify)

O projeto inclui `netlify.toml` pré-configurado com `@netlify/plugin-nextjs` e headers de segurança.

### Deploy automático via GitHub

1. Conecte o repositório ao Netlify
2. Configure as variáveis de ambiente em **Site Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Todo push para `main` dispara deploy automático

### Deploy manual

```bash
# Build de produção
npm run build

# Deploy via Netlify CLI
netlify deploy --prod
```

### Configurações aplicadas

| Configuração | Valor |
|---|---|
| Comando de build | `npm run build` |
| Diretório publicado | `.next` |
| Versão do Node | 20 |
| Plugin | `@netlify/plugin-nextjs` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

---

## Licença

Projeto interno — Aero Engenharia. Todos os direitos reservados.
