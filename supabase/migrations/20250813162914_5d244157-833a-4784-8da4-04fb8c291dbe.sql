-- ================================================
-- SPRINT 1: Core HR + Zeit/Abwesenheit + Payroll DE
-- ================================================

-- 1. CORE HR: Organisationsstruktur erweitert
-- ================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  parent_id UUID REFERENCES public.departments(id),
  manager_id UUID,
  cost_center TEXT,
  budget_allocated NUMERIC DEFAULT 0,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  reports_to_position_id UUID REFERENCES public.positions(id),
  job_level INTEGER DEFAULT 1,
  salary_band_min NUMERIC,
  salary_band_max NUMERIC,
  requires_approval BOOLEAN DEFAULT false,
  skills_required JSONB DEFAULT '[]',
  responsibilities TEXT,
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HR CASE MANAGEMENT
-- ================================================
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'pending_info', 'resolved', 'closed');
CREATE TYPE case_category AS ENUM ('employee_relations', 'policy_violation', 'grievance', 'disciplinary', 'general_inquiry', 'benefits', 'payroll');

CREATE TABLE IF NOT EXISTS public.hr_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category case_category NOT NULL,
  priority case_priority DEFAULT 'medium',
  status case_status DEFAULT 'open',
  employee_id UUID,
  reporter_id UUID,
  assigned_to UUID,
  due_date DATE,
  resolution TEXT,
  attachments JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  is_confidential BOOLEAN DEFAULT false,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- 3. DEUTSCHE ARBEITSZEITREGELN & COMPLIANCE
-- ================================================
CREATE TYPE arbeitszeit_typ AS ENUM ('vollzeit', 'teilzeit', 'geringfuegig', 'praktikant', 'auszubildender', 'werkstudent');
CREATE TYPE schicht_typ AS ENUM ('frueh', 'spaet', 'nacht', 'bereitschaft', 'rufbereitschaft');

CREATE TABLE IF NOT EXISTS public.arbeitszeit_regelungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  typ arbeitszeit_typ NOT NULL,
  wochenstunden NUMERIC NOT NULL DEFAULT 40,
  taeglich_max_stunden NUMERIC DEFAULT 8,
  taeglich_min_stunden NUMERIC DEFAULT 4,
  kernzeit_start TIME,
  kernzeit_ende TIME,
  pause_mindestens_minuten INTEGER DEFAULT 30,
  pause_ab_stunden NUMERIC DEFAULT 6,
  ruhezeit_stunden INTEGER DEFAULT 11,
  nachtarbeit_start TIME DEFAULT '22:00',
  nachtarbeit_ende TIME DEFAULT '06:00',
  nachtarbeit_zuschlag_prozent NUMERIC DEFAULT 25,
  sonntagsarbeit_erlaubt BOOLEAN DEFAULT false,
  sonntagsarbeit_zuschlag_prozent NUMERIC DEFAULT 50,
  feiertagsarbeit_zuschlag_prozent NUMERIC DEFAULT 100,
  ueberstunden_ab_stunden NUMERIC DEFAULT 8,
  ueberstunden_zuschlag_prozent NUMERIC DEFAULT 25,
  mehrarbeit_genehmigung_ab_stunden NUMERIC DEFAULT 10,
  jahresurlaub_tage INTEGER DEFAULT 30,
  urlaub_verfall_datum DATE DEFAULT '03-31',
  krankheit_lohnfortzahlung_tage INTEGER DEFAULT 42,
  krankheit_attest_ab_tag INTEGER DEFAULT 3,
  compliance_regeln JSONB DEFAULT '{}',
  betriebsvereinbarung_referenz TEXT,
  tarifvertrag_referenz TEXT,
  gueltig_ab DATE DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  ist_aktiv BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ABWESENHEITSMANAGEMENT ERWEITERT
-- ================================================
CREATE TYPE genehmigungsstatus AS ENUM ('eingereicht', 'erster_genehmiger', 'zweiter_genehmiger', 'hr_geprueft', 'genehmigt', 'abgelehnt', 'zurueckgezogen');

