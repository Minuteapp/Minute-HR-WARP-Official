
-- Create development_actions table
CREATE TABLE IF NOT EXISTS public.development_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  action_type text NOT NULL CHECK (action_type IN ('mentoring', 'coaching', 'training', 'goal_adjustment')),
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  due_date date,
  completed_at timestamptz,
  company_id uuid REFERENCES public.companies(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goal_milestones table
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES public.goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create goal_activities table
CREATE TABLE IF NOT EXISTS public.goal_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES public.goals(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('update', 'comment', 'progress_change', 'milestone_completed')),
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Add review_type to performance_reviews if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'review_type') THEN
    ALTER TABLE public.performance_reviews ADD COLUMN review_type text DEFAULT 'quarterly' CHECK (review_type IN ('quarterly', 'probation', 'annual'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.development_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for development_actions
CREATE POLICY "Users can view development actions in their company" ON public.development_actions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert development actions in their company" ON public.development_actions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update development actions in their company" ON public.development_actions
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid())
  );

-- RLS Policies for goal_milestones
CREATE POLICY "Users can view goal milestones" ON public.goal_milestones
  FOR SELECT USING (
    goal_id IN (SELECT id FROM public.goals WHERE company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can manage goal milestones" ON public.goal_milestones
  FOR ALL USING (
    goal_id IN (SELECT id FROM public.goals WHERE company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid()))
  );

-- RLS Policies for goal_activities
CREATE POLICY "Users can view goal activities" ON public.goal_activities
  FOR SELECT USING (
    goal_id IN (SELECT id FROM public.goals WHERE company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can insert goal activities" ON public.goal_activities
  FOR INSERT WITH CHECK (
    goal_id IN (SELECT id FROM public.goals WHERE company_id IN (SELECT company_id FROM public.employees WHERE user_id = auth.uid()))
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_development_actions_employee ON public.development_actions(employee_id);
CREATE INDEX IF NOT EXISTS idx_development_actions_company ON public.development_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_development_actions_status ON public.development_actions(status);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_activities_goal ON public.goal_activities(goal_id);
