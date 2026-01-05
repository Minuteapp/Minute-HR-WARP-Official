-- Migration 4: System, Security, Integrations - Vollständige 80/20 Settings

-- SYSTEM Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('system', 'language', 'Sprache', 'Standard-Systemsprache', 'string', '"de"', '"de"', 'localization', true, 10),
  ('system', 'timezone', 'Zeitzone', 'Standard-Zeitzone', 'string', '"Europe/Berlin"', '"Europe/Berlin"', 'localization', true, 20),
  ('system', 'date_format', 'Datumsformat', 'Standard-Datumsformat', 'string', '"DD.MM.YYYY"', '"DD.MM.YYYY"', 'localization', true, 30),
  ('system', 'time_format', 'Zeitformat', 'Standard-Zeitformat', 'string', '"HH:mm"', '"HH:mm"', 'localization', true, 40),
  ('system', 'first_day_of_week', 'Erster Wochentag', 'Woche beginnt mit', 'string', '"monday"', '"monday"', 'localization', true, 50),
  ('system', 'maintenance_mode', 'Wartungsmodus', 'System in Wartungsmodus', 'boolean', 'false', 'false', 'maintenance', true, 60),
  ('system', 'maintenance_message', 'Wartungsnachricht', 'Nachricht während Wartung', 'string', '"System wird gewartet"', '"System wird gewartet"', 'maintenance', true, 70),
  ('system', 'debug_logging', 'Debug-Logging', 'Erweiterte Protokollierung', 'boolean', 'false', 'false', 'logging', true, 80),
  ('system', 'log_retention_days', 'Log-Aufbewahrung (Tage)', 'Wie lange Logs gespeichert werden', 'number', '90', '90', 'logging', true, 90),
  ('system', 'auto_backup', 'Automatisches Backup', 'Automatische Datensicherung', 'boolean', 'true', 'true', 'backup', true, 100),
  ('system', 'backup_frequency', 'Backup-Häufigkeit', 'Wie oft Backups erstellt werden', 'string', '"daily"', '"daily"', 'backup', true, 110),
  ('system', 'backup_retention_days', 'Backup-Aufbewahrung (Tage)', 'Wie lange Backups gespeichert werden', 'number', '30', '30', 'backup', true, 120),
  ('system', 'email_from_address', 'Absender-E-Mail', 'Standard-Absender für System-E-Mails', 'string', '"noreply@company.de"', '"noreply@company.de"', 'email', true, 130),
  ('system', 'email_from_name', 'Absender-Name', 'Standard-Absendername', 'string', '"HR System"', '"HR System"', 'email', true, 140),
  ('system', 'max_upload_size_mb', 'Max. Upload (MB)', 'Maximale Dateigröße für Upload', 'number', '10', '25', 'files', true, 150),
  ('system', 'allowed_file_types', 'Erlaubte Dateitypen', 'Erlaubte Dateiendungen', 'string', '"pdf,doc,docx,xls,xlsx,jpg,png"', '"pdf,doc,docx,xls,xlsx,jpg,png"', 'files', true, 160)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- SECURITY Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('security', 'session_timeout_minutes', 'Session-Timeout (Min)', 'Session-Ablauf nach Inaktivität', 'number', '480', '480', 'session', true, 10),
  ('security', 'max_failed_logins', 'Max. Fehlversuche', 'Maximale fehlgeschlagene Anmeldeversuche', 'number', '5', '5', 'authentication', true, 20),
  ('security', 'lockout_duration_minutes', 'Sperrzeit (Min)', 'Dauer der Kontosperre', 'number', '30', '30', 'authentication', true, 30),
  ('security', 'require_2fa', '2FA erforderlich', 'Zwei-Faktor-Authentifizierung Pflicht', 'boolean', 'false', 'true', 'mfa', true, 40),
  ('security', 'mfa_sms_enabled', '2FA per SMS', 'SMS-basierte 2FA erlauben', 'boolean', 'true', 'true', 'mfa', true, 50),
  ('security', 'mfa_authenticator_enabled', '2FA per App', 'Authenticator-App erlauben', 'boolean', 'true', 'true', 'mfa', true, 60),
  ('security', 'mfa_email_enabled', '2FA per E-Mail', 'E-Mail-basierte 2FA erlauben', 'boolean', 'true', 'true', 'mfa', true, 70),
  ('security', 'password_min_length', 'Passwort Min. Länge', 'Mindestlänge für Passwörter', 'number', '8', '12', 'password', true, 80),
  ('security', 'password_require_uppercase', 'Großbuchstaben erforderlich', 'Passwort muss Großbuchstaben enthalten', 'boolean', 'true', 'true', 'password', true, 90),
  ('security', 'password_require_lowercase', 'Kleinbuchstaben erforderlich', 'Passwort muss Kleinbuchstaben enthalten', 'boolean', 'true', 'true', 'password', true, 100),
  ('security', 'password_require_number', 'Zahl erforderlich', 'Passwort muss Zahl enthalten', 'boolean', 'true', 'true', 'password', true, 110),
  ('security', 'password_require_special', 'Sonderzeichen erforderlich', 'Passwort muss Sonderzeichen enthalten', 'boolean', 'false', 'true', 'password', true, 120),
  ('security', 'password_expiry_days', 'Passwort-Ablauf (Tage)', 'Passwort muss nach X Tagen geändert werden', 'number', '0', '90', 'password', true, 130),
  ('security', 'password_history_count', 'Passwort-Historie', 'Anzahl alter Passwörter die nicht wiederverwendet werden dürfen', 'number', '5', '5', 'password', true, 140),
  ('security', 'login_alerts', 'Anmelde-Benachrichtigungen', 'Bei neuen Anmeldungen benachrichtigen', 'boolean', 'true', 'true', 'notifications', true, 150),
  ('security', 'security_changes_alerts', 'Sicherheitsänderungen', 'Bei Sicherheitsänderungen benachrichtigen', 'boolean', 'true', 'true', 'notifications', true, 160),
  ('security', 'suspicious_activity_alerts', 'Verdächtige Aktivitäten', 'Bei verdächtigen Aktivitäten benachrichtigen', 'boolean', 'true', 'true', 'notifications', true, 170),
  ('security', 'ip_whitelist_enabled', 'IP-Whitelist aktiv', 'Nur bestimmte IPs erlauben', 'boolean', 'false', 'false', 'access', true, 180),
  ('security', 'adaptive_auth_enabled', 'Adaptive Authentifizierung', 'Risikobasierte Authentifizierung', 'boolean', 'true', 'true', 'advanced', true, 190),
  ('security', 'detect_new_device', 'Neue Geräte erkennen', 'Bei neuem Gerät zusätzliche Prüfung', 'boolean', 'true', 'true', 'advanced', true, 200),
  ('security', 'detect_unusual_location', 'Ungewöhnliche Orte erkennen', 'Bei ungewöhnlichem Standort warnen', 'boolean', 'true', 'true', 'advanced', true, 210),
  ('security', 'audit_logging', 'Audit-Logging', 'Sicherheitsrelevante Aktionen protokollieren', 'boolean', 'true', 'true', 'audit', true, 220),
  ('security', 'audit_retention_days', 'Audit-Aufbewahrung (Tage)', 'Wie lange Audit-Logs gespeichert werden', 'number', '365', '365', 'audit', true, 230),
  ('security', 'data_encryption', 'Datenverschlüsselung', 'Sensible Daten verschlüsseln', 'boolean', 'true', 'true', 'encryption', true, 240),
  ('security', 'encryption_at_rest', 'Verschlüsselung ruhender Daten', 'Daten im Speicher verschlüsseln', 'boolean', 'true', 'true', 'encryption', true, 250)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;

