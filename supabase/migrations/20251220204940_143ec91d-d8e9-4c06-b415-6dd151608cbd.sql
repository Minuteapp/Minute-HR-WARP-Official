-- =====================================================
-- 80/20 DEFAULTS FRAMEWORK - Schema Extension
-- =====================================================

-- Phase 1: Erweitere settings_definitions um neue Spalten
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS editable_mode text DEFAULT 'both' CHECK (editable_mode IN ('kmu', 'enterprise', 'both'));
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'niedrig' CHECK (risk_level IN ('niedrig', 'mittel', 'hoch'));
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS impact_scope text DEFAULT 'modul' CHECK (impact_scope IN ('modul', 'system', 'rechtlich'));
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS override_allowed boolean DEFAULT true;
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS override_scope text DEFAULT 'global' CHECK (override_scope IN ('global', 'standort', 'abteilung', 'rolle', 'benutzer'));
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS recommended_value jsonb;
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS legal_reference text;
ALTER TABLE settings_definitions ADD COLUMN IF NOT EXISTS affected_roles text[];

-- Phase 2: Erstelle settings_presets Tabelle für Branchen-Templates
CREATE TABLE IF NOT EXISTS settings_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text NOT NULL CHECK (industry IN ('office', 'production', 'retail', 'gastro', 'healthcare')),
  description text,
  settings jsonb NOT NULL DEFAULT '{}',
  active_modules text[] NOT NULL DEFAULT '{}',
  default_workflows text[] DEFAULT '{}',
  default_roles text[] DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS für settings_presets
ALTER TABLE settings_presets ENABLE ROW LEVEL SECURITY;

-- Jeder authentifizierte Benutzer kann Presets lesen
CREATE POLICY "Presets are viewable by authenticated users" 
  ON settings_presets FOR SELECT 
  TO authenticated
  USING (true);

-- Authentifizierte Benutzer können Presets verwalten (Admin-Check erfolgt im Frontend/Service)
CREATE POLICY "Authenticated users can manage presets" 
  ON settings_presets FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Phase 3: 5 Branchen-Presets einfügen
INSERT INTO settings_presets (name, industry, description, settings, active_modules, default_workflows, default_roles, is_default) VALUES

-- 1. Büro/SaaS
('Büro & SaaS', 'office', 'Optimiert für Büroarbeit, Remote-Work und wissensbasierte Unternehmen', 
'{"zeiterfassung":{"auto_pause":true,"pause_nach_stunden":6,"pausendauer_minuten":30,"erinnerung_fehlende_buchung":true,"nachbuchung_begruendung":true,"homeoffice_erlaubt":true,"vertrauensarbeitszeit":true,"kernzeit_start":"09:00","kernzeit_ende":"16:00"},"abwesenheit":{"genehmigung_vorgesetzter":true,"mindest_vorlauf_tage":1,"krankheit_ohne_attest_tage":3,"urlaubstage_default":30},"aufgaben":{"faelligkeit_pflicht":true,"verantwortlicher_pflicht":true,"eskalation_ueberfaellig":true,"eskalation_nach_tagen":3},"ausgaben":{"beleg_pflicht":true,"genehmigung_ab_betrag":100,"auto_kategorisierung":true},"dsgvo":{"aktiv":true,"audit_logs":true,"datenspeicherung_monate":36}}',
ARRAY['zeiterfassung', 'abwesenheit', 'aufgaben', 'projekte', 'dokumente', 'kalender', 'chat', 'ausgaben'],
ARRAY['standard_genehmigung', 'urlaub_workflow'],
ARRAY['Mitarbeiter', 'Teamleiter', 'Manager', 'HR', 'Admin'],
true),

-- 2. Produktion
('Produktion & Fertigung', 'production', 'Für Produktionsbetriebe mit Schichtarbeit und Stechuhren',
'{"zeiterfassung":{"auto_pause":true,"pause_nach_stunden":6,"pausendauer_minuten":30,"stechuhr_pflicht":true,"schichtarbeit":true,"nachtarbeit_erlaubt":true,"wochenendarbeit_erlaubt":true,"vertrauensarbeitszeit":false,"max_stunden_tag":10,"ruhezeit_zwischen_schichten":11},"abwesenheit":{"genehmigung_vorgesetzter":true,"mindest_vorlauf_tage":3,"krankheit_ohne_attest_tage":2,"urlaubstage_default":28,"schichtplan_pruefen":true},"schichtplanung":{"standard_schichten":true,"konflikt_warnung":true,"mindestbesetzung":true,"auto_vertretung":false},"aufgaben":{"faelligkeit_pflicht":true,"verantwortlicher_pflicht":true,"eskalation_ueberfaellig":true},"dsgvo":{"aktiv":true,"audit_logs":true,"datenspeicherung_monate":24}}',
ARRAY['zeiterfassung', 'abwesenheit', 'schichtplanung', 'aufgaben', 'dokumente', 'kalender'],
ARRAY['schicht_workflow', 'urlaub_workflow'],
ARRAY['Arbeiter', 'Schichtleiter', 'Produktionsleiter', 'HR', 'Admin'],
false),

