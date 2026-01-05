-- Fix für Trigger-Fehler und komplette Arbeitszeit-Tabellen erstellen
-- =====================================================

-- Trigger nur erstellen wenn sie nicht existieren
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ueberstunden_regelungen_updated_at') THEN
        CREATE TRIGGER update_ueberstunden_regelungen_updated_at
            BEFORE UPDATE ON ueberstunden_regelungen
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_genehmigungsworkflows_updated_at') THEN
        CREATE TRIGGER update_genehmigungsworkflows_updated_at
            BEFORE UPDATE ON genehmigungsworkflows
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schichtmodelle_updated_at') THEN
        CREATE TRIGGER update_schichtmodelle_updated_at
            BEFORE UPDATE ON schichtmodelle
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_zeiterfassungsregeln_updated_at') THEN
        CREATE TRIGGER update_zeiterfassungsregeln_updated_at
            BEFORE UPDATE ON zeiterfassungsregeln
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_compliance_regeln_updated_at') THEN
        CREATE TRIGGER update_compliance_regeln_updated_at
            BEFORE UPDATE ON compliance_regeln
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_standorte_updated_at') THEN
        CREATE TRIGGER update_standorte_updated_at
            BEFORE UPDATE ON standorte
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Zusätzliche Tabellen für erweiterte Funktionalität
CREATE TABLE IF NOT EXISTS feiertage_kalender (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  datum date NOT NULL,
  region text NOT NULL, -- 'Deutschland', 'Bayern', 'Berlin', etc.
  typ text DEFAULT 'gesetzlich', -- 'gesetzlich', 'regional', 'betrieblich', 'religiös'
  wiederkehrend boolean DEFAULT true,
  beweglich boolean DEFAULT false, -- Ostern, Pfingsten etc.
  berechnung_regel text, -- Für bewegliche Feiertage
  ist_aktiv boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(datum, region)
);

CREATE TABLE IF NOT EXISTS arbeitszeit_vorlagen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  branche text,
  mitarbeiter_anzahl_min integer,
  mitarbeiter_anzahl_max integer,
  template_data jsonb NOT NULL,
  kategorien text[], -- 'vollzeit', 'teilzeit', 'schicht', 'gleitzeit'
  compliance_level text DEFAULT 'standard', -- 'basic', 'standard', 'premium'
  land_code text DEFAULT 'DE',
  erstellungsdatum date DEFAULT CURRENT_DATE,
  version text DEFAULT '1.0',
  changelog text,
  ist_aktiv boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS abwesenheit_kontingente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id uuid NOT NULL,
  abwesenheitsart_id uuid REFERENCES abwesenheitsarten(id),
  jahr integer NOT NULL,
  kontingent_tage numeric NOT NULL,
  bereits_genommen_tage numeric DEFAULT 0,
  bereits_geplant_tage numeric DEFAULT 0,
  verfügbar_tage numeric GENERATED ALWAYS AS (kontingent_tage - bereits_genommen_tage - bereits_geplant_tage) STORED,
  uebertrag_vorjahr numeric DEFAULT 0,
  verfallsdatum date,
  auszahlung_bei_austritt boolean DEFAULT false,
  automatische_aktualisierung boolean DEFAULT true,
  sonderkontingent numeric DEFAULT 0,
  sonderkontingent_grund text,
  notizen text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(mitarbeiter_id, abwesenheitsart_id, jahr)
);

CREATE TABLE IF NOT EXISTS benachrichtigungs_einstellungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id uuid,
  modul text NOT NULL, -- 'arbeitszeit', 'urlaub', 'überstunden', 'schicht'
  ereignis_typ text NOT NULL, -- 'genehmigung', 'ablehnung', 'erinnerung', 'warnung'
  kanal text NOT NULL, -- 'email', 'sms', 'push', 'inapp'
  ist_aktiv boolean DEFAULT true,
  frequenz text DEFAULT 'sofort', -- 'sofort', 'täglich', 'wöchentlich'
  stille_zeiten jsonb DEFAULT '{}', -- Zeiten ohne Benachrichtigungen
  vorlagen_id uuid,
  personalisiert boolean DEFAULT false,
  filter_regeln jsonb DEFAULT '{}',
  eskalation_nach_stunden integer DEFAULT 24,
  priorität integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(mitarbeiter_id, modul, ereignis_typ, kanal)
);

-- Erweiterte RLS Policies
CREATE POLICY "Mitarbeiter können ihre eigenen Kontingente sehen" ON abwesenheit_kontingente
    FOR SELECT USING (mitarbeiter_id = auth.uid());

CREATE POLICY "Admin kann alle Kontingente verwalten" ON abwesenheit_kontingente
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Mitarbeiter können ihre Benachrichtigungseinstellungen verwalten" ON benachrichtigungs_einstellungen
    FOR ALL USING (mitarbeiter_id = auth.uid());