-- INTEGRATIONS Settings
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  ('integrations', 'api_enabled', 'API aktiviert', 'REST-API verfügbar machen', 'boolean', 'true', 'true', 'api', true, 10),
  ('integrations', 'api_version', 'API-Version', 'Aktive API-Version', 'string', '"v1"', '"v1"', 'api', true, 20),
  ('integrations', 'rate_limit_per_minute', 'Rate-Limit (pro Min)', 'Maximale API-Aufrufe pro Minute', 'number', '100', '100', 'api', true, 30),
  ('integrations', 'rate_limit_per_hour', 'Rate-Limit (pro Std)', 'Maximale API-Aufrufe pro Stunde', 'number', '1000', '1000', 'api', true, 40),
  ('integrations', 'default_access_level', 'Standard-Zugriffsebene', 'Standard-Berechtigung für API-Keys', 'string', '"read-only"', '"read-only"', 'api', true, 50),
  ('integrations', 'token_rotation_days', 'Token-Rotation (Tage)', 'API-Token muss nach X Tagen erneuert werden', 'number', '90', '90', 'api', true, 60),
  ('integrations', 'webhook_enabled', 'Webhooks aktiviert', 'Webhook-Benachrichtigungen', 'boolean', 'true', 'true', 'webhooks', true, 70),
  ('integrations', 'webhook_retry_count', 'Webhook-Wiederholungen', 'Anzahl Wiederholungsversuche', 'number', '3', '3', 'webhooks', true, 80),
  ('integrations', 'webhook_timeout_seconds', 'Webhook-Timeout (Sek)', 'Timeout für Webhook-Aufrufe', 'number', '30', '30', 'webhooks', true, 90),
  ('integrations', 'encryption_in_transit', 'Verschlüsselung bei Übertragung', 'Daten bei Übertragung verschlüsseln', 'boolean', 'true', 'true', 'security', true, 100),
  ('integrations', 'log_api_calls', 'API-Aufrufe protokollieren', 'Alle API-Aufrufe loggen', 'boolean', 'true', 'true', 'logging', true, 110),
  ('integrations', 'sso_enabled', 'SSO aktiviert', 'Single Sign-On erlauben', 'boolean', 'false', 'true', 'sso', true, 120),
  ('integrations', 'sso_provider', 'SSO-Provider', 'Standard-SSO-Provider', 'string', '"azure"', '"azure"', 'sso', true, 130),
  ('integrations', 'ldap_enabled', 'LDAP aktiviert', 'LDAP-Integration', 'boolean', 'false', 'false', 'ldap', true, 140),
  ('integrations', 'calendar_sync', 'Kalender-Sync', 'Kalenderintegration', 'boolean', 'true', 'true', 'calendar', true, 150)
ON CONFLICT (module, key) DO UPDATE SET recommended_value = EXCLUDED.recommended_value, name = EXCLUDED.name, description = EXCLUDED.description;