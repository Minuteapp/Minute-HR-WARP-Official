
-- Erstelle Template-System für Ziele
CREATE TABLE IF NOT EXISTS public.goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('personal', 'team', 'company')),
  template_type TEXT NOT NULL CHECK (template_type IN ('smart', 'okr', 'development', 'performance', 'project')),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  metadata JSONB DEFAULT '{}',
  
  -- Template-spezifische Felder
  fields JSONB NOT NULL DEFAULT '[]', -- Array von Feldkonfigurationen
  default_values JSONB DEFAULT '{}', -- Standardwerte für Felder
  validation_rules JSONB DEFAULT '{}', -- Validierungsregeln
  
  -- Berechtigungen
  required_roles JSONB DEFAULT '["employee"]', -- Welche Rollen das Template verwenden können
  access_level TEXT DEFAULT 'all' CHECK (access_level IN ('all', 'admin', 'manager', 'hr')),
  
  -- OKR-spezifische Felder
  okr_structure JSONB DEFAULT NULL, -- Struktur für OKR-Templates
  
  -- Performance-spezifische Felder
  kpi_templates JSONB DEFAULT '[]', -- KPI-Vorlagen
  
  UNIQUE(name, created_by)
);

-- Template-Kategorien für bessere Organisation
CREATE TABLE IF NOT EXISTS public.goal_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template-Verwendungshistorie
CREATE TABLE IF NOT EXISTS public.goal_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.goal_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Füge Standard-Template-Kategorien hinzu
INSERT INTO public.goal_template_categories (name, display_name, description, icon, sort_order) VALUES
('personal', 'Persönliche Ziele', 'Vorlagen für individuelle Entwicklungsziele', 'User', 1),
('team', 'Teamziele', 'Vorlagen für Teamziele und Abteilungsziele', 'Users', 2),
('company', 'Unternehmensziele', 'Strategische Unternehmensziele und OKRs', 'Building', 3),
('development', 'Entwicklung', 'Vorlagen für Weiterbildung und Skill-Entwicklung', 'GraduationCap', 4),
('performance', 'Performance', 'Leistungs- und KPI-bezogene Zielvorlagen', 'TrendingUp', 5)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies für goal_templates
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;

-- Alle können öffentliche Templates anzeigen
CREATE POLICY "Öffentliche Templates sind für alle sichtbar" ON public.goal_templates
FOR SELECT TO authenticated 
USING (is_public = true OR created_by = auth.uid());

-- Benutzer können ihre eigenen Templates verwalten
CREATE POLICY "Benutzer können eigene Templates verwalten" ON public.goal_templates
FOR ALL TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Admins können alle Templates verwalten
CREATE POLICY "Admins können alle Templates verwalten" ON public.goal_templates
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS für goal_template_categories
ALTER TABLE public.goal_template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template-Kategorien sind für alle sichtbar" ON public.goal_template_categories
FOR SELECT TO authenticated USING (true);

-- RLS für goal_template_usage
ALTER TABLE public.goal_template_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können ihre Template-Verwendung einsehen" ON public.goal_template_usage
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Benutzer können Template-Verwendung protokollieren" ON public.goal_template_usage
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_goal_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_templates_updated_at
  BEFORE UPDATE ON public.goal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_templates_updated_at();

-- Trigger für usage_count
CREATE OR REPLACE FUNCTION increment_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.goal_templates 
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_count
  AFTER INSERT ON public.goal_template_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage_count();
