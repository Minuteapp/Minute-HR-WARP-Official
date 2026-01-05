-- Migration 1: HR & Mitarbeiter (Recruiting, Onboarding) - Vollständige 80/20 Settings

-- RECRUITING Settings mit recommended_value
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  -- Bewerbungseingang
  ('recruiting', 'auto_acknowledgment', 'Automatische Empfangsbestätigung', 'Sendet automatisch Bestätigung bei Bewerbungseingang', 'boolean', 'true', 'true', 'application_receipt', true, 10),
  ('recruiting', 'cv_parsing', 'CV-Parsing aktivieren', 'Automatische Extraktion von Lebenslaufdaten', 'boolean', 'false', 'true', 'application_receipt', true, 20),
  ('recruiting', 'duplicate_detection', 'Duplikaterkennung', 'Prüft auf bereits existierende Bewerbungen', 'boolean', 'true', 'true', 'application_receipt', true, 30),
  ('recruiting', 'response_time_days', 'Reaktionszeit (Tage)', 'Maximale Tage bis zur ersten Rückmeldung', 'number', '5', '3', 'application_receipt', true, 40),
  ('recruiting', 'retention_period_months', 'Aufbewahrungsfrist (Monate)', 'Wie lange Bewerbungen gespeichert werden', 'number', '6', '6', 'application_receipt', true, 50),
  -- Prozess-Phasen
  ('recruiting', 'stage_1_name', 'Phase 1 Name', 'Bezeichnung der ersten Prozessphase', 'string', '"Erstkontakt"', '"Erstkontakt"', 'process_stages', true, 60),
  ('recruiting', 'stage_1_duration', 'Phase 1 Dauer (Tage)', 'Maximale Dauer der ersten Phase', 'number', '30', '14', 'process_stages', true, 70),
  ('recruiting', 'stage_2_name', 'Phase 2 Name', 'Bezeichnung der zweiten Prozessphase', 'string', '"Vorauswahl"', '"Interview"', 'process_stages', true, 80),
  ('recruiting', 'stage_2_duration', 'Phase 2 Dauer (Tage)', 'Maximale Dauer der zweiten Phase', 'number', '60', '21', 'process_stages', true, 90),
  ('recruiting', 'stage_3_name', 'Phase 3 Name', 'Bezeichnung der dritten Prozessphase', 'string', '"Interview"', '"Entscheidung"', 'process_stages', true, 100),
  ('recruiting', 'stage_3_duration', 'Phase 3 Dauer (Tage)', 'Maximale Dauer der dritten Phase', 'number', '45', '14', 'process_stages', true, 110),
  -- Bewertung
  ('recruiting', 'rating_scale', 'Bewertungsskala', 'Skala für Kandidatenbewertung', 'string', '"5-point"', '"5-point"', 'evaluation', true, 120),
  ('recruiting', 'min_score', 'Mindestscore', 'Mindestbewertung für Weiterleitung', 'number', '3', '3', 'evaluation', true, 130),
  ('recruiting', 'weighted_scoring', 'Gewichtete Bewertung', 'Unterschiedliche Gewichtung von Kriterien', 'boolean', 'true', 'true', 'evaluation', true, 140),
  ('recruiting', 'multi_reviewer', 'Mehrfachbewertung', 'Mehrere Bewerter pro Kandidat', 'boolean', 'true', 'true', 'evaluation', true, 150),
  -- Datenfelder
  ('recruiting', 'field_personal_data', 'Persönliche Daten', 'Name, Geburtsdatum erfassen', 'boolean', 'true', 'true', 'data_fields', true, 160),
  ('recruiting', 'field_contact_info', 'Kontaktdaten', 'E-Mail, Telefon erfassen', 'boolean', 'true', 'true', 'data_fields', true, 170),
  ('recruiting', 'field_education', 'Ausbildung', 'Bildungsweg erfassen', 'boolean', 'true', 'true', 'data_fields', true, 180),
  ('recruiting', 'field_experience', 'Berufserfahrung', 'Frühere Positionen erfassen', 'boolean', 'true', 'true', 'data_fields', true, 190),
  ('recruiting', 'field_skills', 'Fähigkeiten', 'Kompetenzen und Skills erfassen', 'boolean', 'true', 'true', 'data_fields', true, 200),
  ('recruiting', 'field_salary_expectation', 'Gehaltsvorstellung', 'Gewünschtes Gehalt erfassen', 'boolean', 'false', 'true', 'data_fields', true, 210),
  ('recruiting', 'field_availability', 'Verfügbarkeit', 'Starttermin erfassen', 'boolean', 'true', 'true', 'data_fields', true, 220),
  -- Kommunikation
  ('recruiting', 'email_templates_enabled', 'E-Mail-Vorlagen', 'Standardvorlagen für Kommunikation', 'boolean', 'true', 'true', 'communication', true, 230),
  ('recruiting', 'interview_scheduling', 'Interview-Planung', 'Automatische Terminvorschläge', 'boolean', 'true', 'true', 'communication', true, 240),
  ('recruiting', 'rejection_feedback', 'Absage-Feedback', 'Feedback bei Absagen senden', 'boolean', 'false', 'true', 'communication', true, 250)
