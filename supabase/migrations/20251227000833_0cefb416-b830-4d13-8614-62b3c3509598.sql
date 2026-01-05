-- Create goal_dependencies table
CREATE TABLE public.goal_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  target_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('blocks', 'enables', 'influences')),
  impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.goal_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view goal dependencies in their company" 
ON public.goal_dependencies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create goal dependencies" 
ON public.goal_dependencies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update goal dependencies" 
ON public.goal_dependencies 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete goal dependencies" 
ON public.goal_dependencies 
FOR DELETE 
USING (true);

-- Extend goal_ai_insights table
ALTER TABLE public.goal_ai_insights 
ADD COLUMN IF NOT EXISTS insight_type TEXT DEFAULT 'warning' CHECK (insight_type IN ('critical', 'warning', 'forecast', 'recommendation')),
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS recommendations TEXT[],
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- Create goal_reviews table
CREATE TABLE public.goal_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  reviewer_id UUID,
  reviewer_name TEXT NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  previous_progress INTEGER,
  new_progress INTEGER,
  adjustments TEXT,
  comments TEXT,
  next_review_date DATE,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view goal reviews in their company" 
ON public.goal_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create goal reviews" 
ON public.goal_reviews 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update goal reviews" 
ON public.goal_reviews 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete goal reviews" 
ON public.goal_reviews 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goal_dependencies_source ON public.goal_dependencies(source_goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_dependencies_target ON public.goal_dependencies(target_goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_reviews_goal ON public.goal_reviews(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_ai_insights_goal ON public.goal_ai_insights(goal_id);