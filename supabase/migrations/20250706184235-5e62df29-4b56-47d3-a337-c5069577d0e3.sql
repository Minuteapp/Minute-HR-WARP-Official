-- Tabellen für Arbeitszeit & Abwesenheits-Management erstellen

-- Haupttabelle für Arbeitszeitmodelle
CREATE TABLE public.arbeitszeit_modelle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('gleitzeit', 'festzeit', 'vertrauenszeit', 'schicht', 'teilzeit')),
  wochenstunden NUMERIC NOT NULL DEFAULT 40,
  kernzeit_start TIME,
  kernzeit_ende TIME,
  taeglich_min_stunden NUMERIC,
  taeglich_max_stunden NUMERIC,
  flexibilitats_puffer NUMERIC DEFAULT 0,
  ueberstunden_schwelle NUMERIC DEFAULT 8,
  beschreibung TEXT,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Abwesenheitsarten
CREATE TABLE public.abwesenheitsarten (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kategorie TEXT NOT NULL CHECK (kategorie IN ('urlaub', 'krankheit', 'sonderurlaub', 'elternzeit', 'bildungsurlaub', 'unbezahlt')),
  farbe TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  erfordert_genehmigung BOOLEAN DEFAULT true,
  erfordert_nachweis BOOLEAN DEFAULT false,
  nachweis_ab_tag INTEGER DEFAULT 3,
  max_tage_pro_jahr INTEGER,
  max_aufeinanderfolgende_tage INTEGER,
  vorlaufzeit_tage INTEGER DEFAULT 14,
  wird_von_urlaub_abgezogen BOOLEAN DEFAULT false,
  sichtbarkeit TEXT DEFAULT 'team' CHECK (sichtbarkeit IN ('oeffentlich', 'team', 'vorgesetzte', 'hr')),
  benachrichtigungen_aktiv BOOLEAN DEFAULT true,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Genehmigungsworkflows
CREATE TABLE public.genehmigungsworkflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('urlaub', 'ueberstunden', 'abwesenheit')),
  beschreibung TEXT,
  workflow_schritte JSONB NOT NULL DEFAULT '[]'::jsonb,
  eskalationsregeln JSONB DEFAULT '{}'::jsonb,
  auto_genehmigung_nach_tagen INTEGER,
  auto_genehmigung_grenze NUMERIC,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Pausenregelungen
CREATE TABLE public.pausenregelungen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_arbeitszeit_stunden NUMERIC NOT NULL,
  erforderliche_pause_minuten INTEGER NOT NULL,
  automatisch_durchgesetzt BOOLEAN DEFAULT true,
  toleranz_minuten INTEGER DEFAULT 0,
  beschreibung TEXT,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Überstundenregelungen
CREATE TABLE public.ueberstundenregelungen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  max_taeglich_stunden NUMERIC DEFAULT 10,
  max_woechentlich_stunden NUMERIC DEFAULT 48,
  max_monatlich_stunden NUMERIC DEFAULT 40,
  ausgleichsart TEXT DEFAULT 'freizeitausgleich' CHECK (ausgleichsart IN ('freizeitausgleich', 'auszahlung', 'gemischt')),
  zuschlag_prozent NUMERIC DEFAULT 50,
  auto_genehmigung_grenze NUMERIC DEFAULT 10,
  beschreibung TEXT,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Feiertagsregelungen
CREATE TABLE public.feiertagsregelungen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'DE',
  bundesland TEXT,
  regionale_feiertage_einbeziehen BOOLEAN DEFAULT true,
  automatische_aktualisierung BOOLEAN DEFAULT true,
  arbeit_an_feiertag_zuschlag NUMERIC DEFAULT 100,
  beschreibung TEXT,
  parameter JSONB DEFAULT '{}'::jsonb,
  gueltig_ab DATE NOT NULL DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  prioritaet INTEGER DEFAULT 1,
  ist_aktiv BOOLEAN DEFAULT true,
  erstellt_von UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Organisationseinheiten-Zuweisungen
