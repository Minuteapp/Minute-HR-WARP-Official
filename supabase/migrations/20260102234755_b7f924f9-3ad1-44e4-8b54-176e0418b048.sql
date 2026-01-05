-- =====================================================
-- Documents & Compliance Settings Definitions Complete
-- Ergänzt fehlende Settings und fügt recommended_value hinzu
-- =====================================================

-- UPDATE existierende Einträge mit recommended_value
UPDATE settings_definitions 
SET recommended_value = default_value
WHERE module = 'documents' AND recommended_value IS NULL;

UPDATE settings_definitions 
SET recommended_value = default_value
WHERE module = 'compliance' AND recommended_value IS NULL;

-- INSERT neue Documents Settings-Definitionen
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, sort_order, is_required, is_active)
VALUES
-- Documents: General Settings
('documents', 'general_max_file_size_mb', 'Max. Dateigröße (MB)', 'Maximale Dateigröße für Uploads', 'number', '50', '50', 'general', 10, false, true),
('documents', 'general_versioning_enabled', 'Versionierung aktiviert', 'Dokumenten-Versionierung aktivieren', 'boolean', 'true', 'true', 'general', 20, false, true),
('documents', 'general_auto_archiving', 'Auto-Archivierung', 'Alte Dokumente automatisch archivieren', 'boolean', 'false', 'false', 'general', 30, false, true),
('documents', 'general_max_versions_per_document', 'Max. Versionen pro Dokument', 'Maximale Anzahl Versionen pro Dokument', 'number', '10', '10', 'general', 40, false, true),
('documents', 'general_archive_after_days', 'Archivierung nach (Tage)', 'Tage bis zur automatischen Archivierung', 'number', '365', '365', 'general', 50, false, true),
('documents', 'general_allowed_extensions', 'Erlaubte Dateitypen', 'Erlaubte Dateiendungen', 'string', '"pdf,docx,xlsx,pptx,jpg,png"', '"pdf,docx,xlsx,pptx,jpg,png"', 'general', 60, false, true),

-- Documents: Compliance Settings
('documents', 'compliance_eu_cloud_storage', 'EU-Cloud Speicherung', 'Dokumente nur in EU-Cloud speichern', 'boolean', 'true', 'true', 'compliance', 100, false, true),
('documents', 'compliance_e2e_encryption', 'E2E-Verschlüsselung', 'Ende-zu-Ende-Verschlüsselung', 'boolean', 'true', 'true', 'compliance', 110, false, true),
('documents', 'compliance_de_dsgvo', 'DSGVO-Konformität', 'DSGVO-Konformitätsmodus aktivieren', 'boolean', 'true', 'true', 'compliance', 120, false, true),
('documents', 'compliance_de_betrvg', 'BetrVG-Compliance', 'Betriebsverfassungsgesetz-Compliance', 'boolean', 'true', 'true', 'compliance', 130, false, true),
('documents', 'compliance_de_hgb', 'HGB-Aufbewahrung', 'Handelsgesetzbuch-Aufbewahrungsfristen', 'boolean', 'true', 'true', 'compliance', 140, false, true),
('documents', 'compliance_auto_delete_enabled', 'Auto-Löschung aktiviert', 'Automatische Löschung nach Aufbewahrungsfrist', 'boolean', 'true', 'true', 'compliance', 150, false, true),
('documents', 'compliance_retention_years', 'Aufbewahrungsdauer (Jahre)', 'Standard-Aufbewahrungsdauer in Jahren', 'number', '10', '10', 'compliance', 160, false, true),
('documents', 'compliance_audit_trail', 'Audit-Trail aktiviert', 'Dokumenten-Audit-Trail aktivieren', 'boolean', 'true', 'true', 'compliance', 170, false, true),

