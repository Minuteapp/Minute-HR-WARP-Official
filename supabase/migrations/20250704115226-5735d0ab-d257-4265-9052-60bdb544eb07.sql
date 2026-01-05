-- ========================================
-- INNOVATION HUB DATENBANKSTRUKTUR
-- ========================================

-- Innovation Ideas Haupttabelle
CREATE TABLE IF NOT EXISTS public.innovation_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'approved', 'in_progress', 'completed', 'rejected')),
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Impact & Complexity Scoring
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
  strategic_fit NUMERIC CHECK (strategic_fit >= 0 AND strategic_fit <= 1),
  
  -- Predictive Analytics
  predicted_success_probability NUMERIC CHECK (predicted_success_probability >= 0 AND predicted_success_probability <= 1),
  estimated_roi NUMERIC,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Files & Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Linking zu anderen Modulen
  linked_projects JSONB DEFAULT '[]'::jsonb,
  linked_goals JSONB DEFAULT '[]'::jsonb,
  linked_budget_items JSONB DEFAULT '[]'::jsonb,
  
  -- Audit Trail
  audit_trail JSONB DEFAULT '[]'::jsonb
);

-- Innovation Votes
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(idea_id, voter_id)
);

-- Innovation Comments
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  commenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Innovation Approval Workflows
CREATE TABLE IF NOT EXISTS public.innovation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  workflow_status TEXT DEFAULT 'pending' CHECK (workflow_status IN ('pending', 'approved', 'rejected', 'escalated')),
  approval_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  escalation_rules JSONB DEFAULT '{}'::jsonb,
  approval_deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Innovation Settings (Admin)
CREATE TABLE IF NOT EXISTS public.innovation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.innovation_settings (setting_key, setting_value, setting_type) VALUES
('voting_mechanism', '{"type": "five_star", "allow_anonymous": false}', 'voting'),
('approval_thresholds', '{"low_impact": 3, "medium_impact": 5, "high_impact": 8, "budget_threshold": 50000}', 'approval'),
('predictive_ai_weights', '{"impact_weight": 0.4, "roi_weight": 0.3, "complexity_weight": 0.3}', 'ai'),
('gamification', '{"enabled": true, "monthly_innovator_badge": true, "point_system": true}', 'gamification'),
('privacy_settings', '{"allow_anonymous_ideas": true, "public_voting": true}', 'privacy');

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_submitter ON public.innovation_ideas(submitter_id);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_status ON public.innovation_ideas(status);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_tags ON public.innovation_ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea ON public.innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea ON public.innovation_comments(idea_id);

-- Trigger für updated_at
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

CREATE TRIGGER update_innovation_workflows_updated_at
  BEFORE UPDATE ON public.innovation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();

CREATE TRIGGER update_innovation_settings_updated_at
  BEFORE UPDATE ON public.innovation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_innovation_updated_at();