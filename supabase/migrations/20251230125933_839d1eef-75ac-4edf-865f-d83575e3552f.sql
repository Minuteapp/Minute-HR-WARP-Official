-- Insert missing settings_definitions for Global Mobility module
-- Use DO block to handle existing keys gracefully
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT * FROM (VALUES
      ('global_mobility.enabled', 'global_mobility', 'Global Mobility aktivieren', 'Global Mobility Modul aktivieren oder deaktivieren', 'Allgemein', 'boolean', 'true'::jsonb),
      ('global_mobility.relocation_budget', 'global_mobility', 'Standard-Umzugsbudget', 'Standard-Umzugsbudget in EUR', 'Umzug', 'number', '10000'::jsonb),
      ('global_mobility.temporary_housing_days', 'global_mobility', 'Temporäre Unterkunft (Tage)', 'Tage für temporäre Unterkunft', 'Umzug', 'number', '30'::jsonb),
      ('global_mobility.family_support', 'global_mobility', 'Familienunterstützung', 'Umzugskosten für Familienmitglieder übernehmen', 'Umzug', 'boolean', 'true'::jsonb),
      ('global_mobility.relocation_assistance', 'global_mobility', 'Umzugsunterstützung', 'Professionelle Umzugshilfe bereitstellen', 'Umzug', 'boolean', 'true'::jsonb),
      ('global_mobility.short_term_max_months', 'global_mobility', 'Kurzzeiteinsatz Max. Monate', 'Maximale Monate für Kurzzeiteinsätze', 'Einsätze', 'number', '6'::jsonb),
      ('global_mobility.long_term_max_years', 'global_mobility', 'Langzeiteinsatz Max. Jahre', 'Maximale Jahre für Langzeiteinsätze', 'Einsätze', 'number', '3'::jsonb),
      ('global_mobility.permanent_transfer_enabled', 'global_mobility', 'Permanenter Transfer aktiviert', 'Permanente Versetzungen erlauben', 'Einsätze', 'boolean', 'true'::jsonb),
      ('global_mobility.rotational_assignment_enabled', 'global_mobility', 'Rotationseinsätze aktiviert', 'Rotationseinsätze erlauben', 'Einsätze', 'boolean', 'false'::jsonb),
      ('global_mobility.visa_expiry_warning_days', 'global_mobility', 'Visa-Ablauf Warnung (Tage)', 'Tage vor Visa-Ablauf für Warnung', 'Visa', 'number', '90'::jsonb),
      ('global_mobility.document_tracking', 'global_mobility', 'Dokumenten-Tracking', 'Status aller Dokumente verfolgen', 'Visa', 'boolean', 'true'::jsonb),
      ('global_mobility.auto_renewal_reminders', 'global_mobility', 'Automatische Verlängerungs-Erinnerungen', 'Automatische Erinnerungen für Verlängerung senden', 'Visa', 'boolean', 'true'::jsonb),
      ('global_mobility.residence_tracking', 'global_mobility', 'Aufenthalts-Tracking', 'Tage pro Land verfolgen', 'Steuern', 'boolean', 'true'::jsonb),
      ('global_mobility.tax_threshold_warning_days', 'global_mobility', 'Steuer-Schwellenwert Warnung (Tage)', 'Warnung bei Annäherung an Steuer-Schwellenwert', 'Steuern', 'number', '150'::jsonb),
      ('global_mobility.notify_on_status_change', 'global_mobility', 'Bei Statusänderung benachrichtigen', 'Benachrichtigung bei Einsatz-Statusänderung senden', 'Benachrichtigungen', 'boolean', 'true'::jsonb),
      ('global_mobility.notify_before_assignment_end', 'global_mobility', 'Vor Einsatzende erinnern', 'Erinnerung vor Einsatzende senden', 'Benachrichtigungen', 'boolean', 'true'::jsonb),
      ('global_mobility.assignment_end_reminder_days', 'global_mobility', 'Einsatzende-Erinnerung (Tage)', 'Tage vor Einsatzende für Erinnerung', 'Benachrichtigungen', 'number', '30'::jsonb),
      ('global_mobility.default_housing_allowance', 'global_mobility', 'Standard Housing Allowance', 'Standard Housing Allowance in EUR', 'Zulagen', 'number', '2000'::jsonb),
      ('global_mobility.default_cola_percentage', 'global_mobility', 'Standard COLA Prozentsatz', 'Standard Lebenshaltungskosten-Anpassung in Prozent', 'Zulagen', 'number', '15'::jsonb),
      ('global_mobility.education_allowance_enabled', 'global_mobility', 'Bildungszulage aktiviert', 'Bildungszulage für Angehörige aktivieren', 'Zulagen', 'boolean', 'false'::jsonb),
      ('global_mobility.social_security_tracking', 'global_mobility', 'Sozialversicherungs-Tracking', 'Sozialversicherungsanforderungen verfolgen', 'Compliance', 'boolean', 'true'::jsonb),
      ('global_mobility.a1_certificate_required', 'global_mobility', 'A1-Bescheinigung erforderlich', 'A1-Bescheinigung für EU-Einsätze erforderlich', 'Compliance', 'boolean', 'true'::jsonb),
      ('global_mobility.approval_required', 'global_mobility', 'Genehmigung erforderlich', 'Genehmigung für Mobility-Anträge erforderlich', 'Genehmigungen', 'boolean', 'true'::jsonb),
      ('global_mobility.approver_role', 'global_mobility', 'Genehmiger-Rolle', 'Standard-Rolle für Mobility-Genehmigungen', 'Genehmigungen', 'string', '"hr_manager"'::jsonb)
    ) AS t(key, module, name, description, category, value_type, default_value)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM settings_definitions WHERE key = r.key) THEN
      INSERT INTO settings_definitions (key, module, name, description, category, value_type, default_value)
      VALUES (r.key, r.module, r.name, r.description, r.category, r.value_type, r.default_value);
    END IF;
  END LOOP;
END $$;