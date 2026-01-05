-- Seed data for Innovation Hub Settings (nur existierende Spalten)
INSERT INTO innovation_hub_settings (
  hub_enabled, 
  scope, 
  enabled_idea_types, 
  require_status_order,
  min_evaluators, 
  voting_duration_days, 
  ai_duplicate_detection
) VALUES (
  true, 
  'company', 
  '["open_ideas", "process", "product", "service"]'::jsonb, 
  true,
  3, 
  7, 
  true
) ON CONFLICT DO NOTHING;

-- Seed data for Workflow Global Settings (nur existierende Spalten)
INSERT INTO workflow_global_settings (
  workflows_enabled, 
  enabled_modules, 
  default_timeout_hours,
  reminder_before_hours, 
  escalation_levels, 
  allow_delegation
) VALUES (
  true, 
  '["absences", "expenses", "travel", "performance", "recruiting"]'::jsonb, 
  48,
  '{24,48}'::int[], 
  3, 
  true
) ON CONFLICT DO NOTHING;

-- Seed data for Asset Settings (nur existierende Spalten)
INSERT INTO asset_settings (
  auto_generate_inventory_number, 
  inventory_number_prefix,
  enable_barcode, 
  enable_qr_code, 
  require_assignment_confirmation
) VALUES (
  true, 
  'INV', 
  true, 
  true, 
  true
) ON CONFLICT DO NOTHING;