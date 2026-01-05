-- Create reward_catalog table for storing available rewards
CREATE TABLE public.reward_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('financial', 'non_financial', 'experience', 'recognition')),
  value_display TEXT NOT NULL,
  value_min NUMERIC,
  value_max NUMERIC,
  budget NUMERIC,
  budget_used NUMERIC DEFAULT 0,
  frequency TEXT CHECK (frequency IN ('once', 'monthly', 'quarterly', 'yearly', 'unlimited')),
  eligibility TEXT,
  is_active BOOLEAN DEFAULT true,
  redemption_count INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'Gift',
  company_id UUID REFERENCES public.companies(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_rewards table for tracking awarded rewards
CREATE TABLE public.employee_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  employee_name TEXT,
  reward_id UUID REFERENCES public.reward_catalog(id),
  reward_name TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  awarded_by UUID,
  awarded_by_name TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_catalog
CREATE POLICY "Users can view reward catalog" ON public.reward_catalog
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert rewards" ON public.reward_catalog
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update rewards" ON public.reward_catalog
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete rewards" ON public.reward_catalog
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for employee_rewards
CREATE POLICY "Users can view employee rewards" ON public.employee_rewards
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert employee rewards" ON public.employee_rewards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update employee rewards" ON public.employee_rewards
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_reward_catalog_company ON public.reward_catalog(company_id);
CREATE INDEX idx_reward_catalog_category ON public.reward_catalog(category);
CREATE INDEX idx_reward_catalog_active ON public.reward_catalog(is_active);
CREATE INDEX idx_employee_rewards_company ON public.employee_rewards(company_id);
CREATE INDEX idx_employee_rewards_employee ON public.employee_rewards(employee_id);
CREATE INDEX idx_employee_rewards_status ON public.employee_rewards(status);
CREATE INDEX idx_employee_rewards_awarded_at ON public.employee_rewards(awarded_at);

-- Create trigger for updated_at
CREATE TRIGGER update_reward_catalog_updated_at
  BEFORE UPDATE ON public.reward_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_rewards_updated_at
  BEFORE UPDATE ON public.employee_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();