CREATE TABLE public.organisationseinheit_zuweisungen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  richtlinien_id UUID NOT NULL,
  richtlinien_typ TEXT NOT NULL CHECK (richtlinien_typ IN ('arbeitszeit_modell', 'abwesenheitsart', 'genehmigungsworkflow', 'pausenregelung', 'ueberstundenregelung', 'feiertagsregelung')),
  einheit_id UUID NOT NULL,
  einheit_typ TEXT NOT NULL CHECK (einheit_typ IN ('unternehmen', 'standort', 'abteilung', 'team', 'mitarbeiter')),
  einheit_name TEXT NOT NULL,
  zugewiesen_von UUID,
  zugewiesen_am TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aktiv BOOLEAN DEFAULT true
);

-- Indizes für bessere Performance
CREATE INDEX idx_arbeitszeit_modelle_aktiv ON public.arbeitszeit_modelle(ist_aktiv) WHERE ist_aktiv = true;
CREATE INDEX idx_abwesenheitsarten_aktiv ON public.abwesenheitsarten(ist_aktiv) WHERE ist_aktiv = true;
CREATE INDEX idx_genehmigungsworkflows_aktiv ON public.genehmigungsworkflows(ist_aktiv) WHERE ist_aktiv = true;
CREATE INDEX idx_organisationseinheit_zuweisungen_aktiv ON public.organisationseinheit_zuweisungen(aktiv) WHERE aktiv = true;
CREATE INDEX idx_organisationseinheit_zuweisungen_richtlinie ON public.organisationseinheit_zuweisungen(richtlinien_id, richtlinien_typ);
CREATE INDEX idx_organisationseinheit_zuweisungen_einheit ON public.organisationseinheit_zuweisungen(einheit_id, einheit_typ);

-- Trigger für automatische Aktualisierung der updated_at Spalten
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aktualisiert_am = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_arbeitszeit_modelle_updated_at BEFORE UPDATE ON public.arbeitszeit_modelle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abwesenheitsarten_updated_at BEFORE UPDATE ON public.abwesenheitsarten FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_genehmigungsworkflows_updated_at BEFORE UPDATE ON public.genehmigungsworkflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pausenregelungen_updated_at BEFORE UPDATE ON public.pausenregelungen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ueberstundenregelungen_updated_at BEFORE UPDATE ON public.ueberstundenregelungen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feiertagsregelungen_updated_at BEFORE UPDATE ON public.feiertagsregelungen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies aktivieren
ALTER TABLE public.arbeitszeit_modelle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abwesenheitsarten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genehmigungsworkflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pausenregelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ueberstundenregelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiertagsregelungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisationseinheit_zuweisungen ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Admins und HR
CREATE POLICY "Admins können alle Arbeitszeitmodelle verwalten" ON public.arbeitszeit_modelle
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Abwesenheitsarten verwalten" ON public.abwesenheitsarten
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Genehmigungsworkflows verwalten" ON public.genehmigungsworkflows
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Pausenregelungen verwalten" ON public.pausenregelungen
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Überstundenregelungen verwalten" ON public.ueberstundenregelungen
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Feiertagsregelungen verwalten" ON public.feiertagsregelungen
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins können alle Zuweisungen verwalten" ON public.organisationseinheit_zuweisungen
  FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für normale Benutzer (nur lesen)
CREATE POLICY "Benutzer können Arbeitszeitmodelle lesen" ON public.arbeitszeit_modelle
  FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können Abwesenheitsarten lesen" ON public.abwesenheitsarten
  FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können Genehmigungsworkflows lesen" ON public.genehmigungsworkflows
  FOR SELECT USING (ist_aktiv = true);

CREATE POLICY "Benutzer können Zuweisungen lesen" ON public.organisationseinheit_zuweisungen
  FOR SELECT USING (aktiv = true);