-- Workforce Planning Database Schema

-- Abteilungen/Teams Tabelle
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID,
  budget DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Positionen/Rollen Tabelle  
CREATE TABLE public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  description TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workforce Planning Perioden
CREATE TABLE public.planning_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Personalbedarfsplanung
CREATE TABLE public.workforce_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planning_period_id UUID REFERENCES public.planning_periods(id),
  department_id UUID REFERENCES public.departments(id),
  position_id UUID REFERENCES public.job_positions(id),
  current_headcount INTEGER DEFAULT 0,
  planned_headcount INTEGER NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  justification TEXT,
  start_date DATE,
  deadline DATE,
  budget_allocated DECIMAL(12,2),
  skills_required JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('planned', 'approved', 'in_progress', 'fulfilled', 'cancelled')) DEFAULT 'planned',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Kapazitätsplanung
CREATE TABLE public.capacity_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planning_period_id UUID REFERENCES public.planning_periods(id),
  department_id UUID REFERENCES public.departments(id),
  workload_hours DECIMAL(10,2) NOT NULL,
  available_hours DECIMAL(10,2) NOT NULL,
  utilization_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN available_hours > 0 THEN (workload_hours / available_hours) * 100 
      ELSE 0 
    END
  ) STORED,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  planned_hires INTEGER DEFAULT 0,
  planned_departures INTEGER DEFAULT 0,
  month DATE NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Skills Management
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  is_technical BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee Skills Mapping
CREATE TABLE public.employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  skill_id UUID REFERENCES public.skills(id),
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5) DEFAULT 1,
  years_experience DECIMAL(3,1),
  certified BOOLEAN DEFAULT false,
  last_assessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, skill_id)
);

-- Succession Planning
CREATE TABLE public.succession_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.job_positions(id),
  current_holder_id UUID,
  successor_id UUID,
  readiness_level TEXT CHECK (readiness_level IN ('ready_now', 'ready_1_year', 'ready_2_years', 'needs_development')),
  development_plan TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  backup_successors JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workforce Analytics
CREATE TABLE public.workforce_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  total_employees INTEGER DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  turnover_rate DECIMAL(5,2) DEFAULT 0,
  avg_tenure_months DECIMAL(5,1) DEFAULT 0,
  cost_per_employee DECIMAL(10,2) DEFAULT 0,
  productivity_score DECIMAL(5,2) DEFAULT 0,
  satisfaction_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(period_date, department_id)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "HR and Admins can manage departments"
ON public.departments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "Everyone can view departments"
ON public.departments FOR SELECT
USING (true);

CREATE POLICY "HR and Admins can manage positions"
ON public.job_positions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "Everyone can view active positions"
ON public.job_positions FOR SELECT
USING (is_active = true);

CREATE POLICY "HR and Admins can manage planning"
ON public.planning_periods FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can manage workforce demands"
ON public.workforce_demands FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can manage capacity planning"
ON public.capacity_planning FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "Everyone can view skills"
ON public.skills FOR SELECT
USING (true);

CREATE POLICY "HR and Admins can manage skills"
ON public.skills FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "Users can view their own skills"
ON public.employee_skills FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "HR and Admins can manage employee skills"
ON public.employee_skills FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can manage succession plans"
ON public.succession_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

CREATE POLICY "HR and Admins can view analytics"
ON public.workforce_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- Trigger Functions
CREATE OR REPLACE FUNCTION public.update_workforce_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON public.job_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_planning_periods_updated_at
  BEFORE UPDATE ON public.planning_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_workforce_demands_updated_at
  BEFORE UPDATE ON public.workforce_demands
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_capacity_planning_updated_at
  BEFORE UPDATE ON public.capacity_planning
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_employee_skills_updated_at
  BEFORE UPDATE ON public.employee_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();

CREATE TRIGGER update_succession_plans_updated_at
  BEFORE UPDATE ON public.succession_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_workforce_updated_at();