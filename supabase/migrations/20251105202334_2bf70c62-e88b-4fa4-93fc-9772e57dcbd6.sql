-- Phase 1: Update Widget-Konfigurationen für Mobile Dashboard

-- Zeiterfassung Widget
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'route', '/time',
    'show_badge', true,
    'badge_text', 'Live',
    'badge_color', 'green',
    'show_trend', true,
    'show_chart', true,
    'show_preview_tag', true,
    'progress_color', '#2c3ad1'
  )
)
WHERE (title LIKE '%Arbeitszeit%' OR title LIKE '%Zeit%') 
  AND widget_type = 'kpi_card';

-- Team Widget (mit blauem Border!)
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'route', '/team',
    'show_badge', true,
    'badge_text', 'Online',
    'badge_color', 'green',
    'show_trend', true,
    'show_border', true,
    'border_color', '#2c3ad1'
  )
)
WHERE title = 'Team' OR widget_type = 'team_status';

-- Kalender Widget
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'progress_color', '#2c3ad1',
    'route', '/calendar',
    'show_badge', true,
    'badge_text', 'Heute',
    'badge_color', 'orange'
  )
)
WHERE title LIKE '%Termin%' OR title LIKE '%Kalender%';

-- Aufgaben Widget (SCHWARZE Progress-Bar!)
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'progress_color', '#1f2937',
    'route', '/tasks',
    'show_trend', true
  )
)
WHERE title LIKE '%Aufgabe%';

-- Recruiting Widget
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'route', '/recruiting',
    'show_badge', true,
    'badge_text', 'Neu',
    'badge_color', 'green'
  )
)
WHERE title = 'Recruiting';

-- Ziele Widget
UPDATE dashboard_widgets 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{mobile_config}',
  jsonb_build_object(
    'color', '#2c3ad1',
    'progress_color', '#2c3ad1',
    'route', '/goals',
    'show_trend', true
  )
)
WHERE title = 'Ziele';