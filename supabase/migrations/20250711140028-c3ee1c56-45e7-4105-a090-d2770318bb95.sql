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
  template_category text NOT NULL,
  description text,
  default_tasks jsonb DEFAULT '[]'::jsonb,
  default_timeline_weeks integer DEFAULT 12,
  required_skills text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

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