CREATE POLICY "Admin kann alle Benachrichtigungseinstellungen verwalten" ON benachrichtigungs_einstellungen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Alle können aktive Feiertage sehen" ON feiertage_kalender
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Admin kann Feiertage verwalten" ON feiertage_kalender
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Alle können Arbeitszeit-Vorlagen sehen" ON arbeitszeit_vorlagen
    FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Admin kann Arbeitszeit-Vorlagen verwalten" ON arbeitszeit_vorlagen
    FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Enable RLS für neue Tabellen
ALTER TABLE feiertage_kalender ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbeitszeit_vorlagen ENABLE ROW LEVEL SECURITY;
ALTER TABLE abwesenheit_kontingente ENABLE ROW LEVEL SECURITY;
ALTER TABLE benachrichtigungs_einstellungen ENABLE ROW LEVEL SECURITY;

-- Trigger für neue Tabellen
CREATE TRIGGER update_feiertage_kalender_updated_at
    BEFORE UPDATE ON feiertage_kalender
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arbeitszeit_vorlagen_updated_at
    BEFORE UPDATE ON arbeitszeit_vorlagen
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abwesenheit_kontingente_updated_at
    BEFORE UPDATE ON abwesenheit_kontingente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benachrichtigungs_einstellungen_updated_at
    BEFORE UPDATE ON benachrichtigungs_einstellungen
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deutsche Feiertage als Beispieldaten
INSERT INTO feiertage_kalender (name, datum, region, typ, wiederkehrend, beweglich) VALUES
('Neujahr', '2024-01-01', 'Deutschland', 'gesetzlich', true, false),
('Heilige Drei Könige', '2024-01-06', 'Bayern', 'regional', true, false),
('Karfreitag', '2024-03-29', 'Deutschland', 'gesetzlich', true, true),
('Ostermontag', '2024-04-01', 'Deutschland', 'gesetzlich', true, true),
('Tag der Arbeit', '2024-05-01', 'Deutschland', 'gesetzlich', true, false),
('Christi Himmelfahrt', '2024-05-09', 'Deutschland', 'gesetzlich', true, true),
('Pfingstmontag', '2024-05-20', 'Deutschland', 'gesetzlich', true, true),
('Fronleichnam', '2024-05-30', 'Bayern', 'regional', true, true),
('Mariä Himmelfahrt', '2024-08-15', 'Bayern', 'regional', true, false),
('Tag der Deutschen Einheit', '2024-10-03', 'Deutschland', 'gesetzlich', true, false),
('Allerheiligen', '2024-11-01', 'Bayern', 'regional', true, false),
('1. Weihnachtstag', '2024-12-25', 'Deutschland', 'gesetzlich', true, false),
('2. Weihnachtstag', '2024-12-26', 'Deutschland', 'gesetzlich', true, false)
ON CONFLICT (datum, region) DO NOTHING;

-- Arbeitszeit-Vorlagen
INSERT INTO arbeitszeit_vorlagen (name, beschreibung, branche, template_data, kategorien, compliance_level) VALUES
('Standard Vollzeit 40h', 'Standard Vollzeit mit 40 Wochenstunden', 'Allgemein', 
'{"wochenstunden": 40, "tagesstunden": 8, "kernzeit": {"start": "09:00", "end": "15:00"}, "gleitzeit": {"start": "07:00", "end": "19:00"}, "pausenregelung": {"ab_stunden": 6, "dauer": 30}}',
'["vollzeit", "gleitzeit"]', 'standard'),
('Teilzeit 30h', 'Teilzeit mit 30 Wochenstunden', 'Allgemein',
'{"wochenstunden": 30, "tagesstunden": 6, "kernzeit": {"start": "09:00", "end": "15:00"}, "gleitzeit": {"start": "08:00", "end": "16:00"}, "pausenregelung": {"ab_stunden": 6, "dauer": 30}}',
'["teilzeit", "gleitzeit"]', 'standard'),
('Schichtarbeit 3-Schicht', 'Dreischichtsystem mit Wechsel', 'Produktion',
'{"wochenstunden": 40, "schichten": [{"typ": "frueh", "start": "06:00", "end": "14:00"}, {"typ": "spaet", "start": "14:00", "end": "22:00"}, {"typ": "nacht", "start": "22:00", "end": "06:00"}]}',
'["schicht", "vollzeit"]', 'premium'),
('Vertrauensarbeitszeit', 'Flexible Arbeitszeit ohne Zeiterfassung', 'IT',
'{"wochenstunden": 40, "flexibel": true, "kernzeit": {"start": "10:00", "end": "16:00"}, "homeoffice": true, "zeiterfassung": false}',
'["vollzeit", "vertrauensarbeitszeit"]', 'premium')
ON CONFLICT DO NOTHING;