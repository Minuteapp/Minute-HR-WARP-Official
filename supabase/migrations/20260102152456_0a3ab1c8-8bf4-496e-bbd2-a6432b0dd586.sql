-- Fehlende Zeiterfassungs-Settings für 80/20 Defaults hinzufügen
INSERT INTO settings_definitions (module, key, name, value_type, default_value, recommended_value, description, category, sort_order, is_active)
VALUES
  -- Grundeinstellungen
  ('timetracking', 'time_tracking_enabled', 'Zeiterfassung aktiv', 'boolean', 'true', 'true', 'Zeiterfassungsmodul ist aktiviert', 'general', 1, true),
  ('timetracking', 'default_work_hours', 'Standard-Arbeitsstunden', 'number', '8', '8', 'Standard-Arbeitsstunden pro Tag', 'general', 2, true),
  ('timetracking', 'booking_method', 'Buchungsmethode', 'enum', '"all"', '"all"', 'Erlaubte Buchungsmethoden (start_stop, manual, all)', 'general', 3, true),
  ('timetracking', 'round_to_minutes', 'Rundung auf Minuten', 'enum', '"1"', '"1"', 'Zeitbuchungen auf X Minuten runden (1, 5, 10, 15, 30)', 'general', 4, true),
  
  -- Strukturelle Einstellungen
  ('timetracking', 'location_specific_rules', 'Standort-spezifische Regeln', 'boolean', 'false', 'false', 'Standorte können eigene Zeitregeln definieren', 'structure', 10, true),
  ('timetracking', 'department_overrides', 'Abteilungs-Ausnahmen', 'boolean', 'true', 'true', 'Abteilungen können Zeitregeln überschreiben', 'structure', 11, true),
  ('timetracking', 'team_flex_time', 'Team-Gleitzeitanpassung', 'boolean', 'false', 'false', 'Teams können Gleitzeit selbst anpassen', 'structure', 12, true),
  ('timetracking', 'inherit_parent_settings', 'Einstellungen vererben', 'boolean', 'true', 'true', 'Untergeordnete Einheiten erben Einstellungen', 'structure', 13, true),
  
  -- Arbeitszeit-Compliance (ArbZG)
  ('timetracking', 'enforce_break_rules', 'Pausenregeln durchsetzen', 'boolean', 'true', 'true', 'Gesetzliche Pausenregeln nach ArbZG durchsetzen', 'compliance', 20, true),
  ('timetracking', 'max_daily_hours', 'Max. Tagesstunden', 'number', '10', '10', 'Maximale Arbeitsstunden pro Tag (ArbZG: 10h)', 'compliance', 21, true),
  ('timetracking', 'overtime_threshold', 'Überstunden-Schwelle', 'number', '8', '8', 'Ab dieser Stundenzahl gelten Überstunden', 'compliance', 22, true),
  ('timetracking', 'min_rest_period', 'Mindestruhezeit (Stunden)', 'number', '11', '11', 'Mindestruhezeit zwischen Arbeitstagen (ArbZG: 11h)', 'compliance', 23, true),
  ('timetracking', 'compliance_warnings', 'Compliance-Warnungen', 'boolean', 'true', 'true', 'Warnungen bei Compliance-Verstößen anzeigen', 'compliance', 24, true),
  
  -- Projekt-/Buchungsoptionen
  ('timetracking', 'require_project_booking', 'Projektbuchung erforderlich', 'boolean', 'false', 'false', 'Zeitbuchungen müssen einem Projekt zugeordnet werden', 'booking', 30, true),
  ('timetracking', 'auto_break_detection', 'Automatische Pausenerkennung', 'boolean', 'false', 'false', 'Pausen automatisch erkennen und buchen', 'booking', 31, true),
  
  -- KI-Einstellungen
  ('timetracking', 'ai_booking_suggestions', 'KI-Buchungsvorschläge', 'boolean', 'true', 'true', 'KI schlägt Buchungen basierend auf Mustern vor', 'ai', 40, true),
  ('timetracking', 'smart_reminders', 'Intelligente Erinnerungen', 'boolean', 'true', 'true', 'KI-basierte Erinnerungen für fehlende Buchungen', 'ai', 41, true),
  ('timetracking', 'ai_explainability', 'KI-Erklärbarkeit', 'boolean', 'true', 'true', 'KI muss Entscheidungen transparent erklären', 'ai', 42, true),
  
  -- Audit & Governance
  ('timetracking', 'audit_trail_enabled', 'Audit-Trail aktiv', 'boolean', 'true', 'true', 'Alle Änderungen werden protokolliert', 'governance', 50, true),
  ('timetracking', 'escalation_hours', 'Eskalation nach Stunden', 'number', '48', '48', 'Fehlende Buchungen nach X Stunden eskalieren', 'governance', 51, true),
  ('timetracking', 'data_retention_days', 'Datenaufbewahrung (Tage)', 'number', '730', '730', 'Zeitbuchungen X Tage aufbewahren (Standard: 2 Jahre)', 'governance', 52, true)
ON CONFLICT (module, key) DO UPDATE SET
  name = EXCLUDED.name,
  value_type = EXCLUDED.value_type,
  default_value = EXCLUDED.default_value,
  recommended_value = EXCLUDED.recommended_value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;