-- Documents: Notifications Settings
('documents', 'notifications_new_documents', 'Neue Dokumente benachrichtigen', 'Bei neuen Dokumenten benachrichtigen', 'boolean', 'true', 'true', 'notifications', 200, false, true),
('documents', 'notifications_document_updates', 'Dokument-Updates', 'Bei Dokumenten-Updates benachrichtigen', 'boolean', 'true', 'true', 'notifications', 210, false, true),
('documents', 'notifications_approval_requests', 'Freigabe-Anfragen', 'Bei Freigabe-Anfragen benachrichtigen', 'boolean', 'true', 'true', 'notifications', 220, false, true),
('documents', 'notifications_expiry_alerts', 'Ablauf-Warnungen', 'Vor Dokumenten-Ablauf warnen', 'boolean', 'true', 'true', 'notifications', 230, false, true),
('documents', 'notifications_first_warning_days', 'Erste Warnung (Tage)', 'Tage vor Ablauf für erste Warnung', 'number', '90', '90', 'notifications', 240, false, true),
('documents', 'notifications_second_warning_days', 'Zweite Warnung (Tage)', 'Tage vor Ablauf für zweite Warnung', 'number', '30', '30', 'notifications', 250, false, true),
('documents', 'notifications_final_warning_days', 'Finale Warnung (Tage)', 'Tage vor Ablauf für finale Warnung', 'number', '7', '7', 'notifications', 260, false, true),
('documents', 'notifications_channel_email', 'E-Mail Benachrichtigungen', 'Benachrichtigungen per E-Mail senden', 'boolean', 'true', 'true', 'notifications', 270, false, true),
('documents', 'notifications_channel_push', 'Push-Benachrichtigungen', 'Push-Benachrichtigungen senden', 'boolean', 'true', 'true', 'notifications', 280, false, true),
('documents', 'notifications_channel_inapp', 'In-App Benachrichtigungen', 'In-App-Benachrichtigungen anzeigen', 'boolean', 'true', 'true', 'notifications', 290, false, true),

-- Documents: Workflow Settings
('documents', 'workflow_approval_required', 'Freigabe erforderlich', 'Freigabe für Veröffentlichung erforderlich', 'boolean', 'true', 'true', 'workflow', 300, false, true),
('documents', 'workflow_multi_level_approval', 'Mehrstufige Freigabe', 'Mehrstufige Freigabe aktivieren', 'boolean', 'false', 'false', 'workflow', 310, false, true),
('documents', 'workflow_auto_assign', 'Prüfer automatisch zuweisen', 'Prüfer automatisch nach Regeln zuweisen', 'boolean', 'true', 'true', 'workflow', 320, false, true),
('documents', 'workflow_reminder_days', 'Erinnerung nach (Tage)', 'Tage bis zur Erinnerung', 'number', '3', '3', 'workflow', 330, false, true),
('documents', 'workflow_escalation_days', 'Eskalation nach (Tage)', 'Tage bis zur Eskalation', 'number', '7', '7', 'workflow', 340, false, true),

-- Documents: Access Control Settings
('documents', 'access_default_visibility', 'Standard-Sichtbarkeit', 'Standard-Sichtbarkeit für Dokumente', 'string', '"department"', '"department"', 'access', 400, false, true),
('documents', 'access_require_acknowledgment', 'Bestätigung erforderlich', 'Lesebestätigung erforderlich', 'boolean', 'false', 'false', 'access', 410, false, true),
('documents', 'access_download_tracking', 'Download-Tracking', 'Dokumenten-Downloads verfolgen', 'boolean', 'true', 'true', 'access', 420, false, true),
('documents', 'access_watermark_enabled', 'Wasserzeichen aktiviert', 'Wasserzeichen zu Dokumenten hinzufügen', 'boolean', 'false', 'false', 'access', 430, false, true),
('documents', 'access_print_restriction', 'Druck-Einschränkung', 'Drucken von Dokumenten einschränken', 'boolean', 'false', 'false', 'access', 440, false, true),

-- Compliance: GDPR/DSGVO Settings
('compliance', 'gdpr_data_minimization', 'Datenminimierung', 'Datenminimierungsprinzipien durchsetzen', 'boolean', 'true', 'true', 'gdpr', 10, false, true),
('compliance', 'gdpr_purpose_limitation', 'Zweckbindung', 'Zweckbindung durchsetzen', 'boolean', 'true', 'true', 'gdpr', 20, false, true),
('compliance', 'gdpr_data_portability', 'Datenportabilität', 'Datenportabilitätsanfragen ermöglichen', 'boolean', 'true', 'true', 'gdpr', 30, false, true),
('compliance', 'gdpr_right_to_erasure', 'Recht auf Löschung', 'Löschanfragen ermöglichen', 'boolean', 'true', 'true', 'gdpr', 40, false, true),
('compliance', 'gdpr_dpo_required', 'DSB erforderlich', 'Datenschutzbeauftragter erforderlich', 'boolean', 'true', 'true', 'gdpr', 50, false, true),
('compliance', 'gdpr_dpia_threshold', 'DSFA-Schwellenwert', 'Risikoschwelle für DSFA', 'string', '"medium"', '"medium"', 'gdpr', 60, false, true),

