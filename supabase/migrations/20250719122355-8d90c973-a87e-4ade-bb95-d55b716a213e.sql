-- Skills Tabelle
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  is_technical BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_analytics ENABLE ROW LEVEL SECURITY;

-- Skills Policies
CREATE POLICY "Everyone can view skills"
ON public.skills FOR SELECT
USING (true);

CREATE POLICY "HR can manage skills"
ON public.skills FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- Analytics Policies  
CREATE POLICY "HR can view analytics"
ON public.workforce_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);