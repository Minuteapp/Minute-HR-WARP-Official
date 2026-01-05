-- Arbeitszeit & Abwesenheiten System - Komplett
-- =====================================================

-- 1. Arbeitszeitmodelle erweitern
ALTER TABLE arbeitszeit_modelle ADD COLUMN IF NOT EXISTS 
  arbeitsort_regelung text DEFAULT 'buero',
  ADD COLUMN IF NOT EXISTS remote_tage_pro_woche integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hybrid_model boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vertrauensarbeitszeit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS automatische_pausenbuchung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mindestpause_minuten integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ruhepause_zwischen_schichten integer DEFAULT 11,
  ADD COLUMN IF NOT EXISTS wochenendarbeit_erlaubt boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS nachtarbeit_erlaubt boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS schichtarbeit_typ text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS urlaubstage_pro_jahr integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS krankheitstage_ohne_attest integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS genehmigung_erforderlich boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mehrfach_genehmigung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_genehmigung_schwelle integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS benachrichtigungen_aktiv boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS eskalation_nach_stunden integer DEFAULT 24,
  ADD COLUMN IF NOT EXISTS standort_id uuid,
  ADD COLUMN IF NOT EXISTS abteilung text,
  ADD COLUMN IF NOT EXISTS kostenstelle text,
  ADD COLUMN IF NOT EXISTS tarifgruppe text,
  ADD COLUMN IF NOT EXISTS sonderregelungen jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS compliance_regeln jsonb DEFAULT '{}';

-- 2. Überstundenregelungen Tabelle
CREATE TABLE IF NOT EXISTS ueberstunden_regelungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arbeitszeit_modell_id uuid REFERENCES arbeitszeit_modelle(id),
  name text NOT NULL,
  tagesobergrenze numeric DEFAULT 10,
  wochenobergrenze numeric DEFAULT 50,
  monatsobergrenze numeric DEFAULT 200,
  jahresobergrenze numeric DEFAULT 2000,
  ausgleich_typ text DEFAULT 'zeit', -- 'zeit', 'geld', 'beides'
  ausgleich_faktor numeric DEFAULT 1.25,
  genehmigung_erforderlich boolean DEFAULT true,
  automatische_warnung boolean DEFAULT true,
  warn_schwelle_prozent integer DEFAULT 80,
  auszahlung_schwelle numeric DEFAULT 40,
  verfallszeit_monate integer DEFAULT 12,
  nachtarbeit_zuschlag numeric DEFAULT 0.25,
  wochenend_zuschlag numeric DEFAULT 0.50,
  feiertag_zuschlag numeric DEFAULT 1.0,
  bereitschaftsdienst_zuschlag numeric DEFAULT 0.15,
  mindestausgleich_stunden numeric DEFAULT 4,
  teilbare_ausgleich boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  ist_aktiv boolean DEFAULT true
);

-- 3. Pausenregelungen Tabelle
CREATE TABLE IF NOT EXISTS pausenregelungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arbeitszeit_modell_id uuid REFERENCES arbeitszeit_modelle(id),
  name text NOT NULL,
  ab_arbeitszeit_stunden numeric NOT NULL,
  mindestpause_minuten integer NOT NULL,
  maximal_pause_minuten integer DEFAULT 90,
  anzahl_pausen integer DEFAULT 1,
  teilbare_pausen boolean DEFAULT true,
  automatische_buchung boolean DEFAULT false,
  warnung_bei_ueberschreitung boolean DEFAULT true,
  bezahlte_pause boolean DEFAULT false,
  raucherpause_erlaubt boolean DEFAULT false,
  raucherpause_minuten integer DEFAULT 5,
  raucherpause_anzahl integer DEFAULT 3,
  essenspause_zuschuss numeric DEFAULT 0,
  kantinenzuschuss_aktiv boolean DEFAULT false,
  flexible_pausenzeiten boolean DEFAULT true,
  kernzeit_pausensperre boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ist_aktiv boolean DEFAULT true
);