-- Deutsche Abwesenheitsarten
CREATE TABLE IF NOT EXISTS public.de_abwesenheitsarten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- URL, KRA, BIL, etc.
  kategorie TEXT NOT NULL, -- urlaub, krankheit, fortbildung, sonderurlaub
  ist_urlaubstag BOOLEAN DEFAULT false,
  ist_arbeitstag BOOLEAN DEFAULT true,
  lohnfortzahlung BOOLEAN DEFAULT true,
  lohnfortzahlung_prozent NUMERIC DEFAULT 100,
  sozialversicherung BOOLEAN DEFAULT true,
  steuerlich_relevant BOOLEAN DEFAULT true,
  nachweis_erforderlich BOOLEAN DEFAULT false,
  nachweis_ab_tag INTEGER,
  genehmigung_erforderlich BOOLEAN DEFAULT true,
  vorlaufzeit_tage INTEGER DEFAULT 14,
  max_tage_pro_jahr INTEGER,
  max_aufeinander_tage INTEGER,
  uebertragbar BOOLEAN DEFAULT false,
  uebertragung_bis_datum DATE,
  auszahlung_erlaubt BOOLEAN DEFAULT false,
  elster_code TEXT, -- für Lohnsteuer
  deue_code TEXT, -- für Sozialversicherung
  farbe TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'calendar',
  meldung_behoerden JSONB DEFAULT '[]',
  parameter JSONB DEFAULT '{}',
  ist_aktiv BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abwesenheitsanträge mit deutschem Workflow
