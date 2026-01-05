-- Erstelle Innovation Hub Tabellen

-- Innovation Ideas Tabelle
CREATE TABLE public.innovation_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'approved', 'in_development', 'pilot_phase', 'implemented', 'rejected')),
  submitter_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pilot Projects Tabelle
CREATE TABLE public.pilot_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  idea_id UUID REFERENCES public.innovation_ideas(id),
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'pilot_phase', 'scaling', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  responsible_person TEXT,
  team_members TEXT[] DEFAULT '{}',
  success_metrics TEXT[] DEFAULT '{}',
  risk_assessment TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Innovation Votes Tabelle
CREATE TABLE public.innovation_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id),
  voter_id TEXT NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, voter_id)
);

-- Innovation Comments Tabelle
CREATE TABLE public.innovation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.innovation_ideas(id),
  commenter_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.innovation_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for innovation_ideas
CREATE POLICY "Jeder kann Ideen lesen" 
ON public.innovation_ideas 
FOR SELECT 
USING (true);

CREATE POLICY "Jeder kann Ideen erstellen" 
ON public.innovation_ideas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins können alle Ideen bearbeiten" 
ON public.innovation_ideas 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])))));

-- Create RLS policies for pilot_projects
CREATE POLICY "Jeder kann Pilotprojekte lesen" 
ON public.pilot_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Jeder kann Pilotprojekte erstellen" 
ON public.pilot_projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins können alle Pilotprojekte bearbeiten" 
ON public.pilot_projects 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])))));

-- Create RLS policies for innovation_votes
CREATE POLICY "Jeder kann Votes lesen" 
ON public.innovation_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Jeder kann Votes erstellen" 
ON public.innovation_votes 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for innovation_comments
CREATE POLICY "Jeder kann Kommentare lesen" 
ON public.innovation_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Jeder kann Kommentare erstellen" 
ON public.innovation_comments 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_innovation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_innovation_ideas_updated_at
BEFORE UPDATE ON public.innovation_ideas
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