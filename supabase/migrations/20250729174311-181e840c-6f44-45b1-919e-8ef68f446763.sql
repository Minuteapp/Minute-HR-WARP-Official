-- Innovation Hub: Zusätzliche Enterprise-Tabellen (die noch nicht existieren)

-- Innovation Kampagnen
CREATE TABLE IF NOT EXISTS public.innovation_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Gamification
  points_per_idea INTEGER DEFAULT 10,
  points_per_vote INTEGER DEFAULT 1,
  points_per_comment INTEGER DEFAULT 2,
  
  -- Targeting
  target_departments TEXT[],
  target_locations TEXT[],
  target_roles TEXT[],
  
  -- Meta
  company_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ideen-Votes
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  campaign_id UUID REFERENCES public.innovation_campaigns(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(idea_id, user_id)
);

-- Ideen-Kommentare
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.innovation_comments(id),
  campaign_id UUID REFERENCES public.innovation_campaigns(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- KI-Insights
CREATE TABLE IF NOT EXISTS public.innovation_ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('duplicate_detection', 'success_prediction', 'risk_analysis', 'skill_matching', 'clustering')),
  confidence_score DECIMAL NOT NULL,
  insight_data JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[],
  similar_ideas UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Innovation Analytics
CREATE TABLE IF NOT EXISTS public.innovation_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.innovation_campaigns(id),
  
  -- KPIs
  total_ideas INTEGER DEFAULT 0,
  ideas_this_month INTEGER DEFAULT 0,
  implemented_ideas INTEGER DEFAULT 0,
  active_pilot_projects INTEGER DEFAULT 0,
  participation_rate DECIMAL DEFAULT 0,
  avg_implementation_time INTEGER, -- in days
  
  -- ROI Metrics
  total_estimated_savings DECIMAL DEFAULT 0,
  total_investment DECIMAL DEFAULT 0,
  roi_percentage DECIMAL DEFAULT 0,
  
  -- Departmental Stats
  department_stats JSONB DEFAULT '{}',
  location_stats JSONB DEFAULT '{}',
  
  -- Time range
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gamification: User Points
CREATE TABLE IF NOT EXISTS public.innovation_user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  campaign_id UUID REFERENCES public.innovation_campaigns(id),
  
  -- Points breakdown
  ideas_submitted INTEGER DEFAULT 0,
  votes_cast INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  ideas_implemented INTEGER DEFAULT 0,
  
  -- Total
  total_points INTEGER DEFAULT 0,
  
  -- Achievements
  badges TEXT[] DEFAULT '{}',
  level_name TEXT DEFAULT 'Newcomer',
  
  -- Meta
  company_id UUID NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, campaign_id)
);

-- Project Templates für Ideen-zu-Projekt Konvertierung
CREATE TABLE IF NOT EXISTS public.innovation_project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Template Struktur
  default_tasks JSONB NOT NULL DEFAULT '[]',
  default_timeline_weeks INTEGER DEFAULT 12,
  required_skills TEXT[],
  estimated_budget_range TEXT,
  
  -- Meta
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lifecycle Tracking
CREATE TABLE IF NOT EXISTS public.innovation_lifecycle_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id) ON DELETE CASCADE,
  roadmap_id UUID,
  project_id UUID,
  current_stage TEXT NOT NULL,
  
  -- History
  stage_history JSONB NOT NULL DEFAULT '[]',
  automation_log JSONB NOT NULL DEFAULT '[]',
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS auf allen neuen Tabellen
ALTER TABLE public.innovation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_lifecycle_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view campaigns in their company" ON public.innovation_campaigns
  FOR SELECT USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage campaigns" ON public.innovation_campaigns
  FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND is_admin_safe(auth.uid()));

-- Votes policies  
CREATE POLICY "Users can manage their own votes" ON public.innovation_votes
  FOR ALL USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view public comments on ideas in their company" ON public.innovation_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.innovation_ideas i 
      WHERE i.id = idea_id AND i.company_id = get_user_company_id(auth.uid())
    ) AND (is_private = false OR user_id = auth.uid())
  );

CREATE POLICY "Users can create comments" ON public.innovation_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- AI Insights policies
CREATE POLICY "Users can view AI insights for ideas in their company" ON public.innovation_ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.innovation_ideas i 
      WHERE i.id = idea_id AND i.company_id = get_user_company_id(auth.uid())
    )
  );

-- Analytics policies
CREATE POLICY "Users can view analytics for their company" ON public.innovation_analytics
  FOR SELECT USING (company_id = get_user_company_id(auth.uid()));

-- User Points policies
CREATE POLICY "Users can view points in their company" ON public.innovation_user_points
  FOR SELECT USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "System can manage user points" ON public.innovation_user_points
  FOR ALL USING (company_id = get_user_company_id(auth.uid()));

-- Project Templates policies (public read)
CREATE POLICY "Users can view project templates" ON public.innovation_project_templates
  FOR SELECT USING (is_active = true);

-- Lifecycle tracking policies
CREATE POLICY "Users can view lifecycle tracking for ideas in their company" ON public.innovation_lifecycle_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.innovation_ideas i 
      WHERE i.id = idea_id AND i.company_id = get_user_company_id(auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_innovation_campaigns_company_id ON public.innovation_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea_id ON public.innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea_id ON public.innovation_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_ai_insights_idea_id ON public.innovation_ai_insights(idea_id);

-- Triggers
CREATE TRIGGER update_innovation_campaigns_updated_at
  BEFORE UPDATE ON public.innovation_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_innovation_updated_at();

-- Insert default project templates
INSERT INTO public.innovation_project_templates (name, description, category, default_tasks, default_timeline_weeks, required_skills) VALUES
('Technologie Innovation', 'Standard Template für technische Innovationen', 'technology', 
 '[{"title": "Machbarkeitsstudie", "priority": "high", "estimated_hours": 40}, {"title": "Prototyp Entwicklung", "priority": "high", "estimated_hours": 120}, {"title": "Testing & Validation", "priority": "medium", "estimated_hours": 60}, {"title": "Go-Live Planung", "priority": "medium", "estimated_hours": 30}]', 
 16, '["Software Development", "Project Management", "Testing"]'),
 
('Prozess Verbesserung', 'Template für Prozessoptimierungen', 'process',
 '[{"title": "Ist-Analyse", "priority": "high", "estimated_hours": 24}, {"title": "Soll-Konzept", "priority": "high", "estimated_hours": 32}, {"title": "Implementierung", "priority": "medium", "estimated_hours": 80}, {"title": "Change Management", "priority": "high", "estimated_hours": 40}]',
 12, '["Process Management", "Change Management", "Analytics"]'),
 
('Produkt Innovation', 'Template für neue Produktentwicklungen', 'product',
 '[{"title": "Marktanalyse", "priority": "high", "estimated_hours": 60}, {"title": "Design & Entwicklung", "priority": "high", "estimated_hours": 200}, {"title": "Testing & Feedback", "priority": "high", "estimated_hours": 80}, {"title": "Launch Vorbereitung", "priority": "medium", "estimated_hours": 60}]',
 20, '["Product Management", "Design", "Marketing", "Development"]')
ON CONFLICT DO NOTHING;