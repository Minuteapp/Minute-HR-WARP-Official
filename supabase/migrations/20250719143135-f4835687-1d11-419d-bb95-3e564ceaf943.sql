-- Erweitere die bestehenden Tabellen für bessere Integration zwischen Roadmaps, Goals, Projects und Tasks

-- Erweitere die projects Tabelle um Roadmap-Verbindung
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS roadmap_id UUID REFERENCES roadmaps(id),
ADD COLUMN IF NOT EXISTS roadmap_milestone_id UUID REFERENCES roadmap_milestones(id),
ADD COLUMN IF NOT EXISTS roadmap_goal_id UUID,
ADD COLUMN IF NOT EXISTS roadmap_context JSONB DEFAULT '{}';

-- Erweitere die tasks Tabelle um Roadmap-Verbindung
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS roadmap_id UUID REFERENCES roadmaps(id),
ADD COLUMN IF NOT EXISTS roadmap_milestone_id UUID REFERENCES roadmap_milestones(id),
ADD COLUMN IF NOT EXISTS roadmap_goal_id UUID,
ADD COLUMN IF NOT EXISTS roadmap_project_id UUID,
ADD COLUMN IF NOT EXISTS roadmap_context JSONB DEFAULT '{}';

-- Erstelle eine Tabelle für Roadmap Goals (erweitert die bestehenden goals)
CREATE TABLE IF NOT EXISTS roadmap_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  roadmap_milestone_id UUID REFERENCES roadmap_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'deleted')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  completion_date DATE,
  owner_id UUID,
  team_members JSONB DEFAULT '[]',
  kpi_metrics JSONB DEFAULT '{}',
  success_criteria TEXT,
  dependencies JSONB DEFAULT '[]',
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Aktiviere RLS für roadmap_goals
ALTER TABLE roadmap_goals ENABLE ROW LEVEL SECURITY;

-- Erstelle RLS-Policies für roadmap_goals
CREATE POLICY "Users can view roadmap goals" ON roadmap_goals
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create roadmap goals" ON roadmap_goals
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update roadmap goals" ON roadmap_goals
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = owner_id);

CREATE POLICY "Admins can manage all roadmap goals" ON roadmap_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Erstelle Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_roadmap_goals_roadmap_id ON roadmap_goals(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_goals_milestone_id ON roadmap_goals(roadmap_milestone_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_goals_status ON roadmap_goals(status);
CREATE INDEX IF NOT EXISTS idx_projects_roadmap_id ON projects(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id ON tasks(roadmap_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_roadmap_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roadmap_goals_updated_at
  BEFORE UPDATE ON roadmap_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_goals_updated_at();