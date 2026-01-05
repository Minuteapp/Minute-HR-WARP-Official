-- Migration 5: Restliche Module - recommended_value Updates

-- Assets
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('assets', 'auto_depreciation', 'Automatische Abschreibung', 'AfA automatisch berechnen', 'boolean', 'true', 'true', 'depreciation', true, 10),
  ('assets', 'depreciation_method', 'Abschreibungsmethode', 'Standard-Abschreibungsmethode', 'string', '"linear"', '"linear"', 'depreciation', true, 20),
  ('assets', 'inventory_tracking', 'Inventar-Tracking', 'Inventar verfolgen', 'boolean', 'true', 'true', 'tracking', true, 30),
  ('assets', 'barcode_scanning', 'Barcode-Scanning', 'Barcode-Scanner unterstützen', 'boolean', 'true', 'true', 'tracking', true, 40),
  ('assets', 'maintenance_reminders', 'Wartungserinnerungen', 'Automatische Wartungserinnerungen', 'boolean', 'true', 'true', 'maintenance', true, 50),
  ('assets', 'assignment_approval', 'Zuweisungs-Genehmigung', 'Genehmigung für Asset-Zuweisung', 'boolean', 'false', 'true', 'approval', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Global Mobility
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('global_mobility', 'visa_tracking', 'Visa-Tracking', 'Visa-Status verfolgen', 'boolean', 'true', 'true', 'compliance', true, 10),
  ('global_mobility', 'work_permit_alerts', 'Arbeitserlaubnis-Warnungen', 'Warnung vor Ablauf', 'boolean', 'true', 'true', 'compliance', true, 20),
  ('global_mobility', 'relocation_support', 'Umzugsunterstützung', 'Umzugs-Workflow aktivieren', 'boolean', 'true', 'true', 'relocation', true, 30),
  ('global_mobility', 'tax_equalization', 'Steuerausgleich', 'Steuerausgleich-Berechnung', 'boolean', 'false', 'true', 'tax', true, 40),
  ('global_mobility', 'cost_tracking', 'Kosten-Tracking', 'Mobilitätskosten verfolgen', 'boolean', 'true', 'true', 'costs', true, 50),
  ('global_mobility', 'assignment_duration_months', 'Standard-Entsendungsdauer', 'Standard-Dauer in Monaten', 'number', '24', '24', 'assignments', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Notifications
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('notifications', 'email_enabled', 'E-Mail aktiviert', 'E-Mail-Benachrichtigungen', 'boolean', 'true', 'true', 'channels', true, 10),
  ('notifications', 'push_enabled', 'Push aktiviert', 'Push-Benachrichtigungen', 'boolean', 'true', 'true', 'channels', true, 20),
  ('notifications', 'sms_enabled', 'SMS aktiviert', 'SMS-Benachrichtigungen', 'boolean', 'false', 'false', 'channels', true, 30),
  ('notifications', 'digest_enabled', 'Digest aktiviert', 'Zusammenfassungen senden', 'boolean', 'true', 'true', 'digest', true, 40),
  ('notifications', 'digest_frequency', 'Digest-Häufigkeit', 'Wie oft Digest gesendet wird', 'string', '"daily"', '"daily"', 'digest', true, 50),
  ('notifications', 'quiet_hours_enabled', 'Ruhezeiten aktiv', 'Keine Benachrichtigungen in Ruhezeiten', 'boolean', 'true', 'true', 'timing', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Offboarding
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('offboarding', 'auto_start', 'Automatischer Start', 'Offboarding automatisch starten', 'boolean', 'true', 'true', 'automation', true, 10),
  ('offboarding', 'exit_interview', 'Austrittsgespräch', 'Austrittsgespräch einplanen', 'boolean', 'true', 'true', 'process', true, 20),
  ('offboarding', 'knowledge_transfer', 'Wissenstransfer', 'Wissenstransfer-Checkliste', 'boolean', 'true', 'true', 'process', true, 30),
  ('offboarding', 'equipment_return', 'Equipment-Rückgabe', 'Equipment-Rückgabe-Workflow', 'boolean', 'true', 'true', 'equipment', true, 40),
  ('offboarding', 'access_revocation', 'Zugriffsentzug', 'Automatischer Zugriffsentzug', 'boolean', 'true', 'true', 'security', true, 50),
  ('offboarding', 'notice_period_days', 'Kündigungsfrist (Tage)', 'Standard-Kündigungsfrist', 'number', '30', '30', 'process', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Orgchart
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('orgchart', 'auto_update', 'Automatische Aktualisierung', 'Organigramm automatisch aktualisieren', 'boolean', 'true', 'true', 'automation', true, 10),
  ('orgchart', 'show_photos', 'Fotos anzeigen', 'Mitarbeiterfotos im Organigramm', 'boolean', 'true', 'true', 'display', true, 20),
  ('orgchart', 'show_contact', 'Kontaktdaten anzeigen', 'Kontaktdaten im Organigramm', 'boolean', 'true', 'true', 'display', true, 30),
  ('orgchart', 'matrix_view', 'Matrix-Ansicht', 'Matrix-Organisation unterstützen', 'boolean', 'false', 'true', 'views', true, 40),
  ('orgchart', 'export_enabled', 'Export aktiviert', 'Organigramm exportieren', 'boolean', 'true', 'true', 'export', true, 50),
  ('orgchart', 'vacancy_display', 'Vakanzen anzeigen', 'Offene Stellen anzeigen', 'boolean', 'true', 'true', 'display', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Performance
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('performance', 'review_cycle', 'Bewertungszyklus', 'Wie oft Bewertungen stattfinden', 'string', '"annual"', '"annual"', 'cycles', true, 10),
  ('performance', 'self_assessment', 'Selbstbewertung', 'Selbstbewertung aktivieren', 'boolean', 'true', 'true', 'assessment', true, 20),
  ('performance', 'peer_feedback', 'Peer-Feedback', '360-Grad-Feedback', 'boolean', 'true', 'true', 'assessment', true, 30),
  ('performance', 'goal_tracking', 'Ziel-Tracking', 'Zielerreichung verfolgen', 'boolean', 'true', 'true', 'goals', true, 40),
  ('performance', 'okr_enabled', 'OKRs aktiviert', 'OKR-Methodik nutzen', 'boolean', 'false', 'true', 'goals', true, 50),
  ('performance', 'calibration_required', 'Kalibrierung erforderlich', 'Bewertungs-Kalibrierung', 'boolean', 'true', 'true', 'process', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Projects
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('projects', 'time_tracking', 'Zeiterfassung', 'Projektzeit erfassen', 'boolean', 'true', 'true', 'tracking', true, 10),
  ('projects', 'budget_tracking', 'Budget-Tracking', 'Projektbudget verfolgen', 'boolean', 'true', 'true', 'tracking', true, 20),
  ('projects', 'gantt_view', 'Gantt-Ansicht', 'Gantt-Diagramm aktivieren', 'boolean', 'true', 'true', 'views', true, 30),
  ('projects', 'kanban_view', 'Kanban-Ansicht', 'Kanban-Board aktivieren', 'boolean', 'true', 'true', 'views', true, 40),
  ('projects', 'resource_planning', 'Ressourcenplanung', 'Ressourcen planen', 'boolean', 'true', 'true', 'planning', true, 50),
  ('projects', 'milestone_tracking', 'Meilenstein-Tracking', 'Meilensteine verfolgen', 'boolean', 'true', 'true', 'tracking', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Shifts
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('shifts', 'auto_scheduling', 'Automatische Planung', 'Schichten automatisch planen', 'boolean', 'false', 'true', 'automation', true, 10),
  ('shifts', 'swap_requests', 'Tausch-Anfragen', 'Schichttausch ermöglichen', 'boolean', 'true', 'true', 'requests', true, 20),
  ('shifts', 'overtime_alerts', 'Überstunden-Warnungen', 'Warnung bei Überstunden', 'boolean', 'true', 'true', 'compliance', true, 30),
  ('shifts', 'rest_period_check', 'Ruhezeiten-Prüfung', 'Gesetzliche Ruhezeiten prüfen', 'boolean', 'true', 'true', 'compliance', true, 40),
  ('shifts', 'mobile_access', 'Mobiler Zugriff', 'Schichtplan mobil abrufen', 'boolean', 'true', 'true', 'access', true, 50),
  ('shifts', 'notification_lead_hours', 'Vorlauf-Benachrichtigung (Std)', 'Stunden vor Schichtbeginn', 'number', '24', '24', 'notifications', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Training
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('training', 'mandatory_tracking', 'Pflichtschulungen verfolgen', 'Pflichtschulungen überwachen', 'boolean', 'true', 'true', 'compliance', true, 10),
  ('training', 'certification_alerts', 'Zertifizierungs-Warnungen', 'Ablauf-Warnungen', 'boolean', 'true', 'true', 'compliance', true, 20),
  ('training', 'self_enrollment', 'Selbstanmeldung', 'Mitarbeiter können sich anmelden', 'boolean', 'true', 'true', 'enrollment', true, 30),
  ('training', 'manager_approval', 'Manager-Genehmigung', 'Genehmigung für Schulungen', 'boolean', 'false', 'true', 'approval', true, 40),
  ('training', 'feedback_required', 'Feedback erforderlich', 'Feedback nach Schulung', 'boolean', 'true', 'true', 'feedback', true, 50),
  ('training', 'budget_tracking', 'Budget-Tracking', 'Weiterbildungsbudget verfolgen', 'boolean', 'true', 'true', 'budget', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Users & Roles
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('users_roles', 'self_service', 'Self-Service', 'Mitarbeiter-Self-Service', 'boolean', 'true', 'true', 'access', true, 10),
  ('users_roles', 'profile_editing', 'Profil bearbeiten', 'Eigenes Profil bearbeiten', 'boolean', 'true', 'true', 'access', true, 20),
  ('users_roles', 'delegation_enabled', 'Delegation aktiviert', 'Stellvertretung möglich', 'boolean', 'true', 'true', 'delegation', true, 30),
  ('users_roles', 'role_inheritance', 'Rollen-Vererbung', 'Rollen vererben', 'boolean', 'true', 'true', 'roles', true, 40),
  ('users_roles', 'audit_role_changes', 'Rollenänderungen protokollieren', 'Audit für Rollenänderungen', 'boolean', 'true', 'true', 'audit', true, 50),
  ('users_roles', 'auto_deactivation', 'Automatische Deaktivierung', 'Inaktive Benutzer deaktivieren', 'boolean', 'false', 'true', 'lifecycle', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Workflows
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('workflows', 'auto_escalation', 'Automatische Eskalation', 'Bei Timeout eskalieren', 'boolean', 'true', 'true', 'escalation', true, 10),
  ('workflows', 'escalation_hours', 'Eskalation nach (Std)', 'Stunden bis Eskalation', 'number', '48', '48', 'escalation', true, 20),
  ('workflows', 'parallel_approval', 'Parallele Genehmigung', 'Parallele Genehmigungen', 'boolean', 'false', 'true', 'approval', true, 30),
  ('workflows', 'delegation_allowed', 'Delegation erlaubt', 'Aufgaben delegieren', 'boolean', 'true', 'true', 'delegation', true, 40),
  ('workflows', 'reminder_enabled', 'Erinnerungen aktiviert', 'Automatische Erinnerungen', 'boolean', 'true', 'true', 'reminders', true, 50),
  ('workflows', 'reminder_frequency_hours', 'Erinnerungs-Intervall (Std)', 'Stunden zwischen Erinnerungen', 'number', '24', '24', 'reminders', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- Workforce Planning
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('workforce_planning', 'capacity_planning', 'Kapazitätsplanung', 'Kapazität planen', 'boolean', 'true', 'true', 'planning', true, 10),
  ('workforce_planning', 'headcount_forecasting', 'Headcount-Prognose', 'Mitarbeiterzahl prognostizieren', 'boolean', 'true', 'true', 'forecasting', true, 20),
  ('workforce_planning', 'skill_gap_analysis', 'Skill-Gap-Analyse', 'Kompetenzlücken analysieren', 'boolean', 'true', 'true', 'skills', true, 30),
  ('workforce_planning', 'succession_planning', 'Nachfolgeplanung', 'Nachfolger identifizieren', 'boolean', 'false', 'true', 'succession', true, 40),
  ('workforce_planning', 'attrition_analysis', 'Fluktuationsanalyse', 'Fluktuation analysieren', 'boolean', 'true', 'true', 'analysis', true, 50),
  ('workforce_planning', 'scenario_modeling', 'Szenario-Modellierung', 'Was-wäre-wenn-Szenarien', 'boolean', 'false', 'true', 'modeling', true, 60)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;