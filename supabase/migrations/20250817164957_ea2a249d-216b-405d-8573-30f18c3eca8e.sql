-- Dashboard-Modul Datenstrukturen

-- Widget-Typen Enum
CREATE TYPE dashboard_widget_type AS ENUM (
  'kpi_card',
  'list_compact', 
  'bar_chart',
  'line_chart',
  'progress_ring',
  'quick_actions',
  'team_status',
  'calendar_summary',
  'notification_feed',
  'favorites'
);

-- Dashboard-Layouts Tabelle
CREATE TABLE dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  device_type TEXT NOT NULL DEFAULT 'mobile',
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  visibility_rules JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard-Widgets Tabelle
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type dashboard_widget_type NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  data_source_id UUID,
  config JSONB DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  visibility_rules JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nutzer-Dashboard-Konfigurationen
CREATE TABLE user_dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  layout_id UUID,
  custom_widget_positions JSONB DEFAULT '[]',
  hidden_widgets UUID[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, layout_id)
);

-- Dashboard-Datenquellen
CREATE TABLE dashboard_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_module TEXT NOT NULL,
  query_config JSONB NOT NULL,
  cache_ttl_seconds INTEGER DEFAULT 300,
  requires_roles TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard-KI-Insights
CREATE TABLE dashboard_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies aktivieren
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies für dashboard_layouts
CREATE POLICY "Dashboard Layouts are viewable by all authenticated users"
ON dashboard_layouts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage dashboard layouts"
ON dashboard_layouts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
);

-- RLS Policies für dashboard_widgets
CREATE POLICY "Dashboard Widgets are viewable by all authenticated users"
ON dashboard_widgets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage dashboard widgets"
ON dashboard_widgets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
);

-- RLS Policies für user_dashboard_configs
CREATE POLICY "Users can view their own dashboard configs"
ON user_dashboard_configs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own dashboard configs"
ON user_dashboard_configs FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all dashboard configs"
ON user_dashboard_configs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
);

-- RLS Policies für dashboard_data_sources
CREATE POLICY "Dashboard Data Sources are viewable by authenticated users"
ON dashboard_data_sources FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage dashboard data sources"
ON dashboard_data_sources FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::user_role, 'superadmin'::user_role])
  )
);

-- RLS Policies für dashboard_ai_insights
CREATE POLICY "Users can view their own AI insights"
ON dashboard_ai_insights FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create AI insights"
ON dashboard_ai_insights FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own AI insights"
ON dashboard_ai_insights FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_layouts_updated_at
BEFORE UPDATE ON dashboard_layouts
FOR EACH ROW EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_dashboard_widgets_updated_at
BEFORE UPDATE ON dashboard_widgets
FOR EACH ROW EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_user_dashboard_configs_updated_at
BEFORE UPDATE ON user_dashboard_configs
FOR EACH ROW EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_dashboard_data_sources_updated_at
BEFORE UPDATE ON dashboard_data_sources
FOR EACH ROW EXECUTE FUNCTION update_dashboard_updated_at();

-- Indizes für Performance
CREATE INDEX idx_user_dashboard_configs_user_id ON user_dashboard_configs(user_id);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX idx_dashboard_ai_insights_user_id ON dashboard_ai_insights(user_id);
CREATE INDEX idx_dashboard_ai_insights_read ON dashboard_ai_insights(user_id, is_read);

-- Standard Dashboard-Layouts erstellen
INSERT INTO dashboard_layouts (name, description, device_type, layout_config, is_default, visibility_rules) VALUES
(
  'Mobile Standard',
  'Standard Dashboard für mobile Geräte',
  'mobile',
  '{"grid": {"columns": 2, "rowHeight": 120, "gap": 16}, "maxWidth": "100%"}',
  true,
  '{"roles": ["admin", "hr", "employee", "manager"]}'
),
(
  'Admin Dashboard Mobile',
  'Erweiterte Dashboard-Ansicht für Administratoren',
  'mobile', 
  '{"grid": {"columns": 2, "rowHeight": 140, "gap": 16}, "maxWidth": "100%"}',
  false,
  '{"roles": ["admin", "superadmin"]}'
),
(
  'HR Manager Mobile',
  'HR-spezifische Dashboard-Ansicht',
  'mobile',
  '{"grid": {"columns": 2, "rowHeight": 130, "gap": 16}, "maxWidth": "100%"}',
  false,
  '{"roles": ["hr", "admin"]}'
);

