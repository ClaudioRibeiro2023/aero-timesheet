-- ============================================================================
-- Aero Timesheet — Migration 001: Criação de Tabelas
-- ============================================================================
-- Cria toda a estrutura do banco: profiles, projects, timesheet_weeks,
-- timesheet_entries, approval_logs + views + RLS + seed data.
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('colaborador', 'gestor', 'administrador');
CREATE TYPE timesheet_status AS ENUM ('rascunho', 'submetido', 'aprovado', 'rejeitado');
CREATE TYPE timesheet_category AS ENUM ('regular', 'hora_extra', 'viagem', 'treinamento');
CREATE TYPE approval_action AS ENUM ('submetido', 'aprovado', 'rejeitado', 'reaberto');

-- ============================================================================
-- TABELA: profiles (estende auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cargo         user_role NOT NULL DEFAULT 'colaborador',
  departamento  TEXT NOT NULL DEFAULT 'Geral',
  gestor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfil do colaborador, estende auth.users do Supabase';
COMMENT ON COLUMN profiles.gestor_id IS 'FK do gestor direto para fluxo de aprovação';

CREATE INDEX idx_profiles_cargo ON profiles(cargo);
CREATE INDEX idx_profiles_departamento ON profiles(departamento);
CREATE INDEX idx_profiles_gestor_id ON profiles(gestor_id);

-- ============================================================================
-- TABELA: projects (contratos/projetos para alocação de horas)
-- ============================================================================

CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo         TEXT NOT NULL UNIQUE,
  nome           TEXT NOT NULL,
  cliente        TEXT NOT NULL,
  descricao      TEXT,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  orcamento_horas NUMERIC(10, 2),
  data_inicio    DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim       DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE projects IS 'Projetos/contratos onde horas são alocadas';

CREATE INDEX idx_projects_codigo ON projects(codigo);
CREATE INDEX idx_projects_ativo ON projects(ativo);
CREATE INDEX idx_projects_cliente ON projects(cliente);

-- ============================================================================
-- TABELA: timesheet_weeks (cabeçalho semanal)
-- ============================================================================

CREATE TABLE timesheet_weeks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semana_inicio   DATE NOT NULL,                          -- Sempre segunda-feira
  semana_fim      DATE NOT NULL,                          -- Sempre domingo
  status          timesheet_status NOT NULL DEFAULT 'rascunho',
  total_horas     NUMERIC(6, 2) NOT NULL DEFAULT 0,       -- Calculado via trigger
  observacoes     TEXT,
  submetido_em    TIMESTAMPTZ,
  aprovado_por    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_em     TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Um único timesheet por colaborador por semana
  CONSTRAINT uq_user_week UNIQUE (user_id, semana_inicio),
  -- semana_inicio deve ser segunda-feira (dow = 1)
  CONSTRAINT chk_semana_inicio_segunda CHECK (EXTRACT(ISODOW FROM semana_inicio) = 1),
  -- semana_fim = semana_inicio + 6 dias
  CONSTRAINT chk_semana_fim CHECK (semana_fim = semana_inicio + INTERVAL '6 days')
);

COMMENT ON TABLE timesheet_weeks IS 'Cabeçalho do timesheet semanal de cada colaborador';

CREATE INDEX idx_timesheet_weeks_user_id ON timesheet_weeks(user_id);
CREATE INDEX idx_timesheet_weeks_status ON timesheet_weeks(status);
CREATE INDEX idx_timesheet_weeks_semana ON timesheet_weeks(semana_inicio);
CREATE INDEX idx_timesheet_weeks_aprovado_por ON timesheet_weeks(aprovado_por);

-- ============================================================================
-- TABELA: timesheet_entries (lançamentos individuais por linha)
-- ============================================================================

CREATE TABLE timesheet_entries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_week_id UUID NOT NULL REFERENCES timesheet_weeks(id) ON DELETE CASCADE,
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  categoria         timesheet_category NOT NULL DEFAULT 'regular',
  descricao         TEXT,
  horas_seg         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_seg >= 0 AND horas_seg <= 24),
  horas_ter         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_ter >= 0 AND horas_ter <= 24),
  horas_qua         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_qua >= 0 AND horas_qua <= 24),
  horas_qui         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_qui >= 0 AND horas_qui <= 24),
  horas_sex         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_sex >= 0 AND horas_sex <= 24),
  horas_sab         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_sab >= 0 AND horas_sab <= 24),
  horas_dom         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (horas_dom >= 0 AND horas_dom <= 24),
  total_linha       NUMERIC(6, 2) NOT NULL GENERATED ALWAYS AS (
    horas_seg + horas_ter + horas_qua + horas_qui + horas_sex + horas_sab + horas_dom
  ) STORED,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Mesmo projeto+categoria só uma vez por semana
  CONSTRAINT uq_entry_project_category UNIQUE (timesheet_week_id, project_id, categoria)
);

