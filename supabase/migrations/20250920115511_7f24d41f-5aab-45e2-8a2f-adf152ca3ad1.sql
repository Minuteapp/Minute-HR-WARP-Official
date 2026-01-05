-- Add company_id nullable first, then update with default values
ALTER TABLE public.business_trips ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.business_trip_expenses ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.business_trip_reports ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS company_id UUID;

-- Enable RLS on all tables
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Business trips company isolation" ON public.business_trips;
DROP POLICY IF EXISTS "Business trip expenses company isolation" ON public.business_trip_expenses;  
DROP POLICY IF EXISTS "Business trip reports company isolation" ON public.business_trip_reports;
DROP POLICY IF EXISTS "Budget plans company isolation" ON public.budget_plans;

-- Create RLS policies that handle NULL company_id gracefully
CREATE POLICY "Business trips company isolation" ON public.business_trips
FOR ALL
USING (
  CASE 
    WHEN company_id IS NULL THEN false  -- Hide records without company_id
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  company_id IS NOT NULL  -- Require company_id for new records
);

-- Create RLS policies for business trip expenses
CREATE POLICY "Business trip expenses company isolation" ON public.business_trip_expenses
FOR ALL
USING (
  CASE 
    WHEN company_id IS NULL THEN false
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  company_id IS NOT NULL
);

-- Create RLS policies for business trip reports
CREATE POLICY "Business trip reports company isolation" ON public.business_trip_reports
FOR ALL
USING (
  CASE 
    WHEN company_id IS NULL THEN false
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  company_id IS NOT NULL
);

-- Create RLS policies for budget plans
CREATE POLICY "Budget plans company isolation" ON public.budget_plans
FOR ALL
USING (
  CASE 
    WHEN company_id IS NULL THEN false
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  company_id IS NOT NULL
);