CREATE TABLE IF NOT EXISTS public.de_abwesenheitsantraege (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  antrag_nummer TEXT UNIQUE,
  mitarbeiter_id UUID NOT NULL,
  abwesenheitsart_id UUID REFERENCES public.de_abwesenheitsarten(id),
  start_datum DATE NOT NULL,
  ende_datum DATE NOT NULL,
  start_zeit TIME,
  ende_zeit TIME,
  halber_tag BOOLEAN DEFAULT false,
  tage_gesamt NUMERIC,
  grund TEXT,
  vertretung_id UUID,
  status genehmigungsstatus DEFAULT 'eingereicht',
  erster_genehmiger_id UUID,
  erster_genehmiger_datum TIMESTAMPTZ,
  erster_genehmiger_kommentar TEXT,
  zweiter_genehmiger_id UUID,
  zweiter_genehmiger_datum TIMESTAMPTZ,
  zweiter_genehmiger_kommentar TEXT,
  hr_geprueft_von UUID,
  hr_geprueft_datum TIMESTAMPTZ,
  hr_kommentar TEXT,
  ablehnungsgrund TEXT,
  nachweis_dokument_pfad TEXT,
  nachweis_hochgeladen BOOLEAN DEFAULT false,
  payroll_verarbeitet BOOLEAN DEFAULT false,
  payroll_periode TEXT,
  stornierung_grund TEXT,
  storniert_von UUID,
  storniert_am TIMESTAMPTZ,
  workflow_daten JSONB DEFAULT '{}',
  eskaliert_am TIMESTAMPTZ,
  erinnerung_gesendet TIMESTAMPTZ,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DEUTSCHE LOHNABRECHNUNG BASIS
-- ================================================
CREATE TYPE steuerklasse AS ENUM ('I', 'II', 'III', 'IV', 'V', 'VI');
CREATE TYPE kirchensteuer_konfession AS ENUM ('ev', 'rk', 'keine', 'andere');
CREATE TYPE payroll_status AS ENUM ('entwurf', 'freigegeben', 'uebertragen', 'archiviert');

-- Lohnsteuerdaten
CREATE TABLE IF NOT EXISTS public.de_lohnsteuer_stammdaten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id UUID NOT NULL,
  steuerklasse steuerklasse NOT NULL DEFAULT 'I',
  anzahl_kinderfreibetraege NUMERIC DEFAULT 0,
  kirchensteuer_konfession kirchensteuer_konfession DEFAULT 'keine',
  kirchensteuerpflichtig BOOLEAN DEFAULT false,
  solidaritaetszuschlag BOOLEAN DEFAULT true,
  freibetrag_monatlich NUMERIC DEFAULT 0,
  hinzurechnungsbetrag_monatlich NUMERIC DEFAULT 0,
  steuer_id TEXT, -- Steuerliche Identifikationsnummer
  elster_merkmal JSONB DEFAULT '{}',
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  ist_aktiv BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sozialversicherungsdaten
CREATE TABLE IF NOT EXISTS public.de_sozialversicherung_stammdaten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id UUID NOT NULL,
  sv_nummer TEXT, -- Sozialversicherungsnummer
  krankenkasse_name TEXT,
  krankenkasse_nummer TEXT,
  zusatzbeitrag_prozent NUMERIC DEFAULT 0,
  rentenversicherung_nummer TEXT,
  arbeitslosenversicherung_befreit BOOLEAN DEFAULT false,
  rentenversicherung_befreit BOOLEAN DEFAULT false,
  krankengeld_verzicht BOOLEAN DEFAULT false,
  beitragssatz_abweichung JSONB DEFAULT '{}',
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  ist_aktiv BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lohnabrechnungen
CREATE TABLE IF NOT EXISTS public.de_lohnabrechnungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abrechnungs_nummer TEXT UNIQUE,
  mitarbeiter_id UUID NOT NULL,
  abrechnungsmonat INTEGER NOT NULL,
  abrechnungsjahr INTEGER NOT NULL,
  status payroll_status DEFAULT 'entwurf',
  brutto_gehalt NUMERIC NOT NULL DEFAULT 0,
  netto_gehalt NUMERIC NOT NULL DEFAULT 0,
  arbeitsstunden NUMERIC DEFAULT 0,
  ueberstunden NUMERIC DEFAULT 0,
  urlaubstage NUMERIC DEFAULT 0,
  krankheitstage NUMERIC DEFAULT 0,
  steuer_brutto NUMERIC DEFAULT 0,
  sv_brutto NUMERIC DEFAULT 0,
  lohnsteuer NUMERIC DEFAULT 0,
  solidaritaetszuschlag NUMERIC DEFAULT 0,
  kirchensteuer NUMERIC DEFAULT 0,
  ag_rentenversicherung NUMERIC DEFAULT 0,
  ag_krankenversicherung NUMERIC DEFAULT 0,
  ag_arbeitslosenversicherung NUMERIC DEFAULT 0,
  ag_pflegeversicherung NUMERIC DEFAULT 0,
  ag_unfallversicherung NUMERIC DEFAULT 0,
  ag_umlage_u1 NUMERIC DEFAULT 0,
  ag_umlage_u2 NUMERIC DEFAULT 0,
  ag_insolvenzgeld NUMERIC DEFAULT 0,
  an_rentenversicherung NUMERIC DEFAULT 0,
  an_krankenversicherung NUMERIC DEFAULT 0,
  an_arbeitslosenversicherung NUMERIC DEFAULT 0,
  an_pflegeversicherung NUMERIC DEFAULT 0,
  sonstige_bezuege JSONB DEFAULT '[]',
  sonstige_abzuege JSONB DEFAULT '[]',
  verwendungsnachweis JSONB DEFAULT '{}',
  datev_export_datum TIMESTAMPTZ,
  elster_export_datum TIMESTAMPTZ,
  auszahlung_datum DATE,
  sperrgrund TEXT,
  korrektur_von UUID REFERENCES public.de_lohnabrechnungen(id),
  ist_korrektur BOOLEAN DEFAULT false,
  bemerkungen TEXT,
  dokument_pfad TEXT,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ZEITERFASSUNG RECHTSSICHER
-- ================================================
CREATE TYPE zeitbuchung_typ AS ENUM ('kommen', 'gehen', 'pause_start', 'pause_ende', 'dienstgang', 'home_office');
CREATE TYPE zeitbuchung_quelle AS ENUM ('terminal', 'app', 'web', 'manuell', 'import');

CREATE TABLE IF NOT EXISTS public.de_zeitbuchungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id UUID NOT NULL,
  buchungsdatum DATE NOT NULL,
  buchungszeit TIMESTAMPTZ NOT NULL,
  typ zeitbuchung_typ NOT NULL,
  quelle zeitbuchung_quelle DEFAULT 'web',
  standort TEXT,
  gps_koordinaten POINT,
  geraet_info JSONB,
  ip_adresse INET,
  korrektur_von UUID REFERENCES public.de_zeitbuchungen(id),
  korrektur_grund TEXT,
  korrigiert_von UUID,
  korrigiert_am TIMESTAMPTZ,
  ist_korrektur BOOLEAN DEFAULT false,
  genehmigt_von UUID,
  genehmigt_am TIMESTAMPTZ,
  bemerkung TEXT,
  arbeitsplatz TEXT,
  projekt_id UUID,
  taetigkeit TEXT,
  export_datum TIMESTAMPTZ,
  gesperrt BOOLEAN DEFAULT false,
  hash_wert TEXT, -- für Unveränderlichkeit
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Arbeitszeiten tageweise
CREATE TABLE IF NOT EXISTS public.de_arbeitstage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitarbeiter_id UUID NOT NULL,
  datum DATE NOT NULL,
  arbeitsbeginn TIMESTAMPTZ,
  arbeitsende TIMESTAMPTZ,
  pausen_minuten INTEGER DEFAULT 0,
  arbeitszeit_minuten INTEGER DEFAULT 0,
  sollarbeitszeit_minuten INTEGER DEFAULT 480, -- 8 Stunden
  ueberstunden_minuten INTEGER DEFAULT 0,
  nachtarbeit_minuten INTEGER DEFAULT 0,
  sonntagsarbeit_minuten INTEGER DEFAULT 0,
  feiertagsarbeit_minuten INTEGER DEFAULT 0,
  homeoffice_minuten INTEGER DEFAULT 0,
  ist_feiertag BOOLEAN DEFAULT false,
  feiertag_name TEXT,
  ist_wochenende BOOLEAN DEFAULT false,
  abwesenheit_id UUID REFERENCES public.de_abwesenheitsantraege(id),
  bemerkungen TEXT,
  automatisch_berechnet BOOLEAN DEFAULT true,
  manuell_korrigiert BOOLEAN DEFAULT false,
  korrigiert_von UUID,
  korrigiert_am TIMESTAMPTZ,
  freigegeben_von UUID,
  freigegeben_am TIMESTAMPTZ,
  gesperrt BOOLEAN DEFAULT false,
  payroll_periode TEXT,
  payroll_verarbeitet BOOLEAN DEFAULT false,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mitarbeiter_id, datum)
);

