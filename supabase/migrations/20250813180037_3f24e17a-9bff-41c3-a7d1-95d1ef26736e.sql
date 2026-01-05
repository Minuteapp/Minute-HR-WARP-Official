-- Nur fehlende Tabellen erstellen (da employee_documents und document_access_permissions bereits existieren)

-- Dokumenttypen für Mitarbeiter (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.employee_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'contract', 'certificate', 'identification', 'training', 'other'
  is_required BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT false,
  template_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dokumenten-Reminder für ablaufende Dokumente (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.document_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_document_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'expiry_warning', 'renewal_required', 'custom'
  days_before_expiry INTEGER NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Standard-Dokumenttypen einfügen (mit ON CONFLICT für Sicherheit)
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
('Steuerliche Bescheinigungen', 'Lohnsteuerkarte, Freibeträge etc.', 'other', false, true)
ON CONFLICT (name) DO NOTHING;