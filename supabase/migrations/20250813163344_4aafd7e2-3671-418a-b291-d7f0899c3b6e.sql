-- ================================================
-- SPRINT 1: Core HR + Zeit/Abwesenheit + Payroll DE (Korrigiert)
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
DO $$ BEGIN
  CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'pending_info', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE case_category AS ENUM ('employee_relations', 'policy_violation', 'grievance', 'disciplinary', 'general_inquiry', 'benefits', 'payroll');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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
DO $$ BEGIN
  CREATE TYPE arbeitszeit_typ AS ENUM ('vollzeit', 'teilzeit', 'geringfuegig', 'praktikant', 'auszubildender', 'werkstudent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE schicht_typ AS ENUM ('frueh', 'spaet', 'nacht', 'bereitschaft', 'rufbereitschaft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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
  urlaub_verfall_datum DATE DEFAULT '2025-03-31'::date,
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
DO $$ BEGIN
  CREATE TYPE genehmigungsstatus AS ENUM ('eingereicht', 'erster_genehmiger', 'zweiter_genehmiger', 'hr_geprueft', 'genehmigt', 'abgelehnt', 'zurueckgezogen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Deutsche Abwesenheitsarten
CREATE TABLE IF NOT EXISTS public.de_abwesenheitsarten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  kategorie TEXT NOT NULL,
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
  uebertragung_bis_datum DATE DEFAULT '2025-03-31'::date,
  auszahlung_erlaubt BOOLEAN DEFAULT false,
  elster_code TEXT,
  deue_code TEXT,
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

-- Trigger für automatische Nummernvergabe Abwesenheitsanträge
CREATE SEQUENCE IF NOT EXISTS abwesenheitsantrag_number_seq START 2000;

CREATE OR REPLACE FUNCTION generate_abwesenheitsantrag_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.antrag_nummer IS NULL THEN
    NEW.antrag_nummer := 'AB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('abwesenheitsantrag_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_abwesenheitsantrag_number_trigger
  BEFORE INSERT ON public.de_abwesenheitsantraege
  FOR EACH ROW EXECUTE FUNCTION generate_abwesenheitsantrag_number();

-- RLS aktivieren
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbeitszeit_regelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_abwesenheitsarten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_abwesenheitsantraege ENABLE ROW LEVEL SECURITY;