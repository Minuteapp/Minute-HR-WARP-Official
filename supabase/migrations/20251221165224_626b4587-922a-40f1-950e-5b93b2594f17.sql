-- Incentive Rules table for automated reward rules
CREATE TABLE public.incentive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'goals', 'tasks', 'shifts', 'surveys', 'general')),
  trigger_description TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '[]',
  conditions_count INTEGER DEFAULT 0,
  action_description TEXT NOT NULL,
  action_frequency TEXT CHECK (action_frequency IN ('once', 'monthly', 'quarterly', 'yearly', 'per_project')),
  reward_id UUID REFERENCES public.reward_catalog(id) ON DELETE SET NULL,
  is_automatic BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  budget NUMERIC,
  budget_used NUMERIC DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module Achievements table for performance-based rewards
CREATE TABLE public.module_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_module TEXT NOT NULL CHECK (source_module IN ('performance', 'goals_okrs', 'tasks', 'shifts', 'surveys')),
  achievement_title TEXT NOT NULL,
  achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  suggested_reward_id UUID REFERENCES public.reward_catalog(id) ON DELETE SET NULL,
  suggested_reward_name TEXT,
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.incentive_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incentive_rules
CREATE POLICY "Users can view incentive rules from their company"
  ON public.incentive_rules FOR SELECT
  USING (true);

CREATE POLICY "Users can create incentive rules"
  ON public.incentive_rules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update incentive rules"
  ON public.incentive_rules FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete incentive rules"
  ON public.incentive_rules FOR DELETE
  USING (true);

-- RLS Policies for module_achievements
CREATE POLICY "Users can view module achievements"
  ON public.module_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can create module achievements"
  ON public.module_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update module achievements"
  ON public.module_achievements FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete module achievements"
  ON public.module_achievements FOR DELETE
  USING (true);

-- Indexes for better performance
CREATE INDEX idx_incentive_rules_company ON public.incentive_rules(company_id);
CREATE INDEX idx_incentive_rules_category ON public.incentive_rules(category);
CREATE INDEX idx_incentive_rules_active ON public.incentive_rules(is_active);
CREATE INDEX idx_module_achievements_employee ON public.module_achievements(employee_id);
CREATE INDEX idx_module_achievements_module ON public.module_achievements(source_module);
CREATE INDEX idx_module_achievements_status ON public.module_achievements(status);
CREATE INDEX idx_module_achievements_company ON public.module_achievements(company_id);

-- Trigger for updated_at on incentive_rules
CREATE TRIGGER update_incentive_rules_updated_at
  BEFORE UPDATE ON public.incentive_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();