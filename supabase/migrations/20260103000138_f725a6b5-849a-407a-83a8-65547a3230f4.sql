-- Migration 2: Finanzen & Reisen (Expenses, Payroll) - Vollständige 80/20 Settings

-- EXPENSES Settings mit recommended_value
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  -- Limits
  ('expenses', 'daily_limit', 'Tägliches Limit (€)', 'Maximaler Tagesbetrag für Ausgaben', 'number', '150', '150', 'limits', true, 10),
  ('expenses', 'monthly_limit', 'Monatliches Limit (€)', 'Maximaler Monatsbetrag für Ausgaben', 'number', '1500', '1500', 'limits', true, 20),
  ('expenses', 'single_expense_limit', 'Einzelausgabe-Limit (€)', 'Maximaler Betrag pro Einzelausgabe', 'number', '500', '500', 'limits', true, 30),
  ('expenses', 'auto_approval_threshold', 'Auto-Genehmigung bis (€)', 'Automatisch genehmigen bis zu diesem Betrag', 'number', '50', '50', 'limits', true, 40),
  -- Belege & OCR
  ('expenses', 'ocr_enabled', 'OCR aktivieren', 'Automatische Belegerfassung', 'boolean', 'true', 'true', 'receipts', true, 50),
  ('expenses', 'receipt_required', 'Beleg erforderlich', 'Beleg für alle Ausgaben erforderlich', 'boolean', 'true', 'true', 'receipts', true, 60),
  ('expenses', 'receipt_min_amount', 'Beleg ab Betrag (€)', 'Ab welchem Betrag Beleg erforderlich', 'number', '10', '10', 'receipts', true, 70),
  ('expenses', 'duplicate_check', 'Duplikatprüfung', 'Prüfung auf doppelte Belege', 'boolean', 'true', 'true', 'receipts', true, 80),
  -- Compliance
  ('expenses', 'gobd_compliant', 'GoBD-konform', 'GoBD-konforme Archivierung', 'boolean', 'true', 'true', 'compliance', true, 90),
  ('expenses', 'retention_years', 'Aufbewahrungsfrist (Jahre)', 'Wie lange Belege aufbewahrt werden', 'number', '10', '10', 'compliance', true, 100),
  ('expenses', 'audit_trail', 'Audit-Trail', 'Vollständige Änderungshistorie', 'boolean', 'true', 'true', 'compliance', true, 110),
  -- Kilometerpauschale
  ('expenses', 'mileage_enabled', 'Kilometerpauschale', 'Kilometerabrechnung aktivieren', 'boolean', 'true', 'true', 'mileage', true, 120),
  ('expenses', 'car_rate', 'PKW-Pauschale (€/km)', 'Kilometerpauschale für PKW', 'number', '0.30', '0.30', 'mileage', true, 130),
  ('expenses', 'bike_rate', 'Fahrrad-Pauschale (€/km)', 'Kilometerpauschale für Fahrrad', 'number', '0.05', '0.05', 'mileage', true, 140),
  ('expenses', 'motorcycle_rate', 'Motorrad-Pauschale (€/km)', 'Kilometerpauschale für Motorrad', 'number', '0.20', '0.20', 'mileage', true, 150),
  -- Verpflegungspauschalen
  ('expenses', 'meal_allowances_enabled', 'Verpflegungspauschalen', 'Verpflegungsmehraufwand aktivieren', 'boolean', 'true', 'true', 'meal_allowances', true, 160),
  ('expenses', 'domestic_8_24_hours', 'Inland 8-24 Std (€)', 'Pauschale für Abwesenheit 8-24 Stunden', 'number', '14', '14', 'meal_allowances', true, 170),
  ('expenses', 'domestic_over_24_hours', 'Inland über 24 Std (€)', 'Pauschale für Abwesenheit über 24 Stunden', 'number', '28', '28', 'meal_allowances', true, 180),
  ('expenses', 'deduction_breakfast', 'Kürzung Frühstück (€)', 'Kürzung bei gestelltem Frühstück', 'number', '5.60', '5.60', 'meal_allowances', true, 190),
  ('expenses', 'deduction_lunch', 'Kürzung Mittagessen (€)', 'Kürzung bei gestelltem Mittagessen', 'number', '11.20', '11.20', 'meal_allowances', true, 200),
  ('expenses', 'deduction_dinner', 'Kürzung Abendessen (€)', 'Kürzung bei gestelltem Abendessen', 'number', '11.20', '11.20', 'meal_allowances', true, 210),
  -- Kategorien
  ('expenses', 'category_travel', 'Kategorie Reise', 'Reisekosten-Kategorie aktivieren', 'boolean', 'true', 'true', 'categories', true, 220),
  ('expenses', 'category_meals', 'Kategorie Bewirtung', 'Bewirtungskosten-Kategorie aktivieren', 'boolean', 'true', 'true', 'categories', true, 230),
  ('expenses', 'category_office', 'Kategorie Büro', 'Bürobedarf-Kategorie aktivieren', 'boolean', 'true', 'true', 'categories', true, 240),
  ('expenses', 'category_training', 'Kategorie Weiterbildung', 'Weiterbildungskosten-Kategorie aktivieren', 'boolean', 'true', 'true', 'categories', true, 250),
  ('expenses', 'category_it', 'Kategorie IT', 'IT-Kosten-Kategorie aktivieren', 'boolean', 'true', 'true', 'categories', true, 260),
  -- Genehmigung
  ('expenses', 'approval_required', 'Genehmigung erforderlich', 'Alle Ausgaben müssen genehmigt werden', 'boolean', 'true', 'true', 'approval', true, 270),
  ('expenses', 'multi_level_approval', 'Mehrstufige Genehmigung', 'Genehmigung durch mehrere Instanzen', 'boolean', 'false', 'false', 'approval', true, 280),
  ('expenses', 'manager_approval', 'Vorgesetzten-Genehmigung', 'Vorgesetzter muss genehmigen', 'boolean', 'true', 'true', 'approval', true, 290),
  ('expenses', 'finance_approval', 'Finanz-Genehmigung', 'Finanzabteilung muss genehmigen', 'boolean', 'false', 'true', 'approval', true, 300),
  -- Export
  ('expenses', 'datev_export', 'DATEV-Export', 'Export im DATEV-Format', 'boolean', 'true', 'true', 'export', true, 310),
  ('expenses', 'auto_export', 'Automatischer Export', 'Automatischer monatlicher Export', 'boolean', 'false', 'true', 'export', true, 320)