-- 4. Abwesenheitsarten erweitern
ALTER TABLE abwesenheitsarten ADD COLUMN IF NOT EXISTS
  automatische_genehmigung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS genehmigungs_workflow text DEFAULT 'einfach',
  ADD COLUMN IF NOT EXISTS eskalation_nach_stunden integer DEFAULT 24,
  ADD COLUMN IF NOT EXISTS mehrfach_genehmigung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS genehmiger_rollen jsonb DEFAULT '["manager", "hr"]',
  ADD COLUMN IF NOT EXISTS auto_vertretung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vertretung_pflicht boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mindest_vorlaufzeit_tage integer DEFAULT 7,
  ADD COLUMN IF NOT EXISTS maximal_vorlaufzeit_tage integer DEFAULT 365,
  ADD COLUMN IF NOT EXISTS teilzeiten_erlaubt boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS stundenweise_buchung boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS uebertragung_erlaubt boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS uebertragung_bis_datum date,
  ADD COLUMN IF NOT EXISTS auszahlung_erlaubt boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auszahlung_faktor numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS saisonale_sperre jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS team_limits jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS kombinierbar_mit text[],
  ADD COLUMN IF NOT EXISTS ausschliesst text[],
  ADD COLUMN IF NOT EXISTS lohnfortzahlung boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sozialversicherung boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS steuerlich_relevant boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS meldepflicht_behoerde boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dokumentation_erforderlich boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_dokumente jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS automatische_benachrichtigung boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS benachrichtigungs_template text,
  ADD COLUMN IF NOT EXISTS eskalations_kette jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS compliance_regeln jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS länderspezifisch jsonb DEFAULT '{}';

-- 5. Genehmigungsworkflows Tabelle
CREATE TABLE IF NOT EXISTS genehmigungsworkflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  workflow_typ text DEFAULT 'einfach', -- 'einfach', 'mehrstufig', 'parallel', 'bedingt'
  modul text NOT NULL, -- 'urlaub', 'krankheit', 'ueberstunden', 'projekt'
  abwesenheitsart_id uuid REFERENCES abwesenheitsarten(id),
  stufen jsonb NOT NULL DEFAULT '[]', -- Array von Genehmigungsstufen
  bedingungen jsonb DEFAULT '{}', -- Wenn-Dann Regeln
  automatische_genehmigung jsonb DEFAULT '{}', -- Automatik-Regeln
  eskalation_regeln jsonb DEFAULT '{}', -- Eskalation bei Verzögerung
  benachrichtigungen jsonb DEFAULT '{}', -- Notification-Settings
  fristen jsonb DEFAULT '{}', -- Zeitlimits pro Stufe
  vertretungsregeln jsonb DEFAULT '{}', -- Urlaubsvertretung
  dokumentation_erforderlich boolean DEFAULT false,
  audit_trail boolean DEFAULT true,
  ist_aktiv boolean DEFAULT true,
  gueltig_ab date DEFAULT CURRENT_DATE,
  gueltig_bis date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 6. Schichtmodelle Tabelle
CREATE TABLE IF NOT EXISTS schichtmodelle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  schichttyp text NOT NULL, -- 'frueh', 'spaet', 'nacht', 'wechsel'
  arbeitszeit_modell_id uuid REFERENCES arbeitszeit_modelle(id),
  schichtzeiten jsonb NOT NULL, -- Array von Schichtzeiten
  rotation_zyklen jsonb DEFAULT '{}', -- Rotationsmuster
  mindestbesetzung integer DEFAULT 1,
  maximalbesetzung integer DEFAULT 10,
  skill_anforderungen jsonb DEFAULT '[]',
  zuschlaege jsonb DEFAULT '{}', -- Nacht-, Wochenend-Zuschläge
  pausenregelung_id uuid REFERENCES pausenregelungen(id),
  tauschboerse_erlaubt boolean DEFAULT true,
  kurzfristige_aenderungen boolean DEFAULT false,
  planungsvorlauf_tage integer DEFAULT 14,
  benachrichtigung_aenderung boolean DEFAULT true,
  automatische_zuteilung boolean DEFAULT false,
  priorisierung_regeln jsonb DEFAULT '{}',
  ist_aktiv boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 7. Zeiterfassungsregeln Tabelle