COMMENT ON TABLE timesheet_entries IS 'Lançamentos de horas por projeto/categoria dentro de uma semana';

CREATE INDEX idx_entries_timesheet_week ON timesheet_entries(timesheet_week_id);
CREATE INDEX idx_entries_project ON timesheet_entries(project_id);
CREATE INDEX idx_entries_categoria ON timesheet_entries(categoria);

-- ============================================================================
-- TABELA: approval_logs (trilha de auditoria)
-- ============================================================================

CREATE TABLE approval_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_week_id UUID NOT NULL REFERENCES timesheet_weeks(id) ON DELETE CASCADE,
  acao              approval_action NOT NULL,
  realizado_por     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comentario        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE approval_logs IS 'Histórico imutável de ações sobre timesheets';

CREATE INDEX idx_approval_logs_timesheet ON approval_logs(timesheet_week_id);
CREATE INDEX idx_approval_logs_acao ON approval_logs(acao);
CREATE INDEX idx_approval_logs_realizado_por ON approval_logs(realizado_por);

-- ============================================================================
-- TRIGGER: Atualizar total_horas no timesheet_weeks
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_recalcular_total_horas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timesheet_weeks
  SET total_horas = (
    SELECT COALESCE(SUM(
      horas_seg + horas_ter + horas_qua + horas_qui + horas_sex + horas_sab + horas_dom
    ), 0)
    FROM timesheet_entries
    WHERE timesheet_week_id = COALESCE(NEW.timesheet_week_id, OLD.timesheet_week_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.timesheet_week_id, OLD.timesheet_week_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_recalcular_total_horas
AFTER INSERT OR UPDATE OR DELETE ON timesheet_entries
FOR EACH ROW EXECUTE FUNCTION fn_recalcular_total_horas();

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_timesheet_weeks_updated_at
  BEFORE UPDATE ON timesheet_weeks FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- ============================================================================
-- TRIGGER: Criar perfil automaticamente ao registrar usuário
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nome_completo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- ============================================================================
-- VIEWS: Agregações para dashboard
-- ============================================================================

-- Horas agrupadas por projeto
CREATE OR REPLACE VIEW vw_horas_por_projeto AS
SELECT
  p.id                AS project_id,
  p.nome              AS projeto_nome,
  p.codigo            AS projeto_codigo,
  p.cliente,
  COALESCE(SUM(e.total_linha), 0)                                         AS total_horas,
  COALESCE(SUM(CASE WHEN e.categoria = 'regular'      THEN e.total_linha END), 0) AS horas_regular,
  COALESCE(SUM(CASE WHEN e.categoria = 'hora_extra'    THEN e.total_linha END), 0) AS horas_extra,
  COALESCE(SUM(CASE WHEN e.categoria = 'viagem'        THEN e.total_linha END), 0) AS horas_viagem,
  COALESCE(SUM(CASE WHEN e.categoria = 'treinamento'   THEN e.total_linha END), 0) AS horas_treinamento
FROM projects p
LEFT JOIN timesheet_entries e ON e.project_id = p.id
LEFT JOIN timesheet_weeks tw ON tw.id = e.timesheet_week_id AND tw.status = 'aprovado'
GROUP BY p.id, p.nome, p.codigo, p.cliente;

-- Horas agrupadas por colaborador
CREATE OR REPLACE VIEW vw_horas_por_colaborador AS
SELECT
  pr.id                AS user_id,
  pr.nome_completo,
  pr.departamento,
  COALESCE(SUM(tw.total_horas), 0)                                          AS total_horas,
  COUNT(CASE WHEN tw.status = 'submetido' THEN 1 END)                       AS semanas_submetidas,
  COUNT(CASE WHEN tw.status = 'aprovado'  THEN 1 END)                       AS semanas_aprovadas,
  COUNT(CASE WHEN tw.status IN ('rascunho', 'rejeitado') THEN 1 END)        AS semanas_pendentes
FROM profiles pr
LEFT JOIN timesheet_weeks tw ON tw.user_id = pr.id
GROUP BY pr.id, pr.nome_completo, pr.departamento;

-- Resumo semanal geral
CREATE OR REPLACE VIEW vw_resumo_semanal AS
SELECT
  tw.semana_inicio,
  COUNT(DISTINCT tw.user_id)                                     AS total_colaboradores,
  COALESCE(SUM(tw.total_horas), 0)                               AS total_horas,
  COUNT(CASE WHEN tw.status = 'submetido' THEN 1 END)            AS timesheets_submetidos,
  COUNT(CASE WHEN tw.status = 'aprovado'  THEN 1 END)            AS timesheets_aprovados,
  COUNT(CASE WHEN tw.status = 'rejeitado' THEN 1 END)            AS timesheets_rejeitados,
  COUNT(CASE WHEN tw.status = 'rascunho'  THEN 1 END)            AS timesheets_rascunho
FROM timesheet_weeks tw
GROUP BY tw.semana_inicio
ORDER BY tw.semana_inicio DESC;

-- ============================================================================
-- FUNÇÃO: get_dashboard_summary (para chamada via RPC)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_summary(
  periodo_inicio DATE DEFAULT NULL,
  periodo_fim    DATE DEFAULT NULL,
  p_project_id   UUID DEFAULT NULL,
  p_user_id      UUID DEFAULT NULL,
  p_departamento TEXT DEFAULT NULL,
  p_status       timesheet_status DEFAULT NULL
)
RETURNS TABLE (
  semana_inicio         DATE,
  total_colaboradores   BIGINT,
  total_horas           NUMERIC,
  timesheets_submetidos BIGINT,
  timesheets_aprovados  BIGINT,
  timesheets_rejeitados BIGINT,
  timesheets_rascunho   BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tw.semana_inicio,
    COUNT(DISTINCT tw.user_id)                                     AS total_colaboradores,
    COALESCE(SUM(tw.total_horas), 0)                               AS total_horas,
    COUNT(CASE WHEN tw.status = 'submetido' THEN 1 END)            AS timesheets_submetidos,
    COUNT(CASE WHEN tw.status = 'aprovado'  THEN 1 END)            AS timesheets_aprovados,
    COUNT(CASE WHEN tw.status = 'rejeitado' THEN 1 END)            AS timesheets_rejeitados,
    COUNT(CASE WHEN tw.status = 'rascunho'  THEN 1 END)            AS timesheets_rascunho
  FROM timesheet_weeks tw
  LEFT JOIN profiles pr ON pr.id = tw.user_id
  WHERE
    (periodo_inicio IS NULL OR tw.semana_inicio >= periodo_inicio)
    AND (periodo_fim IS NULL OR tw.semana_inicio <= periodo_fim)
    AND (p_user_id IS NULL OR tw.user_id = p_user_id)
    AND (p_departamento IS NULL OR pr.departamento = p_departamento)
    AND (p_status IS NULL OR tw.status = p_status)
    AND (p_project_id IS NULL OR EXISTS (
      SELECT 1 FROM timesheet_entries e
      WHERE e.timesheet_week_id = tw.id AND e.project_id = p_project_id
    ))
  GROUP BY tw.semana_inicio
  ORDER BY tw.semana_inicio DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles: todos podem ver, cada um edita o próprio
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_all ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins podem atualizar qualquer perfil
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND cargo = 'administrador')
  );

-- ---------------------------------------------------------------------------
-- projects: todos autenticados podem ver, admins gerenciam
-- ---------------------------------------------------------------------------

CREATE POLICY projects_select_authenticated ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY projects_insert_admin ON projects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND cargo = 'administrador')
  );

