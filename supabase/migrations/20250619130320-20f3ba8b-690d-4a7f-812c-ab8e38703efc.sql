
-- Erweitere die projects Tabelle um fehlende Spalten
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Erstelle project_categories Tabelle
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle project_templates Tabelle
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES project_categories(id),
  template_data JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle project_assignments Tabelle (für Rollen-basierte Zuweisungen)
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID,
  permissions JSONB DEFAULT '{}',
  UNIQUE(project_id, user_id)
);

-- Erstelle project_tasks Tabelle
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Erstelle project_milestones Tabelle
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle project_budget_entries Tabelle
CREATE TABLE IF NOT EXISTS project_budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  entry_type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle project_documents Tabelle
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version INTEGER DEFAULT 1,
  description TEXT,
  is_public BOOLEAN DEFAULT false
);

-- Erstelle project_views Tabelle für anpassbare Ansichten (ohne created_by für einfache RLS)
CREATE TABLE IF NOT EXISTS project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Layout',
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  filter_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erstelle project_module_links Tabelle für Verknüpfungen zwischen Modulen
CREATE TABLE IF NOT EXISTS project_module_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aktiviere RLS für alle Tabellen
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_module_links ENABLE ROW LEVEL SECURITY;

-- Erstelle RLS Policies für project_categories
CREATE POLICY "Allow all to view project categories" ON project_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create categories" ON project_categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update categories" ON project_categories FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_templates
CREATE POLICY "Allow all to view project templates" ON project_templates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create templates" ON project_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow creators to update templates" ON project_templates FOR UPDATE USING (created_by = auth.uid());

-- Erstelle RLS Policies für project_assignments
CREATE POLICY "Allow users to view project assignments" ON project_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to create assignments" ON project_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update assignments" ON project_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_tasks
CREATE POLICY "Allow users to view project tasks" ON project_tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to create tasks" ON project_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update tasks" ON project_tasks FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_milestones
CREATE POLICY "Allow users to view project milestones" ON project_milestones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to create milestones" ON project_milestones FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update milestones" ON project_milestones FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_budget_entries
CREATE POLICY "Allow users to view budget entries" ON project_budget_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to create budget entries" ON project_budget_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update budget entries" ON project_budget_entries FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_documents
CREATE POLICY "Allow users to view project documents" ON project_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to upload documents" ON project_documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow uploaders to update documents" ON project_documents FOR UPDATE USING (uploaded_by = auth.uid());

-- Erstelle RLS Policies für project_views (vereinfacht ohne created_by)
CREATE POLICY "Allow all to view project views" ON project_views FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create views" ON project_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update views" ON project_views FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erstelle RLS Policies für project_module_links
CREATE POLICY "Allow users to view module links" ON project_module_links FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to create links" ON project_module_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update links" ON project_module_links FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Füge Standard-Projektkategorien hinzu
INSERT INTO project_categories (name, description, color) VALUES
('Entwicklung', 'Software-Entwicklungsprojekte', '#10B981'),
('Marketing', 'Marketing- und Werbekampagnen', '#F59E0B'),
('Forschung', 'Forschungs- und Entwicklungsprojekte', '#8B5CF6'),
('Infrastruktur', 'IT-Infrastruktur und Hardware', '#EF4444'),
('Schulung', 'Weiterbildungs- und Schulungsprojekte', '#06B6D4')
ON CONFLICT DO NOTHING;

-- Füge Standard-Projektansichten hinzu
INSERT INTO project_views (name, description, icon, slug, sort_order, filter_config) VALUES
('Alle Projekte', 'Alle aktiven Projekte anzeigen', 'Layout', 'all', 1, '{"status": "all"}'),
('Aktive Projekte', 'Nur aktive Projekte anzeigen', 'Play', 'active', 2, '{"status": "active"}'),
('Archivierte Projekte', 'Archivierte Projekte anzeigen', 'Archive', 'archived', 3, '{"status": "archived"}'),
('Meine Projekte', 'Projekte die mir zugewiesen sind', 'Grid', 'my-projects', 4, '{"assigned_to_me": true}')
ON CONFLICT (slug) DO NOTHING;

-- Erstelle Trigger für automatische Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Füge Trigger zu allen relevanten Tabellen hinzu
DO $$
BEGIN
  -- Nur Trigger hinzufügen, wenn sie noch nicht existieren
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_categories_updated_at') THEN
    CREATE TRIGGER update_project_categories_updated_at BEFORE UPDATE ON project_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_templates_updated_at') THEN
    CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON project_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_tasks_updated_at') THEN
    CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_milestones_updated_at') THEN
    CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_budget_entries_updated_at') THEN
    CREATE TRIGGER update_project_budget_entries_updated_at BEFORE UPDATE ON project_budget_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_views_updated_at') THEN
    CREATE TRIGGER update_project_views_updated_at BEFORE UPDATE ON project_views FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_module_links_updated_at') THEN
    CREATE TRIGGER update_project_module_links_updated_at BEFORE UPDATE ON project_module_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;
