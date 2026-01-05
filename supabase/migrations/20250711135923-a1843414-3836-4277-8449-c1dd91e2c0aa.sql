-- Erweitere Innovation Ideen für den Lifecycle
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS roadmap_id uuid REFERENCES roadmaps(id);
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id);
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'submitted';
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS success_probability integer DEFAULT 0;
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS budget_estimate numeric DEFAULT 0;
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS pilot_area text;
ALTER TABLE innovation_ideas ADD COLUMN IF NOT EXISTS automation_triggered boolean DEFAULT false;

-- Erweitere Roadmaps für Innovation-Verknüpfung
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS source_idea_id uuid REFERENCES innovation_ideas(id);
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS auto_created boolean DEFAULT false;

-- Erweitere Projects für Innovation-Verknüpfung
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_roadmap_id uuid REFERENCES roadmaps(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_idea_id uuid REFERENCES innovation_ideas(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lifecycle_automated boolean DEFAULT false;

-- Erweitere Tasks für Template-Automation
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_generated boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS template_type text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_project_id uuid REFERENCES projects(id);

-- Innovation Lifecycle Tracking Tabelle
CREATE TABLE IF NOT EXISTS innovation_lifecycle_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id uuid REFERENCES innovation_ideas(id) NOT NULL,
  roadmap_id uuid REFERENCES roadmaps(id),
  project_id uuid REFERENCES projects(id),
  current_stage text DEFAULT 'idea_submitted',
  stage_history jsonb DEFAULT '[]'::jsonb,
  automation_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Innovation Approval Workflow
CREATE TABLE IF NOT EXISTS innovation_approvals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id uuid REFERENCES innovation_ideas(id) NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewer_name text,
  approval_stage text DEFAULT 'initial_review',
  status text DEFAULT 'pending',
  decision text,
  feedback text,
  ai_score jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Project Templates für Automation
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  default_tasks jsonb DEFAULT '[]'::jsonb,
  default_timeline_weeks integer DEFAULT 12,
  required_skills text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Standard Templates einfügen
INSERT INTO project_templates (name, category, description, default_tasks, default_timeline_weeks, required_skills) VALUES 
('Innovation Pilot Project', 'innovation', 'Standard template for innovation pilot projects', 
'[
  {"title": "Projekt-Kickoff Meeting organisieren", "priority": "high", "estimated_hours": 4},
  {"title": "Stakeholder-Analyse durchführen", "priority": "high", "estimated_hours": 8},
  {"title": "Sicherheits- und Compliance-Review", "priority": "medium", "estimated_hours": 6},
  {"title": "Pilotbereich definieren und vorbereiten", "priority": "high", "estimated_hours": 16},
  {"title": "KPIs und Erfolgsmetriken festlegen", "priority": "high", "estimated_hours": 8},
  {"title": "Marketing und Kommunikationsplan", "priority": "medium", "estimated_hours": 12},
  {"title": "Pilotphase durchführen", "priority": "high", "estimated_hours": 80},
  {"title": "Ergebnisse analysieren und dokumentieren", "priority": "high", "estimated_hours": 16},
  {"title": "Rollout-Empfehlung erstellen", "priority": "high", "estimated_hours": 8}
]'::jsonb, 16, ARRAY['project_management', 'innovation', 'analysis']),

('Process Innovation', 'process', 'Template for process improvement innovations',
'[
  {"title": "Aktuellen Prozess dokumentieren", "priority": "high", "estimated_hours": 12},
  {"title": "Stakeholder Workshop durchführen", "priority": "high", "estimated_hours": 8},
  {"title": "Neuen Prozess designen", "priority": "high", "estimated_hours": 24},
  {"title": "Schulungskonzept entwickeln", "priority": "medium", "estimated_hours": 16},
  {"title": "Pilot-Implementierung", "priority": "high", "estimated_hours": 40},
  {"title": "Feedback sammeln und optimieren", "priority": "medium", "estimated_hours": 12},
  {"title": "Vollständiger Rollout", "priority": "high", "estimated_hours": 32}
]'::jsonb, 12, ARRAY['process_optimization', 'change_management']);

-- Innovation AI Insights Tabelle
CREATE TABLE IF NOT EXISTS innovation_ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id uuid REFERENCES innovation_ideas(id) NOT NULL,
  insight_type text NOT NULL,
  confidence_score numeric DEFAULT 0,
  insight_data jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  similar_ideas uuid[],
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE innovation_lifecycle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS für Innovation Lifecycle Tracking
CREATE POLICY "Users can view lifecycle tracking" ON innovation_lifecycle_tracking FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM innovation_ideas 
    WHERE innovation_ideas.id = innovation_lifecycle_tracking.idea_id 
    AND (innovation_ideas.created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "System can manage lifecycle tracking" ON innovation_lifecycle_tracking FOR ALL USING (true);

-- RLS für Innovation Approvals
CREATE POLICY "Users can view relevant approvals" ON innovation_approvals FOR SELECT USING (
  reviewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM innovation_ideas 
    WHERE innovation_ideas.id = innovation_approvals.idea_id 
    AND innovation_ideas.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Reviewers can manage approvals" ON innovation_approvals FOR ALL USING (
  reviewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- RLS für Project Templates
CREATE POLICY "All users can view active templates" ON project_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON project_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- RLS für AI Insights
CREATE POLICY "Users can view AI insights for their ideas" ON innovation_ai_insights FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM innovation_ideas 
    WHERE innovation_ideas.id = innovation_ai_insights.idea_id 
    AND (innovation_ideas.created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    ))
  )
);

-- Trigger für Lifecycle Updates
CREATE OR REPLACE FUNCTION update_innovation_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lifecycle tracking when idea status changes
  IF TG_TABLE_NAME = 'innovation_ideas' AND OLD.status != NEW.status THEN
    INSERT INTO innovation_lifecycle_tracking (idea_id, current_stage, stage_history)
    VALUES (NEW.id, NEW.status, 
      COALESCE((SELECT stage_history FROM innovation_lifecycle_tracking WHERE idea_id = NEW.id), '[]'::jsonb) ||
      jsonb_build_object('stage', NEW.status, 'timestamp', now(), 'trigger', 'status_change')
    )
    ON CONFLICT (idea_id) DO UPDATE SET
      current_stage = NEW.status,
      stage_history = innovation_lifecycle_tracking.stage_history || 
        jsonb_build_object('stage', NEW.status, 'timestamp', now(), 'trigger', 'status_change'),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER innovation_lifecycle_trigger
  AFTER UPDATE ON innovation_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_innovation_lifecycle();

-- Funktion für automatische Roadmap-Erstellung
CREATE OR REPLACE FUNCTION create_roadmap_from_approved_idea()
RETURNS TRIGGER AS $$
DECLARE
  new_roadmap_id UUID;
BEGIN
  -- Wenn Idee approved wird, automatisch Roadmap erstellen
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.automation_triggered = false THEN
    INSERT INTO roadmaps (
      title, description, status, priority, 
      start_date, end_date, progress, source_idea_id, auto_created, created_by
    ) VALUES (
      'Innovation Roadmap: ' || NEW.title,
      COALESCE(NEW.description, 'Automatisch erstellte Roadmap für Innovation'),
      'draft',
      CASE NEW.priority 
        WHEN 'high' THEN 'critical'
        WHEN 'medium' THEN 'high' 
        ELSE 'medium' 
      END,
      CURRENT_DATE + INTERVAL '7 days',
      CURRENT_DATE + INTERVAL '6 months',
      0,
      NEW.id,
      true,
      NEW.created_by
    ) RETURNING id INTO new_roadmap_id;
    
    -- Update Idee mit Roadmap-Verknüpfung
    UPDATE innovation_ideas 
    SET roadmap_id = new_roadmap_id, automation_triggered = true, lifecycle_stage = 'roadmap_created'
    WHERE id = NEW.id;
    
    -- Log in Lifecycle Tracking
    INSERT INTO innovation_lifecycle_tracking (idea_id, roadmap_id, current_stage, automation_log)
    VALUES (NEW.id, new_roadmap_id, 'roadmap_created',
      jsonb_build_array(jsonb_build_object(
        'action', 'auto_roadmap_creation',
        'roadmap_id', new_roadmap_id,
        'timestamp', now()
      ))
    )
    ON CONFLICT (idea_id) DO UPDATE SET
      roadmap_id = new_roadmap_id,
      current_stage = 'roadmap_created',
      automation_log = innovation_lifecycle_tracking.automation_log || 
        jsonb_build_object('action', 'auto_roadmap_creation', 'roadmap_id', new_roadmap_id, 'timestamp', now()),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_roadmap_creation_trigger
  AFTER UPDATE ON innovation_ideas
  FOR EACH ROW
  EXECUTE FUNCTION create_roadmap_from_approved_idea();