CREATE TABLE IF NOT EXISTS zeiterfassungsregeln (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  arbeitszeit_modell_id uuid REFERENCES arbeitszeit_modelle(id),
  erfassung_typ text DEFAULT 'manual', -- 'manual', 'automatisch', 'hybrid'
  rundung_minuten integer DEFAULT 15,
  rundung_typ text DEFAULT 'mathematisch', -- 'auf', 'ab', 'mathematisch'
  mindest_arbeitszeit_minuten integer DEFAULT 30,
  maximal_arbeitszeit_stunden integer DEFAULT 12,
  kommt_warnung_minuten integer DEFAULT 15,
  geht_warnung_minuten integer DEFAULT 30,
  vergessene_buchung_stunden integer DEFAULT 24,
  nachtraegliche_buchung_tage integer DEFAULT 7,
  genehmigung_nachtrag boolean DEFAULT true,
  geofencing_aktiv boolean DEFAULT false,
  geofencing_radius integer DEFAULT 100,
  ip_whitelist jsonb DEFAULT '[]',
  device_binding boolean DEFAULT false,
  screenshot_monitoring boolean DEFAULT false,
  activity_tracking boolean DEFAULT false,
  break_tracking boolean DEFAULT true,
  projekt_buchung_pflicht boolean DEFAULT false,
  kostenstellenzuordnung boolean DEFAULT false,
  qualitaetskontrolle boolean DEFAULT false,
  plausibilitaetspruefung boolean DEFAULT true,
  auto_korrektur boolean DEFAULT false,
  benachrichtigungen jsonb DEFAULT '{}',
  reporting_intervall text DEFAULT 'wochentlich',
  ist_aktiv boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 8. Compliance Regeln Tabelle
CREATE TABLE IF NOT EXISTS compliance_regeln (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  regeltyp text NOT NULL, -- 'arbeitszeit', 'pause', 'urlaub', 'gesundheit'
  land_code text DEFAULT 'DE',
  bundesland text,
  branche text,
  gesetz_referenz text,
  paragraph text,
  mindest_wert numeric,
  maximal_wert numeric,
  einheit text, -- 'stunden', 'tage', 'prozent'
  zeitraum text, -- 'tag', 'woche', 'monat', 'jahr'
  ausnahmen jsonb DEFAULT '{}',
  strafmass text,
  kontrollintervall text DEFAULT 'taeglich',
  automatische_pruefung boolean DEFAULT true,
  warnung_bei_verletzung boolean DEFAULT true,
  blockierung_bei_verletzung boolean DEFAULT false,
  dokumentation_erforderlich boolean DEFAULT true,
  meldepflicht boolean DEFAULT false,
  behoerde text,
  bussgeldhöhe numeric,
  ist_aktiv boolean DEFAULT true,
  gueltig_ab date DEFAULT CURRENT_DATE,
  gueltig_bis date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 9. Standorte Tabelle
CREATE TABLE IF NOT EXISTS standorte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  typ text DEFAULT 'hauptsitz', -- 'hauptsitz', 'niederlassung', 'homeoffice', 'mobil'
  adresse text,
  postleitzahl text,
  stadt text,
  land text DEFAULT 'Deutschland',
  zeitzone text DEFAULT 'Europe/Berlin',
  telefon text,
  email text,
  ansprechpartner text,
  kostenstelle text,
  steuerliche_betriebsstaette boolean DEFAULT false,
  betriebsrat_vorhanden boolean DEFAULT false,
  arbeitszeiten jsonb DEFAULT '{}', -- Öffnungszeiten
  feiertage_region text,
  tarif_region text,
  mindestlohn_region text,
  arbeitsschutz_beauftragte text,
  brandschutz_beauftragte text,
  erste_hilfe_beauftragte text,
  sicherheitsregeln jsonb DEFAULT '{}',
  notfallkontakte jsonb DEFAULT '{}',
  ist_aktiv boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 10. Triggers für automatische Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ueberstunden_regelungen_updated_at
    BEFORE UPDATE ON ueberstunden_regelungen
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pausenregelungen_updated_at
    BEFORE UPDATE ON pausenregelungen
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genehmigungsworkflows_updated_at
    BEFORE UPDATE ON genehmigungsworkflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schichtmodelle_updated_at
    BEFORE UPDATE ON schichtmodelle
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zeiterfassungsregeln_updated_at
    BEFORE UPDATE ON zeiterfassungsregeln
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_regeln_updated_at
    BEFORE UPDATE ON compliance_regeln
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standorte_updated_at
    BEFORE UPDATE ON standorte
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. RLS Policies für alle Tabellen
ALTER TABLE ueberstunden_regelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE pausenregelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE genehmigungsworkflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE schichtmodelle ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeiterfassungsregeln ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_regeln ENABLE ROW LEVEL SECURITY;
ALTER TABLE standorte ENABLE ROW LEVEL SECURITY;

-- Admin/HR kann alles verwalten
CREATE POLICY "Admin kann alle Überstundenregelungen verwalten" ON ueberstunden_regelungen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Pausenregelungen verwalten" ON pausenregelungen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Genehmigungsworkflows verwalten" ON genehmigungsworkflows
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Schichtmodelle verwalten" ON schichtmodelle
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Zeiterfassungsregeln verwalten" ON zeiterfassungsregeln
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Compliance-Regeln verwalten" ON compliance_regeln
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admin kann alle Standorte verwalten" ON standorte
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Benutzer können aktive Regeln lesen
CREATE POLICY "Benutzer können aktive Überstundenregelungen lesen" ON ueberstunden_regelungen
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Pausenregelungen lesen" ON pausenregelungen
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Genehmigungsworkflows lesen" ON genehmigungsworkflows
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Schichtmodelle lesen" ON schichtmodelle
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Zeiterfassungsregeln lesen" ON zeiterfassungsregeln
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Compliance-Regeln lesen" ON compliance_regeln
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können aktive Standorte lesen" ON standorte
    FOR SELECT USING (ist_aktiv = true);

-- 12. Beispieldaten einfügen
INSERT INTO standorte (name, typ, stadt, land, zeitzone, arbeitszeiten, feiertage_region) VALUES
('Hauptsitz München', 'hauptsitz', 'München', 'Deutschland', 'Europe/Berlin', '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "16:00"}}', 'Bayern'),
('Niederlassung Berlin', 'niederlassung', 'Berlin', 'Deutschland', 'Europe/Berlin', '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "15:00"}}', 'Berlin'),
('Remote Work', 'homeoffice', 'Überall', 'Deutschland', 'Europe/Berlin', '{"flexible": true}', 'Deutschland');

INSERT INTO pausenregelungen (name, ab_arbeitszeit_stunden, mindestpause_minuten, anzahl_pausen, automatische_buchung) VALUES
('Standard Pausenregelung', 6, 30, 1, true),
('Lange Arbeitszeit', 9, 45, 2, true),
('Schichtarbeit', 8, 30, 1, false);

INSERT INTO ueberstunden_regelungen (name, tagesobergrenze, wochenobergrenze, ausgleich_typ, ausgleich_faktor, nachtarbeit_zuschlag, wochenend_zuschlag) VALUES
('Standard Überstunden', 10, 48, 'beides', 1.25, 0.25, 0.50),
('Führungskraft', 12, 60, 'zeit', 1.0, 0.25, 0.50),
('Schichtarbeiter', 10, 48, 'geld', 1.50, 0.50, 1.0);

INSERT INTO compliance_regeln (name, beschreibung, regeltyp, land_code, mindest_wert, maximal_wert, einheit, zeitraum, gesetz_referenz) VALUES
('Tägliche Höchstarbeitszeit', 'Maximale Arbeitszeit pro Tag nach ArbZG', 'arbeitszeit', 'DE', 0, 10, 'stunden', 'tag', 'ArbZG §3'),
('Wöchentliche Höchstarbeitszeit', 'Maximale Arbeitszeit pro Woche nach ArbZG', 'arbeitszeit', 'DE', 0, 48, 'stunden', 'woche', 'ArbZG §3'),
('Mindestruhezeit', 'Mindestpause zwischen Arbeitstagen', 'pause', 'DE', 11, 24, 'stunden', 'tag', 'ArbZG §5'),
('Mindestjahresurlaub', 'Mindestanzahl Urlaubstage pro Jahr', 'urlaub', 'DE', 20, 99, 'tage', 'jahr', 'BUrlG §3');

INSERT INTO genehmigungsworkflows (name, beschreibung, workflow_typ, modul, stufen, automatische_genehmigung, fristen) VALUES
('Einfacher Urlaubsantrag', 'Standard Urlaubsgenehmigung durch Vorgesetzten', 'einfach', 'urlaub', 
'[{"stufe": 1, "rolle": "manager", "name": "Vorgesetzter"}]', 
'{"bis_tage": 2, "resturlaub": true}', 
'{"stufe_1": 48}'),
('Mehrstufiger Urlaubsantrag', 'Urlaubsgenehmigung für längere Abwesenheiten', 'mehrstufig', 'urlaub',
'[{"stufe": 1, "rolle": "manager", "name": "Vorgesetzter"}, {"stufe": 2, "rolle": "hr", "name": "HR"}]',
'{}',
'{"stufe_1": 24, "stufe_2": 48}'),
('Überstunden Genehmigung', 'Genehmigung für Überstunden', 'einfach', 'ueberstunden',
'[{"stufe": 1, "rolle": "manager", "name": "Vorgesetzter"}]',
'{"bis_stunden": 5}',
'{"stufe_1": 12}');

INSERT INTO zeiterfassungsregeln (name, beschreibung, rundung_minuten, rundung_typ, mindest_arbeitszeit_minuten, maximal_arbeitszeit_stunden, geofencing_aktiv, break_tracking) VALUES
('Büroarbeit Standard', 'Standard Zeiterfassung für Büroarbeit', 15, 'mathematisch', 30, 12, false, true),
('Außendienst', 'Zeiterfassung für Außendienst mit GPS', 15, 'mathematisch', 60, 12, true, true),
('Vertrauensarbeitszeit', 'Flexible Zeiterfassung für Führungskräfte', 60, 'mathematisch', 0, 24, false, false);

INSERT INTO schichtmodelle (name, beschreibung, schichttyp, schichtzeiten, mindestbesetzung, tauschboerse_erlaubt, zuschlaege) VALUES
('Frühschicht', 'Standard Frühschicht 06:00-14:00', 'frueh', 
'[{"start": "06:00", "end": "14:00", "pause": 30}]', 
2, true, '{"frueh": 0.1}'),
('Spätschicht', 'Standard Spätschicht 14:00-22:00', 'spaet',
'[{"start": "14:00", "end": "22:00", "pause": 30}]',
2, true, '{"spaet": 0.15}'),
('Nachtschicht', 'Standard Nachtschicht 22:00-06:00', 'nacht',
'[{"start": "22:00", "end": "06:00", "pause": 30}]',
1, true, '{"nacht": 0.25}');