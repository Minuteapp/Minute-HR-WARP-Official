
-- Erstelle Tabelle für Dokumentvorlagen
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('file', 'form')),
  file_path TEXT,
  file_name TEXT,
  mime_type TEXT,
  form_schema JSONB,
  metadata_schema JSONB DEFAULT '{}',
  placeholders JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'all' CHECK (access_level IN ('all', 'admin', 'hr', 'manager')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES public.document_templates(id)
);

-- Erstelle Tabelle für Dokumentgenerierung aus Vorlagen
CREATE TABLE IF NOT EXISTS public.document_template_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES auth.users(id),
  form_data JSONB DEFAULT '{}',
  placeholder_values JSONB DEFAULT '{}',
  signature_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Erstelle Tabelle für Template-Kategorien Konfiguration
CREATE TABLE IF NOT EXISTS public.document_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Füge Standard-Kategorien hinzu
INSERT INTO public.document_template_categories (category_key, display_name, description, icon, sort_order) VALUES
('training', 'Schulung & Weiterbildung', 'Vorlagen für Schulungen und Weiterbildungsmaßnahmen', 'GraduationCap', 1),
('recruiting', 'Recruiting & Onboarding', 'Vorlagen für Bewerbungsprozesse und Einarbeitung', 'Users', 2),
('company', 'Unternehmensdokumente', 'Allgemeine Unternehmensvorlagen', 'Building', 3),
('employee', 'Mitarbeiterdokumente', 'Persönliche Mitarbeiterdokumente', 'User', 4),
('payroll', 'Lohn & Gehalt', 'Gehalts- und Lohnabrechnungsvorlagen', 'Calculator', 5),
('legal', 'Rechtliche Dokumente', 'Rechtliche Vorlagen und Verträge', 'Scale', 6)
ON CONFLICT (category_key) DO NOTHING;

-- RLS Policies für document_templates
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Vorlagen anzeigen" ON public.document_templates
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Administratoren können Vorlagen erstellen" ON public.document_templates
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Administratoren können Vorlagen bearbeiten" ON public.document_templates
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für document_template_instances
ALTER TABLE public.document_template_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können ihre eigenen Template-Instanzen anzeigen" ON public.document_template_instances
FOR SELECT TO authenticated 
USING (generated_by = auth.uid());

CREATE POLICY "Benutzer können Template-Instanzen erstellen" ON public.document_template_instances
FOR INSERT TO authenticated 
WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Benutzer können ihre eigenen Template-Instanzen bearbeiten" ON public.document_template_instances
FOR UPDATE TO authenticated 
USING (generated_by = auth.uid());

-- RLS Policies für document_template_categories
ALTER TABLE public.document_template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Template-Kategorien anzeigen" ON public.document_template_categories
FOR SELECT TO authenticated USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_document_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_document_templates_updated_at();