-- Standard Datenquellen erstellen
INSERT INTO dashboard_data_sources (source_name, source_module, query_config, requires_roles) VALUES
(
  'Arbeitszeit heute',
  'zeiterfassung',
  '{"metric": "hours_today", "scope": "user"}',
  ARRAY['employee', 'admin', 'hr', 'manager']
),
(
  'Team Anwesenheit',
  'zeiterfassung', 
  '{"metric": "team_presence", "scope": "team"}',
  ARRAY['manager', 'admin', 'hr']
),
(
  'Termine heute',
  'kalender',
  '{"metric": "events_today", "scope": "user"}',
  ARRAY['employee', 'admin', 'hr', 'manager']
),
(
  'Offene Aufgaben',
  'projekte',
  '{"metric": "open_tasks", "scope": "user"}',
  ARRAY['employee', 'admin', 'hr', 'manager']
),
(
  'Neue Bewerbungen',
  'recruiting',
  '{"metric": "new_applications", "scope": "company", "timeframe": "today"}',
  ARRAY['hr', 'admin']
),
(
  'Abwesenheitsanträge',
  'abwesenheit',
  '{"metric": "pending_requests", "scope": "team"}',
  ARRAY['manager', 'admin', 'hr']
);

-- Standard Dashboard-Widgets erstellen
INSERT INTO dashboard_widgets (widget_type, title, icon, data_source_id, config, position_x, position_y, width, height, visibility_rules) VALUES
(
  'kpi_card',
  'Arbeitszeit heute',
  'clock',
  (SELECT id FROM dashboard_data_sources WHERE source_name = 'Arbeitszeit heute'),
  '{"format": "time", "color": "primary", "showProgress": true}',
  0, 0, 1, 1,
  '{"roles": ["employee", "admin", "hr", "manager"]}'
),
(
  'team_status',
  'Team Status',
  'users',
  (SELECT id FROM dashboard_data_sources WHERE source_name = 'Team Anwesenheit'),
  '{"showAvatars": true, "maxAvatars": 5}',
  1, 0, 1, 1,
  '{"roles": ["manager", "admin", "hr"]}'
),
(
  'list_compact',
  'Termine heute',
  'calendar',
  (SELECT id FROM dashboard_data_sources WHERE source_name = 'Termine heute'),
  '{"maxItems": 3, "showTime": true}',
  0, 1, 1, 1,
  '{"roles": ["employee", "admin", "hr", "manager"]}'
),
(
  'kpi_card',
  'Offene Aufgaben',
  'check-square',
  (SELECT id FROM dashboard_data_sources WHERE source_name = 'Offene Aufgaben'),
  '{"format": "number", "color": "warning"}',
  1, 1, 1, 1,
  '{"roles": ["employee", "admin", "hr", "manager"]}'
),
(
  'list_compact',
  'Neue Bewerbungen',
  'user-plus',
  (SELECT id FROM dashboard_data_sources WHERE source_name = 'Neue Bewerbungen'),
  '{"maxItems": 3, "showBadge": true}',
  0, 2, 1, 1,
  '{"roles": ["hr", "admin"]}'
),
(
  'quick_actions',
  'Schnellaktionen',
  'zap',
  null,
  '{"actions": [{"label": "Krankmeldung", "route": "/absence/sick"}, {"label": "Pause starten", "route": "/time/break"}, {"label": "Schicht tauschen", "route": "/shifts/swap"}]}',
  1, 2, 1, 1,
  '{"roles": ["employee", "admin", "hr", "manager"]}'
);