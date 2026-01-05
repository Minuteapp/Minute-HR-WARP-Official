-- Erstelle Storage Bucket für Company Logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-logos', 'company-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies für Company Logos
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update company logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can delete company logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Erstelle company_modules Tabelle
CREATE TABLE IF NOT EXISTS public.company_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'package',
  base_price DECIMAL(10,2) DEFAULT 0.00,
  billing_type TEXT DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'yearly', 'one_time', 'usage')),
  is_active BOOLEAN DEFAULT true,
  required_modules TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle company_module_assignments Tabelle
CREATE TABLE IF NOT EXISTS public.company_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL REFERENCES company_modules(module_key) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  custom_price DECIMAL(10,2),
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID,
  disabled_by UUID,
  billing_cycle TEXT DEFAULT 'monthly',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, module_key)
);

-- RLS aktivieren
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_module_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für company_modules
CREATE POLICY "Everyone can view active modules"
ON public.company_modules FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage modules"
ON public.company_modules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für company_module_assignments
CREATE POLICY "Admins can view all assignments"
ON public.company_module_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can manage assignments"
ON public.company_module_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Trigger für updated_at
CREATE TRIGGER update_company_modules_updated_at
  BEFORE UPDATE ON public.company_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_module_assignments_updated_at
  BEFORE UPDATE ON public.company_module_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Logo URL Spalte zu companies hinzufügen falls nicht vorhanden
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS description TEXT;

-- Beispiel-Module hinzufügen
INSERT INTO public.company_modules (module_key, name, description, category, icon, base_price, billing_type, features) VALUES
('hr-core', 'HR Verwaltung', 'Grundlegende HR-Funktionen wie Mitarbeiterverwaltung und Stammdaten', 'hr', 'users', 49.99, 'monthly', '["Mitarbeiterverwaltung", "Stammdaten", "Organigramm"]'),
('time-tracking', 'Zeiterfassung', 'Digitale Zeiterfassung mit Projekt- und Aufgabenzuordnung', 'time', 'clock', 29.99, 'monthly', '["Stempeluhr", "Projektzeiten", "Berichte"]'),
('absence-management', 'Abwesenheitsverwaltung', 'Urlaubsanträge, Krankmeldungen und Genehmigungsworkflows', 'absence', 'calendar', 39.99, 'monthly', '["Urlaubsanträge", "Genehmigungsworkflow", "Abwesenheitskalender"]'),
('payroll', 'Lohnabrechnung', 'Automatisierte Lohn- und Gehaltsabrechnung', 'finance', 'calculator', 79.99, 'monthly', '["Lohnabrechnung", "Steuerberechnung", "SEPA Export"]'),
('recruiting', 'Recruiting', 'Bewerbermanagement und Stellenausschreibungen', 'recruiting', 'user-check', 59.99, 'monthly', '["Bewerbermanagement", "Stellenportal", "Interview-Planung"]'),
('performance', 'Performance Management', 'Leistungsbeurteilungen und Zielvereinbarungen', 'performance', 'bar-chart', 49.99, 'monthly', '["360° Feedback", "Zielvereinbarungen", "Entwicklungspläne"]'),
('documents', 'Dokumentenmanagement', 'Zentrale Verwaltung von HR-Dokumenten', 'documents', 'file-text', 19.99, 'monthly', '["Dokumentenarchiv", "Versionierung", "Zugriffsrechte"]'),
('ai-assistant', 'KI-Assistent', 'KI-basierte Unterstützung für HR-Prozesse', 'ai', 'brain', 99.99, 'monthly', '["Chatbot", "Automatisierung", "Predictive Analytics"]')
ON CONFLICT (module_key) DO NOTHING;