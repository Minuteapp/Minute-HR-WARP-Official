-- Create ideas inbox table for new ideas before analysis
CREATE TABLE IF NOT EXISTS public.innovation_ideas_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  submitter_id UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'rejected', 'moved_to_main')),
  ai_analysis_triggered BOOLEAN DEFAULT false,
  ai_analysis_completed BOOLEAN DEFAULT false,
  priority_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for inbox
ALTER TABLE public.innovation_ideas_inbox ENABLE ROW LEVEL SECURITY;

-- Users can insert their own ideas into inbox
CREATE POLICY "Users can submit ideas to inbox" ON public.innovation_ideas_inbox
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- Users can view all ideas in inbox
CREATE POLICY "Users can view ideas in inbox" ON public.innovation_ideas_inbox
  FOR SELECT USING (true);

-- Only admins can update inbox ideas
CREATE POLICY "Admins can update inbox ideas" ON public.innovation_ideas_inbox
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add AI analysis results table
CREATE TABLE IF NOT EXISTS public.innovation_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.innovation_ideas_inbox(id) ON DELETE CASCADE,
  analysis_type TEXT DEFAULT 'comprehensive',
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  innovation_score INTEGER CHECK (innovation_score >= 0 AND innovation_score <= 10),
  feasibility_score INTEGER CHECK (feasibility_score >= 0 AND feasibility_score <= 10),
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 10),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 10),
  recommendation TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.8,
  analysis_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for AI analysis
ALTER TABLE public.innovation_ai_analysis ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view AI analysis
CREATE POLICY "Users can view AI analysis" ON public.innovation_ai_analysis
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only system can insert AI analysis (via Edge Function)
CREATE POLICY "System can insert AI analysis" ON public.innovation_ai_analysis
  FOR INSERT WITH CHECK (true);

-- Add team collaboration table
CREATE TABLE IF NOT EXISTS public.innovation_team_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.innovation_ideas_inbox(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  discussion_type TEXT DEFAULT 'comment' CHECK (discussion_type IN ('comment', 'todo', 'decision', 'vote')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'archived')),
  assigned_to UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for team discussions
ALTER TABLE public.innovation_team_discussions ENABLE ROW LEVEL SECURITY;

-- Users can insert discussions
CREATE POLICY "Users can add discussions" ON public.innovation_team_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view all discussions
CREATE POLICY "Users can view discussions" ON public.innovation_team_discussions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own discussions or assigned todos
CREATE POLICY "Users can update their discussions" ON public.innovation_team_discussions
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.uid() = assigned_to
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_innovation_ideas_inbox_updated_at
  BEFORE UPDATE ON public.innovation_ideas_inbox
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_innovation_ai_analysis_updated_at
  BEFORE UPDATE ON public.innovation_ai_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_innovation_team_discussions_updated_at
  BEFORE UPDATE ON public.innovation_team_discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();