ON CONFLICT (module, key) DO UPDATE SET
  recommended_value = EXCLUDED.recommended_value,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- PAYROLL Settings mit recommended_value
INSERT INTO settings_definitions (module, key, name, description, value_type, default_value, recommended_value, category, is_active, sort_order)
VALUES
  -- Allgemein
  ('payroll', 'currency', 'Währung', 'Standard-Währung für Lohnabrechnung', 'string', '"EUR"', '"EUR"', 'general', true, 10),
  ('payroll', 'payroll_type', 'Abrechnungsrhythmus', 'Monatlich oder wöchentlich', 'string', '"monthly"', '"monthly"', 'general', true, 20),
  ('payroll', 'pay_day', 'Zahltag', 'Tag der Lohnüberweisung', 'number', '25', '25', 'general', true, 30),
  ('payroll', 'retroactive_changes', 'Rückwirkende Änderungen', 'Rückwirkende Lohnänderungen erlauben', 'boolean', 'true', 'true', 'general', true, 40),
  -- Berechnung
  ('payroll', 'auto_calculate_overtime', 'Überstunden automatisch', 'Überstunden automatisch berechnen', 'boolean', 'true', 'true', 'calculation', true, 50),
  ('payroll', 'overtime_rate', 'Überstundenzuschlag (%)', 'Prozentualer Zuschlag für Überstunden', 'number', '25', '25', 'calculation', true, 60),
  ('payroll', 'night_shift_rate', 'Nachtzuschlag (%)', 'Prozentualer Zuschlag für Nachtarbeit', 'number', '25', '25', 'calculation', true, 70),
  ('payroll', 'sunday_rate', 'Sonntagszuschlag (%)', 'Prozentualer Zuschlag für Sonntagsarbeit', 'number', '50', '50', 'calculation', true, 80),
  ('payroll', 'holiday_rate', 'Feiertagszuschlag (%)', 'Prozentualer Zuschlag für Feiertagsarbeit', 'number', '100', '100', 'calculation', true, 90),
  -- Sozialversicherung
  ('payroll', 'health_insurance_rate', 'KV-Beitrag Arbeitgeber (%)', 'Krankenversicherung Arbeitgeberanteil', 'number', '7.3', '7.3', 'social_insurance', true, 100),
  ('payroll', 'pension_rate', 'RV-Beitrag Arbeitgeber (%)', 'Rentenversicherung Arbeitgeberanteil', 'number', '9.3', '9.3', 'social_insurance', true, 110),
  ('payroll', 'unemployment_rate', 'AV-Beitrag Arbeitgeber (%)', 'Arbeitslosenversicherung Arbeitgeberanteil', 'number', '1.3', '1.3', 'social_insurance', true, 120),
  ('payroll', 'care_insurance_rate', 'PV-Beitrag Arbeitgeber (%)', 'Pflegeversicherung Arbeitgeberanteil', 'number', '1.7', '1.7', 'social_insurance', true, 130),
  -- Compliance
  ('payroll', 'gobd_archiving', 'GoBD-Archivierung', 'GoBD-konforme Lohndokumente archivieren', 'boolean', 'true', 'true', 'compliance', true, 140),
  ('payroll', 'retention_years', 'Aufbewahrungsfrist (Jahre)', 'Aufbewahrungsfrist für Lohndokumente', 'number', '10', '10', 'compliance', true, 150),
  ('payroll', 'audit_trail', 'Audit-Trail', 'Vollständige Änderungshistorie', 'boolean', 'true', 'true', 'compliance', true, 160),
  -- Export
  ('payroll', 'datev_export', 'DATEV-Export', 'Export im DATEV-Format', 'boolean', 'true', 'true', 'export', true, 170),
  ('payroll', 'elster_enabled', 'ELSTER aktiviert', 'Elektronische Steuererklärung', 'boolean', 'true', 'true', 'export', true, 180),
  ('payroll', 'sepa_export', 'SEPA-Export', 'SEPA-Überweisungen generieren', 'boolean', 'true', 'true', 'export', true, 190),
  -- Benachrichtigungen
  ('payroll', 'notify_employee', 'Mitarbeiter benachrichtigen', 'Benachrichtigung bei Lohnabrechnung', 'boolean', 'true', 'true', 'notifications', true, 200),
  ('payroll', 'payslip_email', 'Lohnzettel per E-Mail', 'Lohnzettel automatisch per E-Mail senden', 'boolean', 'true', 'true', 'notifications', true, 210)
ON CONFLICT (module, key) DO UPDATE SET
  recommended_value = EXCLUDED.recommended_value,
  name = EXCLUDED.name,
  description = EXCLUDED.description;