-- Compliance: Audit Settings
('compliance', 'audit_retention_days', 'Audit-Log Aufbewahrung (Tage)', 'Tage zur Aufbewahrung von Audit-Logs', 'number', '365', '365', 'audit', 100, false, true),
('compliance', 'audit_include_read_access', 'Lesezugriffe protokollieren', 'Lesezugriffe im Audit-Trail protokollieren', 'boolean', 'false', 'false', 'audit', 110, false, true),
('compliance', 'audit_include_exports', 'Exporte protokollieren', 'Datenexporte im Audit-Trail protokollieren', 'boolean', 'true', 'true', 'audit', 120, false, true),
('compliance', 'audit_include_logins', 'Anmeldungen protokollieren', 'Anmeldeversuche im Audit-Trail protokollieren', 'boolean', 'true', 'true', 'audit', 130, false, true),
('compliance', 'audit_tamper_protection', 'Manipulationsschutz', 'Audit-Log Manipulationsschutz aktivieren', 'boolean', 'true', 'true', 'audit', 140, false, true),

-- Compliance: Consent Management
('compliance', 'consent_double_opt_in', 'Double-Opt-In erforderlich', 'Double-Opt-In für Einwilligung erforderlich', 'boolean', 'true', 'true', 'consent', 200, false, true),
('compliance', 'consent_renewal_months', 'Einwilligungs-Erneuerung (Monate)', 'Monate bis zur Einwilligungs-Erneuerung', 'number', '12', '12', 'consent', 210, false, true),
('compliance', 'consent_granular_options', 'Granulare Einwilligung', 'Granulare Einwilligungsoptionen aktivieren', 'boolean', 'true', 'true', 'consent', 220, false, true),
('compliance', 'consent_withdrawal_easy', 'Einfacher Widerruf', 'Einfachen Einwilligungswiderruf ermöglichen', 'boolean', 'true', 'true', 'consent', 230, false, true),
('compliance', 'consent_version_tracking', 'Versions-Tracking', 'Einwilligungs-Versionsänderungen verfolgen', 'boolean', 'true', 'true', 'consent', 240, false, true),

-- Compliance: Data Protection
('compliance', 'data_anonymization_enabled', 'Anonymisierung aktiviert', 'Datenanonymisierung aktivieren', 'boolean', 'true', 'true', 'data_protection', 300, false, true),
('compliance', 'data_pseudonymization_enabled', 'Pseudonymisierung aktiviert', 'Datenpseudonymisierung aktivieren', 'boolean', 'true', 'true', 'data_protection', 310, false, true),
('compliance', 'data_export_allowed', 'Datenexport erlaubt', 'Datenexportanfragen erlauben', 'boolean', 'true', 'true', 'data_protection', 320, false, true),
('compliance', 'data_encryption_at_rest', 'Verschlüsselung at Rest', 'Daten im Ruhezustand verschlüsseln', 'boolean', 'true', 'true', 'data_protection', 330, false, true),
('compliance', 'data_encryption_in_transit', 'Verschlüsselung in Transit', 'Daten bei Übertragung verschlüsseln', 'boolean', 'true', 'true', 'data_protection', 340, false, true),

-- Compliance: Whistleblower
('compliance', 'whistleblower_anonymous_only', 'Nur anonyme Meldungen', 'Nur anonyme Meldungen erlauben', 'boolean', 'true', 'true', 'whistleblower', 400, false, true),
('compliance', 'whistleblower_external_channel', 'Externer Kanal', 'Externen Meldekanal aktivieren', 'boolean', 'false', 'false', 'whistleblower', 410, false, true),
('compliance', 'whistleblower_response_days', 'Antwortfrist (Tage)', 'Tage zur Beantwortung von Meldungen', 'number', '7', '7', 'whistleblower', 420, false, true),
('compliance', 'whistleblower_investigation_days', 'Untersuchungsfrist (Tage)', 'Tage zur Abschluss der Untersuchung', 'number', '90', '90', 'whistleblower', 430, false, true),

-- Compliance: Risk Assessment
('compliance', 'risk_assessment_interval_months', 'Risikobewertungs-Intervall (Monate)', 'Monate zwischen Risikobewertungen', 'number', '6', '6', 'risk', 500, false, true),
('compliance', 'risk_auto_assessment', 'Auto-Risikobewertung', 'Automatische Risikobewertung', 'boolean', 'true', 'true', 'risk', 510, false, true),
('compliance', 'risk_notification_threshold', 'Risiko-Benachrichtigungsschwelle', 'Schwellenwert für Risiko-Benachrichtigungen', 'string', '"medium"', '"medium"', 'risk', 520, false, true)

ON CONFLICT (module, key) DO UPDATE SET
  recommended_value = EXCLUDED.recommended_value,
  updated_at = now();