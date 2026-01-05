
-- Erstelle die roadmap_planning Tabelle
CREATE TABLE public.roadmap_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vision TEXT,
  mission TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  start_date DATE,
  end_date DATE,
  strategic_objectives JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Aktiviere Row Level Security
ALTER TABLE public.roadmap_planning ENABLE ROW LEVEL SECURITY;

-- Erstelle RLS-Richtlinien für roadmap_planning
CREATE POLICY "Users can view all roadmap plans" 
  ON public.roadmap_planning 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create roadmap plans" 
  ON public.roadmap_planning 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own roadmap plans" 
  ON public.roadmap_planning 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roadmap plans" 
  ON public.roadmap_planning 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Trigger für updated_at
CREATE TRIGGER update_roadmap_planning_updated_at
  BEFORE UPDATE ON public.roadmap_planning
  FOR EACH ROW
  EXECUTE FUNCTION public.update_roadmap_planning_updated_at();
