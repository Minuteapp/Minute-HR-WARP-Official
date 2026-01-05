-- Create department_performance table
CREATE TABLE public.department_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id),
  period TEXT NOT NULL,
  goals_score NUMERIC DEFAULT 0,
  tasks_score NUMERIC DEFAULT 0,
  feedback_score NUMERIC DEFAULT 0,
  development_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  overdue_reviews INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  team_count INTEGER DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_performance table
CREATE TABLE public.team_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id),
  department_id UUID REFERENCES public.departments(id),
  period TEXT NOT NULL,
  goals_score NUMERIC DEFAULT 0,
  tasks_score NUMERIC DEFAULT 0,
  feedback_score NUMERIC DEFAULT 0,
  development_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  overdue_reviews INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  total_feedback_items INTEGER DEFAULT 0,
  total_development_actions INTEGER DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_performance table
CREATE TABLE public.company_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  goals_weight NUMERIC DEFAULT 40,
  tasks_weight NUMERIC DEFAULT 30,
  feedback_weight NUMERIC DEFAULT 20,
  development_weight NUMERIC DEFAULT 10,
  goals_score NUMERIC DEFAULT 0,
  tasks_score NUMERIC DEFAULT 0,
  feedback_score NUMERIC DEFAULT 0,
  development_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  total_departments INTEGER DEFAULT 0,
  total_teams INTEGER DEFAULT 0,
  total_employees INTEGER DEFAULT 0,
  overdue_reviews INTEGER DEFAULT 0,
  top_performers INTEGER DEFAULT 0,
  needs_development INTEGER DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.department_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for department_performance
CREATE POLICY "Users can view department performance" ON public.department_performance
  FOR SELECT USING (true);

CREATE POLICY "Users can insert department performance" ON public.department_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update department performance" ON public.department_performance
  FOR UPDATE USING (true);

-- RLS Policies for team_performance
CREATE POLICY "Users can view team performance" ON public.team_performance
  FOR SELECT USING (true);

CREATE POLICY "Users can insert team performance" ON public.team_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update team performance" ON public.team_performance
  FOR UPDATE USING (true);

-- RLS Policies for company_performance
CREATE POLICY "Users can view company performance" ON public.company_performance
  FOR SELECT USING (true);

CREATE POLICY "Users can insert company performance" ON public.company_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update company performance" ON public.company_performance
  FOR UPDATE USING (true);

-- Indexes for better query performance
CREATE INDEX idx_department_performance_department ON public.department_performance(department_id);
CREATE INDEX idx_department_performance_company ON public.department_performance(company_id);
CREATE INDEX idx_team_performance_team ON public.team_performance(team_id);
CREATE INDEX idx_team_performance_department ON public.team_performance(department_id);
CREATE INDEX idx_team_performance_company ON public.team_performance(company_id);
CREATE INDEX idx_company_performance_company ON public.company_performance(company_id);