ON CONFLICT (module, key) DO UPDATE SET
  recommended_value = EXCLUDED.recommended_value,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ONBOARDING Settings mit recommended_value
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  -- Vorlagen
  ('onboarding', 'auto_template_selection', 'Automatische Vorlagenauswahl', 'Vorlage basierend auf Position wählen', 'boolean', 'true', 'true', 'templates', true, 10),
  ('onboarding', 'templates_customizable', 'Vorlagen anpassbar', 'Vorlagen können individuell angepasst werden', 'boolean', 'true', 'true', 'templates', true, 20),
  ('onboarding', 'default_template', 'Standard-Vorlage', 'Standard-Onboarding-Vorlage', 'string', '"standard"', '"standard"', 'templates', true, 30),
  -- Aufgaben
  ('onboarding', 'enforce_order', 'Reihenfolge erzwingen', 'Aufgaben müssen in Reihenfolge abgeschlossen werden', 'boolean', 'false', 'false', 'tasks', true, 40),
  ('onboarding', 'allow_skip', 'Überspringen erlauben', 'Aufgaben können übersprungen werden', 'boolean', 'false', 'false', 'tasks', true, 50),
  ('onboarding', 'task_reminders', 'Aufgaben-Erinnerungen', 'Automatische Erinnerungen für offene Aufgaben', 'boolean', 'true', 'true', 'tasks', true, 60),
  ('onboarding', 'reminder_days_before', 'Erinnerung vor Fälligkeit (Tage)', 'Tage vor Fälligkeit für Erinnerung', 'number', '2', '3', 'tasks', true, 70),
  -- Dokumente
  ('onboarding', 'signature_required', 'Unterschrift erforderlich', 'Dokumente benötigen Unterschrift', 'boolean', 'true', 'true', 'documents', true, 80),
  ('onboarding', 'digital_signature', 'Digitale Signatur', 'Elektronische Signatur aktivieren', 'boolean', 'true', 'true', 'documents', true, 90),
  ('onboarding', 'document_approval', 'Dokumenten-Genehmigung', 'HR muss Dokumente freigeben', 'boolean', 'true', 'true', 'documents', true, 100),
  ('onboarding', 'auto_archive', 'Automatische Archivierung', 'Dokumente automatisch archivieren', 'boolean', 'true', 'true', 'documents', true, 110),
  -- Buddy-System
  ('onboarding', 'buddy_system_enabled', 'Buddy-System aktivieren', 'Mentor für neue Mitarbeiter zuweisen', 'boolean', 'true', 'true', 'buddy', true, 120),
  ('onboarding', 'buddy_duration_weeks', 'Buddy-Dauer (Wochen)', 'Wie lange Buddy-Beziehung aktiv ist', 'number', '12', '12', 'buddy', true, 130),
  ('onboarding', 'buddy_auto_assign', 'Buddy automatisch zuweisen', 'Automatische Buddy-Zuweisung', 'boolean', 'false', 'true', 'buddy', true, 140),
  ('onboarding', 'buddy_same_department', 'Buddy aus gleicher Abteilung', 'Buddy muss aus gleicher Abteilung sein', 'boolean', 'true', 'true', 'buddy', true, 150),
  -- Zeitplanung
  ('onboarding', 'auto_start_onboarding', 'Automatischer Start', 'Onboarding automatisch am ersten Tag starten', 'boolean', 'true', 'true', 'scheduling', true, 160),
  ('onboarding', 'lead_time_days', 'Vorlaufzeit (Tage)', 'Tage vor Startdatum für Vorbereitung', 'number', '10', '14', 'scheduling', true, 170),
  ('onboarding', 'probation_tracking', 'Probezeit-Tracking', 'Probezeit-Meilensteine verfolgen', 'boolean', 'true', 'true', 'scheduling', true, 180),
  ('onboarding', 'probation_duration_months', 'Probezeit (Monate)', 'Standard-Probezeitdauer', 'number', '6', '6', 'scheduling', true, 190),
  -- Benachrichtigungen
  ('onboarding', 'notify_manager', 'Manager benachrichtigen', 'Manager über Fortschritt informieren', 'boolean', 'true', 'true', 'notifications', true, 200),
  ('onboarding', 'notify_hr', 'HR benachrichtigen', 'HR über Fortschritt informieren', 'boolean', 'true', 'true', 'notifications', true, 210),
  ('onboarding', 'notify_it', 'IT benachrichtigen', 'IT über neue Mitarbeiter informieren', 'boolean', 'true', 'true', 'notifications', true, 220),
  ('onboarding', 'welcome_email', 'Willkommens-E-Mail', 'Automatische Willkommens-E-Mail senden', 'boolean', 'true', 'true', 'notifications', true, 230),
  -- Feedback
  ('onboarding', 'feedback_enabled', 'Feedback aktivieren', 'Feedback während Onboarding sammeln', 'boolean', 'true', 'true', 'feedback', true, 240),
  ('onboarding', 'feedback_week_1', 'Feedback Woche 1', 'Feedback nach erster Woche', 'boolean', 'true', 'true', 'feedback', true, 250),
  ('onboarding', 'feedback_week_4', 'Feedback Woche 4', 'Feedback nach erstem Monat', 'boolean', 'true', 'true', 'feedback', true, 260),
  ('onboarding', 'feedback_week_12', 'Feedback Woche 12', 'Feedback nach drei Monaten', 'boolean', 'true', 'true', 'feedback', true, 270),
  -- IT & Equipment
  ('onboarding', 'equipment_checklist', 'Equipment-Checkliste', 'Standardausrüstung als Checkliste', 'boolean', 'true', 'true', 'it_equipment', true, 280),
  ('onboarding', 'auto_create_accounts', 'Accounts automatisch erstellen', 'Systemzugänge automatisch anlegen', 'boolean', 'true', 'true', 'it_equipment', true, 290),
  ('onboarding', 'access_card_request', 'Zugangskarte anfordern', 'Automatische Zugangskarten-Anforderung', 'boolean', 'true', 'true', 'it_equipment', true, 300),
  -- Compliance
  ('onboarding', 'mandatory_trainings', 'Pflichtschulungen', 'Pflichtschulungen automatisch zuweisen', 'boolean', 'true', 'true', 'compliance', true, 310),
  ('onboarding', 'policy_acknowledgment', 'Richtlinien-Bestätigung', 'Bestätigung von Unternehmensrichtlinien', 'boolean', 'true', 'true', 'compliance', true, 320),
  ('onboarding', 'data_protection_training', 'Datenschutzschulung', 'DSGVO-Schulung erforderlich', 'boolean', 'true', 'true', 'compliance', true, 330),
  ('onboarding', 'safety_training', 'Sicherheitsschulung', 'Arbeitsschutz-Schulung erforderlich', 'boolean', 'true', 'true', 'compliance', true, 340)
ON CONFLICT (module, key) DO UPDATE SET
  recommended_value = EXCLUDED.recommended_value,
  name = EXCLUDED.name,
  description = EXCLUDED.description;