CREATE POLICY projects_update_admin ON projects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND cargo = 'administrador')
  );

CREATE POLICY projects_delete_admin ON projects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND cargo = 'administrador')
  );

-- ---------------------------------------------------------------------------
-- timesheet_weeks: colaboradores veem os próprios, gestores veem do departamento
-- ---------------------------------------------------------------------------

CREATE POLICY tw_select_own ON timesheet_weeks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY tw_select_manager ON timesheet_weeks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles gestor
      WHERE gestor.id = auth.uid()
        AND gestor.cargo IN ('gestor', 'administrador')
        AND EXISTS (
          SELECT 1 FROM profiles subordinado
          WHERE subordinado.id = timesheet_weeks.user_id
            AND (
              subordinado.gestor_id = auth.uid()
              OR subordinado.departamento = gestor.departamento
              OR gestor.cargo = 'administrador'
            )
        )
    )
  );

CREATE POLICY tw_insert_own ON timesheet_weeks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY tw_update_own_draft ON timesheet_weeks
  FOR UPDATE USING (
    auth.uid() = user_id AND status IN ('rascunho', 'rejeitado')
  );

-- Gestores podem atualizar status (aprovar/rejeitar)
CREATE POLICY tw_update_manager ON timesheet_weeks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles gestor
      WHERE gestor.id = auth.uid()
        AND gestor.cargo IN ('gestor', 'administrador')
        AND EXISTS (
          SELECT 1 FROM profiles subordinado
          WHERE subordinado.id = timesheet_weeks.user_id
            AND (
              subordinado.gestor_id = auth.uid()
              OR subordinado.departamento = gestor.departamento
              OR gestor.cargo = 'administrador'
            )
        )
    )
  );