-- RLS aktivieren
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbeitszeit_regelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_abwesenheitsarten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_abwesenheitsantraege ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_lohnsteuer_stammdaten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_sozialversicherung_stammdaten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_lohnabrechnungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_zeitbuchungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_arbeitstage ENABLE ROW LEVEL SECURITY;

-- Company Isolation Policies
CREATE POLICY "Company Isolation - departments" ON public.departments
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - positions" ON public.positions
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - hr_cases" ON public.hr_cases
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Employee access policies for German tables
CREATE POLICY "Employee Access - abwesenheitsantraege" ON public.de_abwesenheitsantraege
FOR ALL USING (
  mitarbeiter_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

CREATE POLICY "Employee Access - zeitbuchungen" ON public.de_zeitbuchungen
FOR ALL USING (
  mitarbeiter_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

CREATE POLICY "Employee Access - arbeitstage" ON public.de_arbeitstage
FOR ALL USING (
  mitarbeiter_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

-- HR/Admin only policies
CREATE POLICY "HR Admin Access - lohnabrechnungen" ON public.de_lohnabrechnungen
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

CREATE POLICY "HR Admin Access - lohnsteuer_stammdaten" ON public.de_lohnsteuer_stammdaten
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

CREATE POLICY "HR Admin Access - sozialversicherung_stammdaten" ON public.de_sozialversicherung_stammdaten
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
);

-- Auto-assign company_id triggers
CREATE TRIGGER auto_assign_company_departments
  BEFORE INSERT ON public.departments
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_positions
  BEFORE INSERT ON public.positions
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_hr_cases
  BEFORE INSERT ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

-- Sequences für Nummernkreise
CREATE SEQUENCE IF NOT EXISTS hr_case_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS abwesenheitsantrag_number_seq START 2000;
CREATE SEQUENCE IF NOT EXISTS lohnabrechnung_number_seq START 3000;

-- Funktionen für automatische Nummernvergabe
CREATE OR REPLACE FUNCTION generate_hr_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'HR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('hr_case_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_abwesenheitsantrag_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.antrag_nummer IS NULL THEN
    NEW.antrag_nummer := 'AB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('abwesenheitsantrag_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_lohnabrechnung_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.abrechnungs_nummer IS NULL THEN
    NEW.abrechnungs_nummer := 'LO-' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEW.abrechnungsmonat::text, 2, '0') || '-' || LPAD(nextval('lohnabrechnung_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Nummernvergabe
CREATE TRIGGER generate_hr_case_number_trigger
  BEFORE INSERT ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION generate_hr_case_number();

CREATE TRIGGER generate_abwesenheitsantrag_number_trigger
  BEFORE INSERT ON public.de_abwesenheitsantraege
  FOR EACH ROW EXECUTE FUNCTION generate_abwesenheitsantrag_number();

CREATE TRIGGER generate_lohnabrechnung_number_trigger
  BEFORE INSERT ON public.de_lohnabrechnungen
  FOR EACH ROW EXECUTE FUNCTION generate_lohnabrechnung_number();

-- Updated_at Triggers
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_hr_cases_updated_at
  BEFORE UPDATE ON public.hr_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Standard deutsche Abwesenheitsarten einfügen
INSERT INTO public.de_abwesenheitsarten (name, code, kategorie, ist_urlaubstag, nachweis_erforderlich, nachweis_ab_tag, vorlaufzeit_tage, max_tage_pro_jahr, farbe, icon) VALUES
('Erholungsurlaub', 'URL', 'urlaub', true, false, null, 14, 30, '#22C55E', 'Palmtree'),
('Krankheit', 'KRA', 'krankheit', false, true, 3, 0, null, '#EF4444', 'Heart'),
('Bildungsurlaub', 'BIL', 'fortbildung', true, true, 1, 30, 5, '#3B82F6', 'GraduationCap'),
('Sonderurlaub bezahlt', 'SOB', 'sonderurlaub', true, true, 1, 7, 5, '#8B5CF6', 'Star'),
('Sonderurlaub unbezahlt', 'SOU', 'sonderurlaub', false, true, 1, 14, 10, '#6B7280', 'Clock'),
('Mutterschutz', 'MUT', 'schutzzeit', false, true, 1, 30, null, '#EC4899', 'Baby'),
('Elternzeit', 'ELT', 'schutzzeit', false, true, 1, 60, null, '#F59E0B', 'Users'),
('Gleitzeit Abbau', 'GLA', 'gleitzeit', true, false, null, 1, null, '#10B981', 'Clock')
ON CONFLICT DO NOTHING;

-- Standard Arbeitszeitregelung für Deutschland
INSERT INTO public.arbeitszeit_regelungen (name, typ, wochenstunden, taeglich_max_stunden, kernzeit_start, kernzeit_ende, compliance_regeln) VALUES
('Standard Vollzeit (DE)', 'vollzeit', 40, 8, '09:00', '15:00', '{"arbeitszeitgesetz": true, "pausenregelung": "6h_30min", "ruhezeit": "11h"}'),
('Teilzeit 30h (DE)', 'teilzeit', 30, 6, '09:00', '14:00', '{"arbeitszeitgesetz": true, "pausenregelung": "6h_30min", "ruhezeit": "11h"}'),
('Geringfügig 450€ (DE)', 'geringfuegig', 10, 8, null, null, '{"minijob": true, "keine_sozialversicherung": true}')
ON CONFLICT DO NOTHING;