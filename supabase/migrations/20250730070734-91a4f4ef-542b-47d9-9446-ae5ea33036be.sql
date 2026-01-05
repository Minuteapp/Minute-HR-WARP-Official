-- Zuerst: Tabelle für KI-Analyse von Innovationsideen erstellen
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

-- Tabelle für Kommentare zu Innovationsideen
CREATE TABLE IF NOT EXISTS public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabelle für Bewertungen von Innovationsideen
CREATE TABLE IF NOT EXISTS public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES innovation_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Row Level Security aktivieren
ALTER TABLE public.innovation_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies für innovation_ai_analysis
CREATE POLICY "KI-Analysen können von allen gelesen werden" 
ON public.innovation_ai_analysis 
FOR SELECT 
USING (true);

CREATE POLICY "Authentifizierte Benutzer können KI-Analysen erstellen" 
ON public.innovation_ai_analysis 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies für innovation_comments
CREATE POLICY "Kommentare können von allen gelesen werden" 
ON public.innovation_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authentifizierte Benutzer können Kommentare erstellen" 
ON public.innovation_comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id::uuid);

CREATE POLICY "Benutzer können ihre eigenen Kommentare bearbeiten" 
ON public.innovation_comments 
FOR UPDATE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Benutzer können ihre eigenen Kommentare löschen" 
ON public.innovation_comments 
FOR DELETE 
USING (auth.uid() = user_id::uuid);

-- RLS Policies für innovation_votes
CREATE POLICY "Bewertungen können von allen gelesen werden" 
ON public.innovation_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authentifizierte Benutzer können bewerten" 
ON public.innovation_votes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id::uuid);

CREATE POLICY "Benutzer können ihre eigenen Bewertungen ändern" 
ON public.innovation_votes 
FOR UPDATE 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Benutzer können ihre eigenen Bewertungen löschen" 
ON public.innovation_votes 
FOR DELETE 
USING (auth.uid() = user_id::uuid);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_innovation_ai_analysis_idea_id ON public.innovation_ai_analysis(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_idea_id ON public.innovation_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_user_id ON public.innovation_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_idea_id ON public.innovation_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_user_id ON public.innovation_votes(user_id);

-- Trigger für automatische Timestamp-Updates
CREATE TRIGGER update_innovation_ai_analysis_updated_at
  BEFORE UPDATE ON public.innovation_ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_innovation_comments_updated_at
  BEFORE UPDATE ON public.innovation_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();