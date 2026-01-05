-- Arbeitszeit System - Tabellen erstellen (Teil 1)
-- =====================================================

-- 1. Erweiterte Spalten für arbeitszeit_modelle
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

-- 2. Standorte Tabelle
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

-- 4. Überstundenregelungen Tabelle
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

-- 5. Compliance Regeln Tabelle
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

-- Enable RLS für neue Tabellen
ALTER TABLE standorte ENABLE ROW LEVEL SECURITY;
ALTER TABLE pausenregelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE ueberstunden_regelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_regeln ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin kann alle Standorte verwalten" ON standorte
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Benutzer können aktive Standorte lesen" ON standorte
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Admin kann alle Pausenregelungen verwalten" ON pausenregelungen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Benutzer können aktive Pausenregelungen lesen" ON pausenregelungen
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Admin kann alle Überstundenregelungen verwalten" ON ueberstunden_regelungen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Benutzer können aktive Überstundenregelungen lesen" ON ueberstunden_regelungen
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Admin kann alle Compliance-Regeln verwalten" ON compliance_regeln
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Benutzer können aktive Compliance-Regeln lesen" ON compliance_regeln
    FOR SELECT USING (ist_aktiv = true);

-- Beispieldaten einfügen
INSERT INTO standorte (name, typ, stadt, land, zeitzone, arbeitszeiten, feiertage_region) VALUES
('Hauptsitz München', 'hauptsitz', 'München', 'Deutschland', 'Europe/Berlin', '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "16:00"}}', 'Bayern'),
('Niederlassung Berlin', 'niederlassung', 'Berlin', 'Deutschland', 'Europe/Berlin', '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "15:00"}}', 'Berlin'),
('Remote Work', 'homeoffice', 'Überall', 'Deutschland', 'Europe/Berlin', '{"flexible": true}', 'Deutschland')
ON CONFLICT DO NOTHING;

INSERT INTO pausenregelungen (name, ab_arbeitszeit_stunden, mindestpause_minuten, anzahl_pausen, automatische_buchung) VALUES
('Standard Pausenregelung', 6, 30, 1, true),
('Lange Arbeitszeit', 9, 45, 2, true),
('Schichtarbeit', 8, 30, 1, false)
ON CONFLICT DO NOTHING;

INSERT INTO ueberstunden_regelungen (name, tagesobergrenze, wochenobergrenze, ausgleich_typ, ausgleich_faktor, nachtarbeit_zuschlag, wochenend_zuschlag) VALUES
('Standard Überstunden', 10, 48, 'beides', 1.25, 0.25, 0.50),
('Führungskraft', 12, 60, 'zeit', 1.0, 0.25, 0.50),
('Schichtarbeiter', 10, 48, 'geld', 1.50, 0.50, 1.0)
ON CONFLICT DO NOTHING;

INSERT INTO compliance_regeln (name, beschreibung, regeltyp, land_code, mindest_wert, maximal_wert, einheit, zeitraum, gesetz_referenz) VALUES
('Tägliche Höchstarbeitszeit', 'Maximale Arbeitszeit pro Tag nach ArbZG', 'arbeitszeit', 'DE', 0, 10, 'stunden', 'tag', 'ArbZG §3'),
('Wöchentliche Höchstarbeitszeit', 'Maximale Arbeitszeit pro Woche nach ArbZG', 'arbeitszeit', 'DE', 0, 48, 'stunden', 'woche', 'ArbZG §3'),
('Mindestruhezeit', 'Mindestpause zwischen Arbeitstagen', 'pause', 'DE', 11, 24, 'stunden', 'tag', 'ArbZG §5'),
('Mindestjahresurlaub', 'Mindestanzahl Urlaubstage pro Jahr', 'urlaub', 'DE', 20, 99, 'tage', 'jahr', 'BUrlG §3')
ON CONFLICT DO NOTHING;