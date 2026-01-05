-- Create table for innovation AI analysis
CREATE TABLE IF NOT EXISTS public.innovation_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES innovation_ideas(id) ON DELETE CASCADE,
  innovation_score INTEGER NOT NULL DEFAULT 0 CHECK (innovation_score >= 0 AND innovation_score <= 10),
  feasibility_score INTEGER NOT NULL DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 10),
  impact_score INTEGER NOT NULL DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 10),
  summary TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  similar_ideas TEXT[] DEFAULT '{}',
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for innovation comments
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for innovation votes
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.innovation_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for innovation_ai_analysis
CREATE POLICY "AI analysis is viewable by everyone" 
ON public.innovation_ai_analysis 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can create AI analysis" 
ON public.innovation_ai_analysis 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for innovation_comments
CREATE POLICY "Comments are viewable by everyone unless private" 
ON public.innovation_comments 
FOR SELECT 
USING (NOT is_private OR auth.uid() = user_id::uuid);

CREATE POLICY "Authenticated users can create comments" 
ON public.innovation_comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own comments" 
ON public.innovation_comments 
FOR UPDATE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete their own comments" 
ON public.innovation_comments 
FOR DELETE 
USING (auth.uid() = user_id::uuid);

-- RLS Policies for innovation_votes
CREATE POLICY "Votes are viewable by everyone" 
ON public.innovation_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote" 
ON public.innovation_votes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own votes" 
ON public.innovation_votes 
FOR UPDATE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete their own votes" 
ON public.innovation_votes 
FOR DELETE 
USING (auth.uid() = user_id::uuid);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_innovation_ai_analysis_idea_id ON public.innovation_ai_analysis(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea_id ON public.innovation_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_user_id ON public.innovation_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea_id ON public.innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_user_id ON public.innovation_votes(user_id);

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_innovation_ai_analysis_updated_at
  BEFORE UPDATE ON public.innovation_ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_innovation_comments_updated_at
  BEFORE UPDATE ON public.innovation_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();