-- Fix role_permissions table structure (corrected version with proper type casting)
-- Drop the problematic table if it exists
DROP TABLE IF EXISTS public.role_permissions;

-- Create role_permissions table with correct structure
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  action_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_name, permission_name, module_name, action_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view role permissions" ON public.role_permissions
FOR SELECT USING (true);

-- Insert default permissions for HR Budget system
INSERT INTO public.role_permissions (role_name, permission_name, module_name, action_key) VALUES
-- Admin permissions
('admin', 'budget_create', 'budget', 'create'),
('admin', 'budget_read', 'budget', 'read'),
('admin', 'budget_update', 'budget', 'update'),
('admin', 'budget_delete', 'budget', 'delete'),
('admin', 'budget_approve', 'budget', 'approve'),
('admin', 'forecast_create', 'forecast', 'create'),
('admin', 'forecast_read', 'forecast', 'read'),
('admin', 'forecast_update', 'forecast', 'update'),
('admin', 'scenario_create', 'scenario', 'create'),
('admin', 'scenario_read', 'scenario', 'read'),
('admin', 'scenario_update', 'scenario', 'update'),
('admin', 'analytics_read', 'analytics', 'read'),
('admin', 'headcount_plan', 'headcount', 'create'),
('admin', 'headcount_read', 'headcount', 'read'),
('admin', 'headcount_update', 'headcount', 'update'),

-- Manager permissions  
('manager', 'budget_read', 'budget', 'read'),
('manager', 'budget_create', 'budget', 'create'),
('manager', 'budget_update', 'budget', 'update'),
('manager', 'forecast_read', 'forecast', 'read'),
('manager', 'scenario_read', 'scenario', 'read'),
('manager', 'analytics_read', 'analytics', 'read'),
('manager', 'headcount_read', 'headcount', 'read'),

-- Employee permissions
('employee', 'budget_read', 'budget', 'read'),
('employee', 'forecast_read', 'forecast', 'read'),
('employee', 'analytics_read', 'analytics', 'read'),

-- HR permissions
('hr', 'budget_read', 'budget', 'read'),
('hr', 'budget_create', 'budget', 'create'),
('hr', 'budget_update', 'budget', 'update'),
('hr', 'forecast_read', 'forecast', 'read'),
('hr', 'forecast_create', 'forecast', 'create'),
('hr', 'scenario_read', 'scenario', 'read'),
('hr', 'analytics_read', 'analytics', 'read'),
('hr', 'headcount_plan', 'headcount', 'create'),
('hr', 'headcount_read', 'headcount', 'read'),
('hr', 'headcount_update', 'headcount', 'update');

-- Create budget_plans table for the HR Budget system
CREATE TABLE IF NOT EXISTS public.budget_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('operational', 'investment', 'project', 'department')),
  amount NUMERIC NOT NULL DEFAULT 0,
  used_amount NUMERIC NOT NULL DEFAULT 0,
  reserved_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  currency TEXT NOT NULL DEFAULT 'EUR',
  category TEXT,
  department TEXT,
  responsible_person TEXT,
  template_id UUID,
  comments TEXT,
  assigned_to UUID NOT NULL,
  assigned_to_name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on budget_plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_plans with proper type casting
CREATE POLICY "Users can view budget plans they are assigned to" ON public.budget_plans
FOR SELECT USING (
  assigned_to = auth.uid() OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins and managers can manage budget plans" ON public.budget_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin', 'manager', 'hr')
  )
);

-- Create trigger for updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
        CREATE TRIGGER update_budget_plans_updated_at
            BEFORE UPDATE ON public.budget_plans
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at();
    END IF;
END
$$;

-- Create budget_templates table
CREATE TABLE IF NOT EXISTS public.budget_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('operational', 'investment', 'project', 'department')),
  template_data JSONB NOT NULL DEFAULT '{}',
  category TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on budget_templates
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_templates
CREATE POLICY "Users can view budget templates" ON public.budget_templates
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage budget templates" ON public.budget_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin', 'manager', 'hr')
  )
);

-- Create budget_forecasts table
CREATE TABLE IF NOT EXISTS public.budget_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  forecast_period_start DATE NOT NULL,
  forecast_period_end DATE NOT NULL,
  predicted_amounts JSONB NOT NULL DEFAULT '{}',
  confidence_level NUMERIC NOT NULL DEFAULT 0.8 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  scenario_type TEXT NOT NULL DEFAULT 'realistic' CHECK (scenario_type IN ('worst_case', 'realistic', 'best_case')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on budget_forecasts
ALTER TABLE public.budget_forecasts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_forecasts
CREATE POLICY "Users can view budget forecasts" ON public.budget_forecasts
FOR SELECT USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can manage budget forecasts" ON public.budget_forecasts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'superadmin', 'manager', 'hr')
  )
);