-- Phase 1: Datenbank Cleanup - Duplikate entfernen und Mobile Widgets hinzufügen

-- Schritt 1: Lösche duplizierte Widgets (behalte nur die neuesten)
DELETE FROM dashboard_widgets 
WHERE id NOT IN (
  SELECT DISTINCT ON (title, widget_type) id
  FROM dashboard_widgets
  ORDER BY title, widget_type, created_at DESC
);

-- Schritt 2: Erstelle Recruiting Widget falls nicht vorhanden
INSERT INTO dashboard_widgets (
  widget_type, 
  title, 
  icon, 
  data_source_id, 
  config, 
  position_x, 
  position_y, 
  width, 
  height, 
  is_active,
  visibility_rules
) 
SELECT 
  'list_compact', 
  'Recruiting', 
  'UserPlus',
  (SELECT id FROM dashboard_data_sources WHERE source_module = 'recruiting' LIMIT 1),
  jsonb_build_object(
    'mobile_config', jsonb_build_object(
      'color', '#2c3ad1',
      'route', '/recruiting',
      'show_badge', true,
      'badge_color', 'green'
    ),
    'supported_devices', jsonb_build_array('mobile', 'tablet', 'desktop')
  ),
  0, 
  4, 
  1, 
  1, 
  true,
  jsonb_build_object('roles', jsonb_build_array('admin', 'hr', 'manager', 'employee'))
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_widgets WHERE title = 'Recruiting' AND widget_type = 'list_compact'
);

-- Schritt 3: Erstelle Ziele Widget falls nicht vorhanden
INSERT INTO dashboard_widgets (
  widget_type, 
  title, 
  icon, 
  config, 
  position_x, 
  position_y, 
  width, 
  height, 
  is_active,
  visibility_rules
)
SELECT
  'progress_ring', 
  'Ziele', 
  'Target',
  jsonb_build_object(
    'mobile_config', jsonb_build_object(
      'color', '#2c3ad1',
      'progress_color', '#2c3ad1',
      'route', '/goals'
    ),
    'metric', 'quarterly_goals',
    'supported_devices', jsonb_build_array('mobile', 'tablet', 'desktop')
  ),
  1, 
  4, 
  1, 
  1, 
  true,
  jsonb_build_object('roles', jsonb_build_array('admin', 'hr', 'manager', 'employee'))
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_widgets WHERE title = 'Ziele' AND widget_type = 'progress_ring'
);

-- Schritt 4: Stelle sicher, dass alle bestehenden Widgets mobile_config haben
UPDATE dashboard_widgets
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'route', CASE 
      WHEN title LIKE '%Zeit%' THEN '/time'
      WHEN title LIKE '%Team%' THEN '/team'
      WHEN title LIKE '%Termin%' OR title LIKE '%Kalender%' THEN '/calendar'
      WHEN title LIKE '%Aufgabe%' THEN '/tasks'
      ELSE '/'
    END
  )
)
WHERE config->'mobile_config' IS NULL;

-- Schritt 5: Stelle sicher, dass alle Widgets supported_devices haben
UPDATE dashboard_widgets
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{supported_devices}',
  '["mobile", "tablet", "desktop"]'::jsonb
)
WHERE config->'supported_devices' IS NULL;