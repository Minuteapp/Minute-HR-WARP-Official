-- Create business_trips table with proper tenant isolation
CREATE TABLE IF NOT EXISTS public.business_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT,
  supervisor TEXT,
  purpose TEXT NOT NULL,
  purpose_type TEXT DEFAULT 'business',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  destination TEXT NOT NULL,
  destination_address TEXT,
  transport TEXT DEFAULT 'flight',
  hotel_required BOOLEAN DEFAULT false,
  hotel_details TEXT,
  cost_coverage TEXT DEFAULT 'company',
  cost_center TEXT,
  advance_payment NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  approver_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "Business trips company isolation" ON public.business_trips
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
);

-- Budget plans table
CREATE TABLE IF NOT EXISTS public.budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  used_amount NUMERIC DEFAULT 0,
  reserved_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  year INTEGER NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID NOT NULL
);

-- Enable RLS for budget plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget plans
CREATE POLICY "Budget plans company isolation" ON public.budget_plans
FOR ALL
USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
);

-- Add foreign key constraint for business trips to budget plans
ALTER TABLE public.business_trips 
ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES public.budget_plans(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_trips_company_id ON public.business_trips(company_id);
CREATE INDEX IF NOT EXISTS idx_business_trips_employee_id ON public.business_trips(employee_id);
CREATE INDEX IF NOT EXISTS idx_budget_plans_company_id ON public.budget_plans(company_id);