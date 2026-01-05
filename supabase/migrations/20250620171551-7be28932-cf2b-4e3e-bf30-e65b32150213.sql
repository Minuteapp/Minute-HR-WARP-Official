
-- Korrigierte Phase 1: Datenbank-Erweiterungen für das Projekt-Modul (Fehlerbereinigung)

-- 1. Projekt-Templates Tabelle
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Projekt-Ansichten konfigurieren
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Layout',
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  filter_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Projekt-Genehmigungen
CREATE TABLE IF NOT EXISTS public.project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  approval_type TEXT NOT NULL, -- 'budget', 'timeline', 'resources', 'completion'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Erweiterte Projekt-Metadaten
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.project_templates(id),
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS risk_assessment JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resource_allocation JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stakeholders JSONB DEFAULT '[]';

-- 5. Projekt-Aktivitäten Log
CREATE TABLE IF NOT EXISTS public.project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'comment_added', etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Standard Projekt-Ansichten einfügen
INSERT INTO public.project_views (name, description, icon, slug, sort_order, filter_config) VALUES
('Alle Projekte', 'Zeigt alle Projekte an', 'Layout', 'all', 1, '{"status": "all"}'),
('Aktive Projekte', 'Zeigt nur aktive Projekte an', 'Play', 'active', 2, '{"status": "active"}'),
('Archivierte Projekte', 'Zeigt archivierte Projekte an', 'Archive', 'archived', 3, '{"status": "archived"}'),
('Projekt-Dashboard', 'Dashboard-Ansicht mit Statistiken', 'Grid', 'dashboard', 4, '{"view_type": "dashboard"}')
ON CONFLICT (slug) DO NOTHING;

-- 7. RLS Policies für neue Tabellen
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Policies für project_templates
CREATE POLICY "Benutzer können Templates anzeigen" ON public.project_templates
  FOR SELECT USING (true);

CREATE POLICY "Benutzer können Templates erstellen" ON public.project_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Ersteller können Templates bearbeiten" ON public.project_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies für project_views
CREATE POLICY "Alle können Projekt-Ansichten anzeigen" ON public.project_views
  FOR SELECT USING (true);

-- Policies für project_approvals
CREATE POLICY "Benutzer können ihre Genehmigungen anzeigen" ON public.project_approvals
  FOR SELECT USING (
    approver_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Benutzer können Genehmigungen erstellen" ON public.project_approvals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Genehmiger können Genehmigungen aktualisieren" ON public.project_approvals
  FOR UPDATE USING (approver_id = auth.uid());

-- Policies für project_activities
CREATE POLICY "Benutzer können Projekt-Aktivitäten anzeigen" ON public.project_activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Benutzer können Aktivitäten erstellen" ON public.project_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Trigger nur erstellen wenn noch nicht vorhanden
DO $$
BEGIN
  -- Prüfen ob Trigger bereits existiert
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_project_templates_updated_at' 
    AND event_object_table = 'project_templates'
  ) THEN
    -- Funktion erstellen falls nicht vorhanden
    CREATE OR REPLACE FUNCTION update_project_templates_updated_at()
    RETURNS TRIGGER AS $trigger$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
    
    -- Trigger erstellen
    CREATE TRIGGER update_project_templates_updated_at
      BEFORE UPDATE ON public.project_templates
      FOR EACH ROW EXECUTE FUNCTION update_project_templates_updated_at();
  END IF;
END $$;

-- Trigger für project_approvals falls noch nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_project_approvals_updated_at' 
    AND event_object_table = 'project_approvals'
  ) THEN
    CREATE TRIGGER update_project_approvals_updated_at
      BEFORE UPDATE ON public.project_approvals
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 9. Funktion für Template-Nutzung
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.project_templates 
  SET usage_count = usage_count + 1, last_used_at = now()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Funktion für Projekt-Aktivitäten
CREATE OR REPLACE FUNCTION log_project_activity(
  p_project_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.project_activities (project_id, user_id, activity_type, description, metadata)
  VALUES (p_project_id, auth.uid(), p_activity_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