CREATE POLICY tw_delete_own_draft ON timesheet_weeks
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'rascunho'
  );

-- ---------------------------------------------------------------------------
-- timesheet_entries: segue permissão do timesheet_week pai
-- ---------------------------------------------------------------------------

CREATE POLICY te_select_own ON timesheet_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw WHERE tw.id = timesheet_week_id AND tw.user_id = auth.uid()
    )
  );

CREATE POLICY te_select_manager ON timesheet_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw
      JOIN profiles subordinado ON subordinado.id = tw.user_id
      JOIN profiles gestor ON gestor.id = auth.uid()
      WHERE tw.id = timesheet_week_id
        AND gestor.cargo IN ('gestor', 'administrador')
        AND (
          subordinado.gestor_id = auth.uid()
          OR subordinado.departamento = gestor.departamento
          OR gestor.cargo = 'administrador'
        )
    )
  );

CREATE POLICY te_insert_own ON timesheet_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw
      WHERE tw.id = timesheet_week_id
        AND tw.user_id = auth.uid()
        AND tw.status IN ('rascunho', 'rejeitado')
    )
  );

CREATE POLICY te_update_own ON timesheet_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw
      WHERE tw.id = timesheet_week_id
        AND tw.user_id = auth.uid()
        AND tw.status IN ('rascunho', 'rejeitado')
    )
  );

CREATE POLICY te_delete_own ON timesheet_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw
      WHERE tw.id = timesheet_week_id
        AND tw.user_id = auth.uid()
        AND tw.status IN ('rascunho', 'rejeitado')
    )
  );

-- ---------------------------------------------------------------------------
-- approval_logs: visível para dono do timesheet e gestores
-- ---------------------------------------------------------------------------

CREATE POLICY al_select_own ON approval_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks tw
      WHERE tw.id = timesheet_week_id AND tw.user_id = auth.uid()
    )
  );

CREATE POLICY al_select_manager ON approval_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND cargo IN ('gestor', 'administrador')
    )
  );

CREATE POLICY al_insert_authenticated ON approval_logs
  FOR INSERT WITH CHECK (auth.uid() = realizado_por);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- 5 projetos de exemplo
INSERT INTO projects (id, codigo, nome, cliente, descricao, ativo, orcamento_horas, data_inicio) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'AER-2026-001', 'Plataforma Aeroespacial X1', 'Embraer', 'Projeto principal de engenharia aeroespacial', TRUE, 2000, '2026-01-06'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'AER-2026-002', 'Sistema de Telemetria T3', 'INPE', 'Desenvolvimento do sistema de telemetria para satélites', TRUE, 1500, '2026-02-03'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'AER-2026-003', 'Manutenção Frota Legacy', 'LATAM', 'Contrato de manutenção preventiva', TRUE, 800, '2026-01-13'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'AER-2026-004', 'Consultoria Regulatória ANAC', 'GOL', 'Assessoria para certificações ANAC/FAA', TRUE, 400, '2026-03-03'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'INT-2026-001', 'Atividades Internas', 'Aero Engenharia', 'Reuniões, treinamentos e atividades internas', TRUE, NULL, '2026-01-06');

-- NOTA: Os perfis de seed são criados automaticamente via trigger quando
-- os usuários se registram no Supabase Auth. Para ambiente de dev, insira
-- manualmente após criar usuários no painel Auth:
--
-- Exemplo (rodar manualmente após criar usuários):
-- UPDATE profiles SET nome_completo = 'Claudio Ribeiro', cargo = 'administrador', departamento = 'Diretoria' WHERE email = 'admin@aero.eng.br';
-- UPDATE profiles SET nome_completo = 'Ana Costa', cargo = 'gestor', departamento = 'Engenharia' WHERE email = 'gestor@aero.eng.br';
-- UPDATE profiles SET nome_completo = 'Pedro Silva', cargo = 'colaborador', departamento = 'Engenharia', gestor_id = (SELECT id FROM profiles WHERE email = 'gestor@aero.eng.br') WHERE email = 'colab@aero.eng.br';
