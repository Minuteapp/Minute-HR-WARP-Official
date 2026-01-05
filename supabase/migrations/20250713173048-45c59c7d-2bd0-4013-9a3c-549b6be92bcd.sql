-- ========================================
-- INNOVATION HUB TABELLEN ERSTELLEN (ohne FK constraints)
-- ========================================

-- Innovation Ideas Tabelle (erweitert)
CREATE TABLE IF NOT EXISTS public.innovation_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  channel_id UUID,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  expected_impact TEXT,
  implementation_effort TEXT DEFAULT 'medium' CHECK (implementation_effort IN ('low', 'medium', 'high')),
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_audience TEXT,
  success_metrics TEXT,
  resources_needed TEXT,
  timeline_estimate TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'in_development', 'pilot_phase', 'implemented', 'rejected', 'archived')),
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  roadmap_id UUID,
  project_id UUID,
  lifecycle_stage TEXT DEFAULT 'submitted' CHECK (lifecycle_stage IN ('submitted', 'under_review', 'approved', 'roadmap_created', 'project_created', 'in_development', 'pilot_phase', 'implemented', 'rejected', 'archived')),
  risk_score NUMERIC,
  success_probability NUMERIC,
  budget_estimate NUMERIC,
  pilot_area TEXT,
  automation_triggered BOOLEAN DEFAULT false,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Innovation Channels Tabelle
CREATE TABLE IF NOT EXISTS public.innovation_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ideas_count INTEGER DEFAULT 0,
  pilot_projects_count INTEGER DEFAULT 0
);

-- Pilot Projects Tabelle
CREATE TABLE IF NOT EXISTS public.pilot_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  idea_id UUID,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'pilot_phase', 'scaling', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget NUMERIC,
  success_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  responsible_person TEXT NOT NULL,
  team_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  risk_assessment TEXT,
  learnings TEXT,
  next_steps TEXT,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Innovation Votes Tabelle
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  score INTEGER DEFAULT 5 CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(idea_id, voter_id)
);

-- Innovation Comments Tabelle
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID,
  commenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KI Test Features Tabelle
CREATE TABLE IF NOT EXISTS public.ki_test_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('ai_comment', 'skill_matching', 'auto_categorization', 'predictive_analysis')),
  is_enabled BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  feedback_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Innovation Lifecycle Tracking Tabelle
CREATE TABLE IF NOT EXISTS public.innovation_lifecycle_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID,
  roadmap_id UUID,
  project_id UUID,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('submitted', 'under_review', 'approved', 'roadmap_created', 'project_created', 'in_development', 'pilot_phase', 'implemented', 'rejected', 'archived')),
  stage_history JSONB DEFAULT '[]'::jsonb,
  automation_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project Templates Tabelle
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_submitter ON public.innovation_ideas(submitter_id);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_status ON public.innovation_ideas(status);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_channel ON public.innovation_ideas(channel_id);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_tags ON public.innovation_ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea ON public.innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea ON public.innovation_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_pilot_projects_idea ON public.pilot_projects(idea_id);

-- Update Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_innovation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_innovation_ideas_updated_at
  BEFORE UPDATE ON public.innovation_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();

CREATE TRIGGER update_innovation_channels_updated_at
  BEFORE UPDATE ON public.innovation_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();

CREATE TRIGGER update_pilot_projects_updated_at
  BEFORE UPDATE ON public.pilot_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();

CREATE TRIGGER update_innovation_comments_updated_at
  BEFORE UPDATE ON public.innovation_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();

CREATE TRIGGER update_innovation_lifecycle_tracking_updated_at
  BEFORE UPDATE ON public.innovation_lifecycle_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();