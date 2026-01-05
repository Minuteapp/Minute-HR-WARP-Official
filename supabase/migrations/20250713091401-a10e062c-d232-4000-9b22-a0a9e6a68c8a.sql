-- Füge company_id zu den relevanten Tabellen hinzu, falls noch nicht vorhanden

-- Prüfe und füge company_id zu calendar_events hinzu
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendar_events' AND column_name = 'company_id') THEN
        ALTER TABLE public.calendar_events ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Prüfe und füge company_id zu projects hinzu
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'company_id') THEN
        ALTER TABLE public.projects ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Prüfe und füge company_id zu tasks hinzu
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'company_id') THEN
        ALTER TABLE public.tasks ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- RLS Policies für company-spezifische Daten erstellen

-- Calendar Events RLS
DROP POLICY IF EXISTS "Users can view company calendar events" ON calendar_events;
CREATE POLICY "Users can view company calendar events"
ON calendar_events FOR SELECT
USING (
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
  ) OR company_id IS NULL
);

-- Projects RLS 
DROP POLICY IF EXISTS "Users can view company projects" ON projects;
CREATE POLICY "Users can view company projects"
ON projects FOR SELECT
USING (
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
  ) OR company_id IS NULL
);

-- Tasks RLS
DROP POLICY IF EXISTS "Users can view company tasks" ON tasks;
CREATE POLICY "Users can view company tasks"
ON tasks FOR SELECT
USING (
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
  ) OR company_id IS NULL
);