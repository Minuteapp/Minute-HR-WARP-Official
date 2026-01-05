-- Einfache Migration ohne ON CONFLICT
-- Nur fehlende Tabellen erstellen

CREATE TABLE IF NOT EXISTS public.employee_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT false,
  template_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_document_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  days_before_expiry INTEGER NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Standard-Dokumenttypen ohne ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.employee_document_types WHERE name = 'Arbeitsvertrag') THEN
    INSERT INTO public.employee_document_types (name, description, category, is_required, requires_expiry) VALUES
    ('Arbeitsvertrag', 'Haupt-Arbeitsvertrag des Mitarbeiters', 'contract', true, false),
    ('Personalausweis', 'Kopie des Personalausweises', 'identification', true, true),
    ('Reisepass', 'Kopie des Reisepasses', 'identification', false, true),
    ('Führungszeugnis', 'Polizeiliches Führungszeugnis', 'certificate', false, true),
    ('Gesundheitszeugnis', 'Arbeitsmedizinische Untersuchung', 'certificate', false, true),
    ('Zeugnisse', 'Bildungsabschlüsse und Zertifikate', 'certificate', false, false),
    ('Fortbildungszertifikat', 'Berufliche Weiterbildungen', 'training', false, true),
    ('Führerschein', 'Kopie des Führerscheins', 'identification', false, true),
    ('Sozialversicherungsausweis', 'Kopie des Sozialversicherungsausweises', 'identification', false, false),
    ('Steuerliche Bescheinigungen', 'Lohnsteuerkarte, Freibeträge etc.', 'other', false, true);
  END IF;
END
$$;