-- 3. Handel/Retail
('Handel & Retail', 'retail', 'Für Einzelhandel mit flexiblen Arbeitszeiten und Wochenendarbeit',
'{"zeiterfassung":{"auto_pause":true,"pause_nach_stunden":6,"pausendauer_minuten":30,"flexible_arbeitszeiten":true,"wochenendarbeit_erlaubt":true,"feiertagsarbeit_erlaubt":true,"vertrauensarbeitszeit":false,"max_stunden_tag":10},"abwesenheit":{"genehmigung_vorgesetzter":true,"mindest_vorlauf_tage":7,"krankheit_ohne_attest_tage":2,"urlaubstage_default":28,"saisonale_sperre":true},"schichtplanung":{"standard_schichten":true,"konflikt_warnung":true,"mindestbesetzung":true,"wochenend_rotation":true},"aufgaben":{"faelligkeit_pflicht":true,"verantwortlicher_pflicht":true},"ausgaben":{"beleg_pflicht":true,"genehmigung_ab_betrag":50,"kassenabrechnung":true},"dsgvo":{"aktiv":true,"audit_logs":true}}',
ARRAY['zeiterfassung', 'abwesenheit', 'schichtplanung', 'aufgaben', 'ausgaben', 'kalender'],
ARRAY['schicht_workflow', 'urlaub_workflow'],
ARRAY['Verkäufer', 'Filialleiter', 'Bezirksleiter', 'HR', 'Admin'],
false),

-- 4. Gastronomie
('Gastronomie & Hotellerie', 'gastro', 'Für Restaurants, Hotels mit Split-Shifts und Trinkgeld-Tracking',
'{"zeiterfassung":{"auto_pause":true,"pause_nach_stunden":6,"pausendauer_minuten":30,"split_shifts":true,"nachtarbeit_erlaubt":true,"wochenendarbeit_erlaubt":true,"feiertagsarbeit_erlaubt":true,"trinkgeld_tracking":true,"vertrauensarbeitszeit":false,"max_stunden_tag":10},"abwesenheit":{"genehmigung_vorgesetzter":true,"mindest_vorlauf_tage":14,"krankheit_ohne_attest_tage":1,"urlaubstage_default":26,"saisonale_sperre":true,"hochsaison_einschraenkung":true},"schichtplanung":{"standard_schichten":true,"konflikt_warnung":true,"mindestbesetzung":true,"split_shift_support":true,"kurzfristige_aenderungen":true},"aufgaben":{"faelligkeit_pflicht":false,"verantwortlicher_pflicht":true},"ausgaben":{"beleg_pflicht":true,"genehmigung_ab_betrag":30,"trinkgeld_abrechnung":true},"dsgvo":{"aktiv":true,"audit_logs":true}}',
ARRAY['zeiterfassung', 'abwesenheit', 'schichtplanung', 'aufgaben', 'ausgaben', 'kalender'],
ARRAY['gastro_schicht_workflow', 'urlaub_workflow'],
ARRAY['Service', 'Küche', 'Schichtleiter', 'Restaurantleiter', 'Admin'],
false),

-- 5. Healthcare
('Gesundheitswesen', 'healthcare', 'Für Krankenhäuser, Praxen mit strenger Compliance und Bereitschaftsdiensten',
'{"zeiterfassung":{"auto_pause":true,"pause_nach_stunden":6,"pausendauer_minuten":30,"bereitschaftsdienst":true,"nachtarbeit_erlaubt":true,"wochenendarbeit_erlaubt":true,"max_stunden_tag":12,"max_stunden_woche":48,"ruhezeit_zwischen_schichten":11,"dokumentation_pflicht":true},"abwesenheit":{"genehmigung_vorgesetzter":true,"genehmigung_mehrfach":true,"mindest_vorlauf_tage":21,"krankheit_ohne_attest_tage":1,"urlaubstage_default":30,"mindestbesetzung_pruefen":true,"vertretung_pflicht":true},"schichtplanung":{"standard_schichten":true,"konflikt_warnung":true,"mindestbesetzung":true,"qualifikation_pruefen":true,"bereitschaft_planung":true,"notfall_kontakt":true},"aufgaben":{"faelligkeit_pflicht":true,"verantwortlicher_pflicht":true,"eskalation_ueberfaellig":true,"eskalation_nach_stunden":24},"dokumente":{"versionierung_pflicht":true,"signatur_erforderlich":true,"aufbewahrung_jahre":10},"dsgvo":{"aktiv":true,"audit_logs":true,"patientendaten_schutz":true,"datenspeicherung_monate":120}}',
ARRAY['zeiterfassung', 'abwesenheit', 'schichtplanung', 'aufgaben', 'dokumente', 'kalender', 'schulungen'],
ARRAY['healthcare_genehmigung', 'bereitschaft_workflow', 'urlaub_workflow'],
ARRAY['Pflege', 'Arzt', 'Stationsleitung', 'Chefarzt', 'Verwaltung', 'Admin'],
false);

-- Kommentar zur Dokumentation
COMMENT ON TABLE settings_presets IS '80/20 Defaults Framework: Branchen-spezifische Voreinstellungen für schnelles Onboarding';