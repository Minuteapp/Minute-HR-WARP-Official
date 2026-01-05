-- Settings-Definitions für ALLE fehlenden Module
-- Korrigierte Syntax: PostgreSQL ARRAY-Format

-- ===============================================
-- MODUL: recruiting (Recruiting & Bewerbungen)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('recruiting', 'self_application_allowed', 'Interne Bewerbungen erlaubt', 'Ermöglicht internen Mitarbeitern sich auf Stellen zu bewerben', 'boolean', 'true', ARRAY['Stellenportal', 'Bewerbungsformular', 'Interne Mobilität'], 'Bewerbungen', true),
('recruiting', 'auto_response_enabled', 'Automatische Eingangsbestätigung', 'Sendet automatisch eine Bestätigungs-E-Mail bei neuen Bewerbungen', 'boolean', 'true', ARRAY['E-Mail-Versand', 'Bewerber-Kommunikation'], 'Kommunikation', true),
('recruiting', 'interview_scheduling_mode', 'Interview-Terminierung', 'Wie sollen Interviews terminiert werden', 'enum', '"manual"', ARRAY['Kalender-Integration', 'Bewerber-Portal', 'Terminvorschläge'], 'Prozess', true),
('recruiting', 'gdpr_retention_days', 'Aufbewahrungsfrist Bewerberdaten (Tage)', 'Wie lange werden Bewerberdaten nach Absage aufbewahrt', 'number', '180', ARRAY['Datenschutz', 'Automatische Löschung', 'Compliance'], 'Datenschutz', true),
('recruiting', 'approval_workflow_required', 'Genehmigungsworkflow für Stellenausschreibungen', 'Neue Stellen müssen vor Veröffentlichung genehmigt werden', 'boolean', 'true', ARRAY['Stellenfreigabe', 'Workflow', 'Manager-Genehmigung'], 'Prozess', true),
('recruiting', 'candidate_scoring_enabled', 'Bewerber-Scoring aktivieren', 'KI-gestützte Bewertung von Bewerbungen', 'boolean', 'false', ARRAY['KI-Analyse', 'Ranking', 'Bewerber-Übersicht'], 'KI', true);

