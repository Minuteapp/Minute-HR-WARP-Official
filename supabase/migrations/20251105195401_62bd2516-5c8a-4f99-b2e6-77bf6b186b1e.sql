-- Mobile Widget Konfigurationen hinzufügen

-- Stelle sicher, dass die Tabellen existieren (falls noch nicht migriert)
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  data_source_id UUID,
  config JSONB DEFAULT '{}'::jsonb,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  visibility_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_module TEXT NOT NULL,
  query_config JSONB DEFAULT '{}'::jsonb,
  cache_ttl_seconds INTEGER DEFAULT 300,
  requires_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lösche bestehende Test-Widgets falls vorhanden
DELETE FROM dashboard_widgets WHERE title IN ('Arbeitszeit heute', 'Team', 'Termine heute', 'Aufgaben', 'Recruiting', 'Ziele');

-- Erstelle Data Sources
INSERT INTO dashboard_data_sources (source_name, source_module, query_config, cache_ttl_seconds)
VALUES 
  ('Zeiterfassung', 'zeiterfassung', '{"metric": "hours_today"}'::jsonb, 60),
  ('Team Status', 'zeiterfassung', '{"metric": "team_presence"}'::jsonb, 120),
  ('Kalender', 'kalender', '{"metric": "events_today"}'::jsonb, 300),
  ('Projekte', 'projekte', '{"metric": "open_tasks"}'::jsonb, 300),
  ('Recruiting', 'recruiting', '{"metric": "new_applications"}'::jsonb, 600),
  ('Ziele', 'goals', '{"metric": "quarterly_goals"}'::jsonb, 600)
ON CONFLICT DO NOTHING;

-- Widget 1: Zeiterfassung (KPI)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'kpi_card',
  'Arbeitszeit',
  'Clock',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "show_chart": true,
      "route": "/time",
      "refresh_interval": 60
    }
  }'::jsonb,
  0, 0, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'zeiterfassung' AND query_config->>'metric' = 'hours_today';

-- Widget 2: Team (Team Status)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'team_status',
  'Team',
  'Users',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "route": "/team",
      "refresh_interval": 120
    }
  }'::jsonb,
  1, 0, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'zeiterfassung' AND query_config->>'metric' = 'team_presence';

-- Widget 3: Termine (List)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'list_compact',
  'Termine',
  'Calendar',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "progress_color": "#2c3ad1",
      "route": "/calendar",
      "show_badge": true,
      "badge_color": "orange"
    }
  }'::jsonb,
  0, 1, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'kalender';

-- Widget 4: Aufgaben (KPI)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'kpi_card',
  'Aufgaben',
  'CheckSquare',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "progress_color": "#1f2937",
      "route": "/tasks"
    }
  }'::jsonb,
  1, 1, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'projekte';

-- Widget 5: Recruiting (List)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'list_compact',
  'Recruiting',
  'UserPlus',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "route": "/recruiting",
      "show_badge": true,
      "badge_color": "green"
    }
  }'::jsonb,
  0, 2, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'recruiting';

-- Widget 6: Ziele (Progress Ring)
INSERT INTO dashboard_widgets (
  widget_type, title, icon, data_source_id, config, 
  position_x, position_y, width, height, is_active
)
SELECT 
  'progress_ring',
  'Ziele',
  'Target',
  id,
  '{
    "supported_devices": ["mobile", "tablet", "desktop"],
    "mobile_config": {
      "color": "#2c3ad1",
      "progress_color": "#2c3ad1",
      "route": "/goals"
    }
  }'::jsonb,
  1, 2, 1, 1, true
FROM dashboard_data_sources WHERE source_module = 'goals';