-- ===============================================
-- MODUL: onboarding (Mitarbeiter-Einarbeitung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('onboarding', 'auto_task_assignment', 'Automatische Aufgabenzuweisung', 'Weist Onboarding-Aufgaben automatisch zu', 'boolean', 'true', ARRAY['Aufgaben-Erstellung', 'Workflow', 'Checklisten'], 'Automatisierung', true),
('onboarding', 'buddy_system_enabled', 'Buddy-System aktivieren', 'Weist neuen Mitarbeitern automatisch einen Buddy zu', 'boolean', 'false', ARRAY['Buddy-Zuweisung', 'Mitarbeiter-Betreuung', 'Benachrichtigungen'], 'Betreuung', true),
('onboarding', 'pre_boarding_enabled', 'Pre-Boarding aktivieren', 'Ermöglicht Zugang vor dem ersten Arbeitstag', 'boolean', 'true', ARRAY['Portal-Zugang', 'Dokumenten-Upload', 'Vorab-Informationen'], 'Prozess', true),
('onboarding', 'default_duration_days', 'Standard-Onboarding-Dauer (Tage)', 'Wie lange dauert der Onboarding-Prozess standardmäßig', 'number', '90', ARRAY['Fortschritts-Tracking', 'Zeitplanung', 'Reports'], 'Prozess', true),
('onboarding', 'equipment_request_enabled', 'Equipment-Bestellung aktivieren', 'IT-Ausstattung kann während Onboarding angefordert werden', 'boolean', 'true', ARRAY['Asset-Management', 'IT-Bestellung', 'Checklisten'], 'Assets', true),
('onboarding', 'progress_notifications', 'Fortschritts-Benachrichtigungen', 'Wer erhält Updates zum Onboarding-Fortschritt', 'enum', '"manager_hr"', ARRAY['E-Mail', 'Benachrichtigungen', 'Dashboard'], 'Kommunikation', true);

-- ===============================================
-- MODUL: offboarding (Mitarbeiter-Austritt)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('offboarding', 'exit_interview_required', 'Austrittsgespräch erforderlich', 'Ein Austrittsgespräch muss dokumentiert werden', 'boolean', 'true', ARRAY['Exit-Interview', 'Checkliste', 'Dokumentation'], 'Prozess', true),
('offboarding', 'auto_deactivation_enabled', 'Automatische Account-Deaktivierung', 'Deaktiviert Zugänge automatisch am letzten Arbeitstag', 'boolean', 'true', ARRAY['Zugangs-Management', 'IT-Security', 'Automatisierung'], 'Security', true),
('offboarding', 'knowledge_transfer_required', 'Wissenstransfer erforderlich', 'Ein Wissenstransfer-Dokument muss erstellt werden', 'boolean', 'false', ARRAY['Dokumentation', 'Checkliste', 'Übergabe'], 'Prozess', true),
('offboarding', 'notice_period_check', 'Kündigungsfrist prüfen', 'System prüft automatisch die Einhaltung der Kündigungsfrist', 'boolean', 'true', ARRAY['Validierung', 'Kalender', 'Warnungen'], 'Compliance', true),
('offboarding', 'asset_return_tracking', 'Asset-Rückgabe tracken', 'Verfolgt die Rückgabe von Firmeneigentum', 'boolean', 'true', ARRAY['Asset-Management', 'Checkliste', 'Inventar'], 'Assets', true);

-- ===============================================
-- MODUL: performance (Leistungsbewertung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('performance', 'review_cycle', 'Bewertungszyklus', 'Wie oft finden Leistungsbewertungen statt', 'enum', '"annual"', ARRAY['Terminplanung', 'Erinnerungen', 'Reports'], 'Prozess', true),
('performance', 'self_assessment_required', 'Selbstbewertung erforderlich', 'Mitarbeiter müssen eine Selbstbewertung abgeben', 'boolean', 'true', ARRAY['Bewertungsformular', 'Workflow', 'Vollständigkeit'], 'Prozess', true),
('performance', 'peer_feedback_enabled', 'Peer-Feedback aktivieren', 'Ermöglicht Feedback von Kollegen', 'boolean', 'false', ARRAY['360-Grad-Feedback', 'Feedback-Anfragen', 'Anonymität'], 'Feedback', true),
('performance', 'goal_setting_mode', 'Zielsetzungs-Modus', 'Wie werden Ziele definiert', 'enum', '"okr"', ARRAY['Zielvereinbarung', 'KPIs', 'Tracking'], 'Ziele', true),
('performance', 'rating_scale', 'Bewertungsskala', 'Welche Skala wird für Bewertungen verwendet', 'enum', '"5_point"', ARRAY['Bewertungsformular', 'Reports', 'Analysen'], 'Bewertung', true),
('performance', 'calibration_required', 'Kalibrierung erforderlich', 'Bewertungen müssen in Kalibrierungs-Meetings abgestimmt werden', 'boolean', 'false', ARRAY['Workflow', 'Manager-Meeting', 'Fairness'], 'Prozess', true);

-- ===============================================
-- MODUL: training (Weiterbildung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('training', 'mandatory_training_enabled', 'Pflichtschulungen aktivieren', 'System verfolgt Pflichtschulungen und Deadlines', 'boolean', 'true', ARRAY['Schulungs-Tracking', 'Erinnerungen', 'Compliance'], 'Compliance', true),
('training', 'self_enrollment_allowed', 'Selbstanmeldung erlaubt', 'Mitarbeiter können sich selbst für Schulungen anmelden', 'boolean', 'true', ARRAY['Anmeldung', 'Katalog', 'Buchung'], 'Prozess', true),
('training', 'approval_required', 'Genehmigung erforderlich', 'Schulungsanmeldungen müssen genehmigt werden', 'boolean', 'false', ARRAY['Workflow', 'Manager-Genehmigung', 'Budget'], 'Prozess', true),
('training', 'budget_tracking_enabled', 'Weiterbildungsbudget tracken', 'Verfolgt das Weiterbildungsbudget pro Mitarbeiter', 'boolean', 'true', ARRAY['Budget', 'Kosten', 'Reports'], 'Budget', true),
('training', 'certificates_expiry_warning_days', 'Zertifikats-Ablaufwarnung (Tage)', 'Tage vorher wird vor ablaufenden Zertifikaten gewarnt', 'number', '30', ARRAY['Erinnerungen', 'Compliance', 'Dashboard'], 'Zertifikate', true),
('training', 'external_providers_allowed', 'Externe Anbieter erlaubt', 'Schulungen von externen Anbietern sind buchbar', 'boolean', 'true', ARRAY['Schulungskatalog', 'Buchung', 'Integration'], 'Anbieter', true);

-- ===============================================
-- MODUL: payroll (Gehaltsabrechnung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('payroll', 'pay_period', 'Abrechnungszeitraum', 'Wie oft erfolgt die Gehaltsabrechnung', 'enum', '"monthly"', ARRAY['Abrechnung', 'Zahlungstermine', 'Reports'], 'Prozess', true),
('payroll', 'auto_calculation_enabled', 'Automatische Berechnung', 'Löhne werden automatisch berechnet', 'boolean', 'true', ARRAY['Berechnung', 'Zulagen', 'Abzüge'], 'Automatisierung', true),
('payroll', 'overtime_auto_import', 'Überstunden automatisch importieren', 'Überstunden aus Zeiterfassung werden automatisch übernommen', 'boolean', 'true', ARRAY['Zeiterfassung-Integration', 'Berechnung', 'Validierung'], 'Integration', true),
('payroll', 'bonus_approval_required', 'Bonus-Genehmigung erforderlich', 'Boni müssen vor Auszahlung genehmigt werden', 'boolean', 'true', ARRAY['Workflow', 'Genehmigung', 'Budget'], 'Prozess', true),
('payroll', 'payslip_delivery', 'Gehaltsabrechnung-Zustellung', 'Wie werden Gehaltsabrechnungen zugestellt', 'enum', '"portal"', ARRAY['E-Mail', 'Portal', 'Download'], 'Zustellung', true),
('payroll', 'tax_calculation_mode', 'Steuerberechnung', 'Wie werden Steuern berechnet', 'enum', '"automatic"', ARRAY['Steuer', 'Berechnung', 'Compliance'], 'Steuern', true);

-- ===============================================
-- MODUL: expenses (Spesenabrechnung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('expenses', 'receipt_required', 'Beleg erforderlich', 'Für Spesenanträge ist ein Beleg erforderlich', 'boolean', 'true', ARRAY['Upload', 'Validierung', 'Genehmigung'], 'Dokumentation', true),
('expenses', 'auto_approval_limit', 'Auto-Genehmigungsgrenze (EUR)', 'Beträge unter diesem Limit werden automatisch genehmigt', 'number', '50', ARRAY['Workflow', 'Genehmigung', 'Automatisierung'], 'Genehmigung', true),
('expenses', 'mileage_rate', 'Kilometerpauschale (EUR)', 'Erstattungssatz pro gefahrenem Kilometer', 'number', '0.30', ARRAY['Berechnung', 'Fahrtkosten', 'Erstattung'], 'Erstattung', true),
('expenses', 'per_diem_enabled', 'Tagespauschalen aktivieren', 'Automatische Berechnung von Tagespauschalen', 'boolean', 'true', ARRAY['Reisekosten', 'Berechnung', 'Verpflegung'], 'Tagespauschalen', true),
('expenses', 'project_allocation_required', 'Projekt-Zuordnung erforderlich', 'Spesen müssen einem Projekt zugeordnet werden', 'boolean', 'false', ARRAY['Kostenstellen', 'Projekte', 'Reporting'], 'Zuordnung', true),
('expenses', 'currency_conversion', 'Währungsumrechnung', 'Automatische Umrechnung von Fremdwährungen', 'boolean', 'true', ARRAY['Berechnung', 'Wechselkurse', 'Internationale Spesen'], 'Währung', true);

-- ===============================================
-- MODUL: assets (IT und Equipment)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('assets', 'auto_assignment', 'Automatische Zuweisung', 'Assets werden bei Onboarding automatisch zugewiesen', 'boolean', 'false', ARRAY['Onboarding', 'Zuweisung', 'Inventar'], 'Automatisierung', true),
('assets', 'return_reminder_days', 'Rückgabe-Erinnerung (Tage)', 'Tage vor Rückgabedatum wird erinnert', 'number', '7', ARRAY['Erinnerungen', 'Offboarding', 'Benachrichtigungen'], 'Erinnerungen', true),
('assets', 'depreciation_tracking', 'Abschreibung tracken', 'Verfolgt die Abschreibung von Assets', 'boolean', 'true', ARRAY['Finanzen', 'Inventarwert', 'Reports'], 'Finanzen', true),
('assets', 'maintenance_scheduling', 'Wartungsplanung aktivieren', 'Ermöglicht die Planung von Wartungsintervallen', 'boolean', 'true', ARRAY['Kalender', 'Erinnerungen', 'Wartung'], 'Wartung', true),
('assets', 'qr_code_enabled', 'QR-Code-Tracking', 'Assets erhalten QR-Codes für schnelles Scannen', 'boolean', 'true', ARRAY['Inventar', 'Mobile App', 'Tracking'], 'Tracking', true),
('assets', 'approval_required_over', 'Genehmigung ab (EUR)', 'Asset-Anfragen über diesem Betrag benötigen Genehmigung', 'number', '500', ARRAY['Workflow', 'Budget', 'Genehmigung'], 'Genehmigung', true);

-- ===============================================
-- MODUL: workflows (Workflow-Management)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('workflows', 'parallel_approvals', 'Parallele Genehmigungen', 'Ermöglicht gleichzeitige Genehmigung durch mehrere Personen', 'boolean', 'false', ARRAY['Genehmigungsworkflow', 'Geschwindigkeit', 'Flexibilität'], 'Genehmigung', true),
('workflows', 'escalation_enabled', 'Eskalation aktivieren', 'Automatische Eskalation bei Überschreitung der Frist', 'boolean', 'true', ARRAY['Eskalation', 'Benachrichtigungen', 'SLA'], 'Eskalation', true),
('workflows', 'escalation_hours', 'Eskalation nach (Stunden)', 'Nach wie vielen Stunden wird eskaliert', 'number', '48', ARRAY['Eskalation', 'Fristen', 'Automatisierung'], 'Eskalation', true),
('workflows', 'delegation_allowed', 'Delegation erlaubt', 'Genehmiger können ihre Aufgaben delegieren', 'boolean', 'true', ARRAY['Vertretung', 'Flexibilität', 'Abwesenheit'], 'Delegation', true),
('workflows', 'auto_reminder_hours', 'Automatische Erinnerung (Stunden)', 'Wann wird an ausstehende Genehmigungen erinnert', 'number', '24', ARRAY['Erinnerungen', 'E-Mail', 'Produktivität'], 'Erinnerungen', true),
('workflows', 'audit_trail_enabled', 'Audit-Trail aktivieren', 'Alle Workflow-Aktionen werden protokolliert', 'boolean', 'true', ARRAY['Compliance', 'Nachverfolgung', 'Transparenz'], 'Audit', true);

-- ===============================================
-- MODUL: projects (Projekte)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('projects', 'time_tracking_required', 'Zeiterfassung auf Projekte erforderlich', 'Arbeitszeit muss Projekten zugeordnet werden', 'boolean', 'false', ARRAY['Zeiterfassung', 'Validierung', 'Kostenstellen'], 'Zeiterfassung', true),
('projects', 'budget_tracking_enabled', 'Projektbudget tracken', 'Verfolgt Budget vs tatsächliche Kosten', 'boolean', 'true', ARRAY['Budget', 'Kosten', 'Warnungen'], 'Budget', true),
('projects', 'milestones_required', 'Meilensteine erforderlich', 'Projekte müssen Meilensteine haben', 'boolean', 'false', ARRAY['Projektplanung', 'Tracking', 'Validierung'], 'Planung', true),
('projects', 'resource_allocation', 'Ressourcenplanung aktivieren', 'Ermöglicht die Planung von Mitarbeiter-Kapazitäten', 'boolean', 'true', ARRAY['Kapazitätsplanung', 'Auslastung', 'Dashboard'], 'Ressourcen', true),
('projects', 'status_update_frequency', 'Status-Update Frequenz', 'Wie oft müssen Status-Updates erfolgen', 'enum', '"weekly"', ARRAY['Reports', 'Kommunikation', 'Erinnerungen'], 'Kommunikation', true),
('projects', 'external_visibility', 'Externe Sichtbarkeit', 'Können Projekte für externe Partner sichtbar sein', 'boolean', 'false', ARRAY['Zugriffsrechte', 'Kunden-Portal', 'Datenschutz'], 'Sichtbarkeit', true);

-- ===============================================
-- MODUL: documents (Dokumentenmanagement)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('documents', 'version_control_enabled', 'Versionierung aktivieren', 'Automatische Versionierung von Dokumenten', 'boolean', 'true', ARRAY['Upload', 'Historie', 'Wiederherstellung'], 'Versionierung', true),
('documents', 'auto_delete_temp_files_days', 'Temporäre Dateien löschen nach (Tagen)', 'Nach wie vielen Tagen werden temp Dateien gelöscht', 'number', '30', ARRAY['Speicher', 'Automatisierung', 'Bereinigung'], 'Speicher', true),
('documents', 'max_file_size_mb', 'Maximale Dateigröße (MB)', 'Maximale Größe für einzelne Dateien', 'number', '50', ARRAY['Upload', 'Validierung', 'Speicher'], 'Limits', true),
('documents', 'ocr_enabled', 'OCR aktivieren', 'Automatische Texterkennung in Dokumenten', 'boolean', 'true', ARRAY['Suche', 'Inhaltserkennung', 'KI'], 'KI', true),
('documents', 'digital_signature_required', 'Digitale Signatur erforderlich', 'Bestimmte Dokumente müssen digital signiert werden', 'boolean', 'false', ARRAY['Signatur', 'Workflow', 'Compliance'], 'Signatur', true),
('documents', 'retention_policy_enabled', 'Aufbewahrungsrichtlinie aktivieren', 'Automatische Löschung nach Ablauf der Aufbewahrungsfrist', 'boolean', 'true', ARRAY['Compliance', 'DSGVO', 'Automatisierung'], 'Compliance', true);

-- ===============================================
-- MODUL: helpdesk (IT-Support)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('helpdesk', 'auto_assignment', 'Automatische Ticket-Zuweisung', 'Tickets werden automatisch zugewiesen', 'boolean', 'true', ARRAY['Ticketing', 'Workflow', 'Load-Balancing'], 'Automatisierung', true),
('helpdesk', 'sla_enabled', 'SLA-Tracking aktivieren', 'Überwacht Reaktions- und Lösungszeiten', 'boolean', 'true', ARRAY['SLA', 'Eskalation', 'Reports'], 'SLA', true),
('helpdesk', 'first_response_hours', 'Erste Reaktion (Stunden)', 'Maximale Zeit bis zur ersten Reaktion', 'number', '4', ARRAY['SLA', 'Eskalation', 'Qualität'], 'SLA', true),
('helpdesk', 'resolution_hours', 'Lösungszeit (Stunden)', 'Maximale Zeit bis zur Lösung', 'number', '24', ARRAY['SLA', 'Eskalation', 'Qualität'], 'SLA', true),
('helpdesk', 'satisfaction_survey', 'Zufriedenheitsumfrage', 'Nach Ticket-Schließung wird eine Umfrage gesendet', 'boolean', 'true', ARRAY['Feedback', 'Qualität', 'E-Mail'], 'Feedback', true),
('helpdesk', 'knowledge_base_suggestions', 'Knowledge-Base Vorschläge', 'KI schlägt relevante Artikel beim Erstellen vor', 'boolean', 'true', ARRAY['KI', 'Self-Service', 'Effizienz'], 'KI', true);

-- ===============================================
-- MODUL: orgchart (Organigramm)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('orgchart', 'show_photos', 'Fotos anzeigen', 'Zeigt Mitarbeiterfotos im Organigramm', 'boolean', 'true', ARRAY['Visualisierung', 'Darstellung', 'Datenschutz'], 'Anzeige', true),
('orgchart', 'show_contact_info', 'Kontaktdaten anzeigen', 'Zeigt E-Mail und Telefon im Organigramm', 'boolean', 'true', ARRAY['Kontakt', 'Darstellung', 'Datenschutz'], 'Anzeige', true),
('orgchart', 'show_vacant_positions', 'Vakante Stellen anzeigen', 'Zeigt unbesetzte Positionen an', 'boolean', 'true', ARRAY['Recruiting', 'Planung', 'Darstellung'], 'Anzeige', true),
('orgchart', 'depth_limit', 'Tiefenlimit', 'Wie viele Ebenen werden standardmäßig angezeigt', 'number', '5', ARRAY['Performance', 'Darstellung', 'Navigation'], 'Performance', true),
('orgchart', 'edit_access', 'Bearbeitungszugriff', 'Wer darf das Organigramm bearbeiten', 'enum', '"hr_only"', ARRAY['Zugriffsrechte', 'Änderungen', 'Sicherheit'], 'Zugriffsrechte', true);

-- ===============================================
-- MODUL: users_roles (Benutzer und Rechte)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('users_roles', 'password_min_length', 'Minimale Passwortlänge', 'Mindestanzahl Zeichen für Passwörter', 'number', '8', ARRAY['Security', 'Validierung', 'Registrierung'], 'Security', true),
('users_roles', 'password_complexity', 'Passwortkomplexität', 'Welche Zeichen sind im Passwort erforderlich', 'enum', '"medium"', ARRAY['Security', 'Validierung', 'Registrierung'], 'Security', true),
('users_roles', 'mfa_required', 'MFA erforderlich', '2-Faktor-Authentifizierung ist Pflicht', 'boolean', 'false', ARRAY['Security', 'Login', 'Compliance'], 'Security', true),
('users_roles', 'session_timeout_minutes', 'Session-Timeout (Minuten)', 'Nach wie vielen Minuten Inaktivität wird abgemeldet', 'number', '30', ARRAY['Security', 'Session', 'UX'], 'Session', true),
('users_roles', 'role_hierarchy_strict', 'Strikte Rollenhierarchie', 'Benutzer können nur niedrigere Rollen zuweisen', 'boolean', 'true', ARRAY['Zugriffsrechte', 'Sicherheit', 'Delegation'], 'Rollen', true),
('users_roles', 'auto_deactivation_days', 'Automatische Deaktivierung (Tage)', 'Inaktive Accounts werden nach X Tagen deaktiviert', 'number', '90', ARRAY['Security', 'Automatisierung', 'Compliance'], 'Automatisierung', true);

-- ===============================================
-- MODUL: notifications (Benachrichtigungen)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('notifications', 'email_enabled', 'E-Mail-Benachrichtigungen', 'E-Mails werden versendet', 'boolean', 'true', ARRAY['E-Mail', 'Kommunikation', 'Workflow'], 'Kanäle', true),
('notifications', 'push_enabled', 'Push-Benachrichtigungen', 'Browser-App-Push-Nachrichten aktivieren', 'boolean', 'true', ARRAY['Push', 'Mobile', 'Echtzeit'], 'Kanäle', true),
('notifications', 'digest_frequency', 'Zusammenfassungs-Frequenz', 'Wie oft werden Zusammenfassungen gesendet', 'enum', '"daily"', ARRAY['E-Mail', 'Zusammenfassung', 'Frequenz'], 'Frequenz', true),
('notifications', 'quiet_hours_enabled', 'Ruhezeiten aktivieren', 'Keine Benachrichtigungen außerhalb der Arbeitszeit', 'boolean', 'false', ARRAY['Zeitsteuerung', 'Work-Life-Balance', 'Einstellungen'], 'Zeitsteuerung', true),
('notifications', 'quiet_hours_start', 'Ruhezeit Start', 'Ab wann keine Benachrichtigungen', 'string', '"18:00"', ARRAY['Zeitsteuerung', 'Konfiguration'], 'Zeitsteuerung', true),
('notifications', 'quiet_hours_end', 'Ruhezeit Ende', 'Ab wann wieder Benachrichtigungen', 'string', '"08:00"', ARRAY['Zeitsteuerung', 'Konfiguration'], 'Zeitsteuerung', true);

-- ===============================================
-- MODUL: innovation (Innovation und Ideen)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('innovation', 'submission_approval', 'Ideen-Genehmigung erforderlich', 'Eingereichte Ideen müssen vor Veröffentlichung genehmigt werden', 'boolean', 'false', ARRAY['Moderation', 'Workflow', 'Qualität'], 'Moderation', true),
('innovation', 'voting_enabled', 'Voting aktivieren', 'Mitarbeiter können für Ideen abstimmen', 'boolean', 'true', ARRAY['Voting', 'Engagement', 'Priorisierung'], 'Engagement', true),
('innovation', 'anonymous_submission', 'Anonyme Einreichung erlaubt', 'Ideen können anonym eingereicht werden', 'boolean', 'true', ARRAY['Anonymität', 'Datenschutz', 'Offenheit'], 'Anonymität', true),
('innovation', 'reward_points_enabled', 'Belohnungspunkte aktivieren', 'Für gute Ideen werden Punkte vergeben', 'boolean', 'false', ARRAY['Gamification', 'Rewards', 'Motivation'], 'Gamification', true),
('innovation', 'categories_required', 'Kategorie erforderlich', 'Ideen müssen einer Kategorie zugeordnet werden', 'boolean', 'true', ARRAY['Kategorisierung', 'Validierung', 'Suche'], 'Kategorisierung', true);

-- ===============================================
-- MODUL: knowledge (Knowledge Hub)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('knowledge', 'public_access', 'Öffentlicher Zugang', 'Knowledge-Artikel sind ohne Login zugänglich', 'boolean', 'false', ARRAY['Zugriffsrechte', 'Self-Service', 'Sicherheit'], 'Zugang', true),
('knowledge', 'edit_suggestions', 'Bearbeitungsvorschläge erlauben', 'Alle Nutzer können Änderungen vorschlagen', 'boolean', 'true', ARRAY['Kollaboration', 'Wiki', 'Qualität'], 'Kollaboration', true),
('knowledge', 'ai_summaries', 'KI-Zusammenfassungen', 'Automatische Zusammenfassungen von Artikeln', 'boolean', 'true', ARRAY['KI', 'Suche', 'Zusammenfassung'], 'KI', true),
('knowledge', 'review_required', 'Review erforderlich', 'Neue Artikel müssen geprüft werden', 'boolean', 'true', ARRAY['Workflow', 'Qualität', 'Moderation'], 'Workflow', true),
('knowledge', 'expiry_warning_days', 'Ablaufwarnung (Tage)', 'Wann vor Artikelablauf wird gewarnt', 'number', '30', ARRAY['Aktualität', 'Erinnerungen', 'Qualität'], 'Aktualität', true),
('knowledge', 'versioning_enabled', 'Versionierung aktivieren', 'Änderungen werden versioniert', 'boolean', 'true', ARRAY['Historie', 'Wiederherstellung', 'Compliance'], 'Versionierung', true);

-- ===============================================
-- MODUL: rewards (Anerkennung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('rewards', 'peer_recognition', 'Peer-Anerkennung aktivieren', 'Mitarbeiter können sich gegenseitig anerkennen', 'boolean', 'true', ARRAY['Recognition', 'Kultur', 'Engagement'], 'Recognition', true),
('rewards', 'points_system_enabled', 'Punktesystem aktivieren', 'Punkte können gesammelt und eingelöst werden', 'boolean', 'false', ARRAY['Gamification', 'Rewards', 'Motivation'], 'Gamification', true),
('rewards', 'public_recognition', 'Öffentliche Anerkennung', 'Anerkennungen sind für alle sichtbar', 'boolean', 'true', ARRAY['Sichtbarkeit', 'Kultur', 'Transparenz'], 'Sichtbarkeit', true),
('rewards', 'monthly_budget', 'Monatliches Budget pro Mitarbeiter', 'Punkte-Budget das monatlich vergeben werden kann', 'number', '100', ARRAY['Budget', 'Limits', 'Fairness'], 'Budget', true),
('rewards', 'manager_approval_required', 'Manager-Genehmigung für Prämien', 'Materielle Belohnungen müssen genehmigt werden', 'boolean', 'true', ARRAY['Workflow', 'Budget', 'Kontrolle'], 'Workflow', true);

-- ===============================================
-- MODUL: workforce_planning (Personalplanung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('workforce_planning', 'forecast_horizon_months', 'Planungshorizont (Monate)', 'Wie weit in die Zukunft wird geplant', 'number', '12', ARRAY['Planung', 'Prognose', 'Strategie'], 'Planung', true),
('workforce_planning', 'attrition_prediction', 'Fluktuation-Vorhersage aktivieren', 'KI prognostiziert Kündigungsrisiken', 'boolean', 'false', ARRAY['KI', 'Analytics', 'Risikomanagement'], 'KI', true),
('workforce_planning', 'headcount_approval', 'Headcount-Genehmigung erforderlich', 'Neue Stellen müssen genehmigt werden', 'boolean', 'true', ARRAY['Workflow', 'Budget', 'Strategie'], 'Workflow', true),
('workforce_planning', 'skill_gap_analysis', 'Skill-Gap-Analyse aktivieren', 'Automatische Analyse von Qualifikationslücken', 'boolean', 'true', ARRAY['Skills', 'Training', 'Entwicklung'], 'Skills', true),
('workforce_planning', 'succession_planning', 'Nachfolgeplanung aktivieren', 'Planung von Nachfolgern für Schlüsselpositionen', 'boolean', 'false', ARRAY['Strategie', 'Entwicklung', 'Risiko'], 'Nachfolge', true);

-- ===============================================
-- MODUL: global_mobility (Internationale Entsendungen)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('global_mobility', 'visa_tracking', 'Visa-Tracking aktivieren', 'Verfolgt Visa-Status und Ablaufdaten', 'boolean', 'true', ARRAY['Compliance', 'Erinnerungen', 'Dokumentation'], 'Visa', true),
('global_mobility', 'relocation_support', 'Umzugsunterstützung', 'System unterstützt bei Umzugsplanung', 'boolean', 'true', ARRAY['Planung', 'Checklisten', 'Support'], 'Umzug', true),
('global_mobility', 'tax_equalization', 'Steuerausgleich berechnen', 'Automatische Berechnung von Steuerausgleich', 'boolean', 'false', ARRAY['Finanzen', 'Berechnung', 'Compliance'], 'Steuern', true),
('global_mobility', 'cost_tracking_enabled', 'Kosten-Tracking aktivieren', 'Verfolgt alle Kosten der Entsendung', 'boolean', 'true', ARRAY['Budget', 'Kosten', 'Reports'], 'Kosten', true);

-- ===============================================
-- MODUL: compliance (Compliance-Einstellungen)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('compliance', 'gdpr_mode', 'DSGVO-Modus', 'Aktiviert erweiterte Datenschutzfunktionen', 'boolean', 'true', ARRAY['Datenschutz', 'Löschung', 'Einwilligung'], 'Datenschutz', true),
('compliance', 'data_retention_years', 'Datenaufbewahrung (Jahre)', 'Wie lange werden Daten aufbewahrt', 'number', '10', ARRAY['Aufbewahrung', 'Löschung', 'Compliance'], 'Aufbewahrung', true),
('compliance', 'audit_log_enabled', 'Audit-Log aktivieren', 'Alle Änderungen werden protokolliert', 'boolean', 'true', ARRAY['Nachverfolgung', 'Transparenz', 'Compliance'], 'Audit', true),
('compliance', 'consent_management', 'Einwilligungsverwaltung', 'Verwaltet Zustimmungen von Mitarbeitern', 'boolean', 'true', ARRAY['DSGVO', 'Einwilligung', 'Dokumentation'], 'Einwilligung', true),
('compliance', 'whistleblower_channel', 'Hinweisgeber-Kanal aktivieren', 'Anonymer Meldekanal gemäß Hinweisgeberschutzgesetz', 'boolean', 'false', ARRAY['Compliance', 'Anonymität', 'Meldungen'], 'Hinweisgeber', true),
('compliance', 'policy_acknowledgment', 'Richtlinien-Bestätigung erforderlich', 'Mitarbeiter müssen Richtlinien bestätigen', 'boolean', 'true', ARRAY['Dokumentation', 'Compliance', 'Onboarding'], 'Richtlinien', true);

-- ===============================================
-- MODUL: shifts (Schichtplanung)
-- ===============================================
INSERT INTO public.settings_definitions (module, key, name, description, value_type, default_value, affected_features, category, is_active) VALUES
('shifts', 'auto_scheduling', 'Automatische Schichtplanung', 'KI erstellt automatisch Schichtpläne', 'boolean', 'false', ARRAY['KI', 'Planung', 'Automatisierung'], 'Automatisierung', true),
('shifts', 'swap_requests_enabled', 'Schichttausch erlauben', 'Mitarbeiter können Schichten untereinander tauschen', 'boolean', 'true', ARRAY['Flexibilität', 'Self-Service', 'Anfragen'], 'Flexibilität', true),
('shifts', 'min_rest_hours', 'Minimale Ruhezeit (Stunden)', 'Mindestzeit zwischen zwei Schichten', 'number', '11', ARRAY['Compliance', 'Gesundheit', 'Validierung'], 'Compliance', true),
('shifts', 'max_hours_per_week', 'Maximale Wochenstunden', 'Maximale Arbeitszeit pro Woche', 'number', '48', ARRAY['Compliance', 'Validierung', 'Warnungen'], 'Compliance', true),
('shifts', 'overtime_warning', 'Überstunden-Warnung', 'Warnt bei drohender Überschreitung', 'boolean', 'true', ARRAY['Warnungen', 'Planung', 'Compliance'], 'Warnungen', true),
('shifts', 'preference_weight', 'Präferenz-Gewichtung', 'Wie stark werden Mitarbeiterwünsche berücksichtigt', 'enum', '"balanced"', ARRAY['Planung', 'Fairness', 'Zufriedenheit'], 'Präferenzen', true);