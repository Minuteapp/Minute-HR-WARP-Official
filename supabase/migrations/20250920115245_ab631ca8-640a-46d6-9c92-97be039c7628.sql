-- Add company_id to business travel tables
ALTER TABLE public.business_trips ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.business_trip_expenses ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.business_trip_reports ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS company_id UUID;

-- Update existing records to have company_id based on employee
UPDATE public.business_trips 
SET company_id = (
  SELECT e.company_id 
  FROM employees e 
  WHERE e.id = business_trips.employee_id
  LIMIT 1
)
WHERE company_id IS NULL;

-- Set company_id as NOT NULL after updating
ALTER TABLE public.business_trips ALTER COLUMN company_id SET NOT NULL;

-- Enable RLS
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Business trips company isolation" ON public.business_trips;
DROP POLICY IF EXISTS "Business trip expenses company isolation" ON public.business_trip_expenses;  
DROP POLICY IF EXISTS "Business trip reports company isolation" ON public.business_trip_reports;

-- Create RLS policies for business trips
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

-- Create RLS policies for business trip expenses
CREATE POLICY "Business trip expenses company isolation" ON public.business_trip_expenses
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

-- Create RLS policies for business trip reports
CREATE POLICY "Business trip reports company isolation" ON public.business_trip_reports
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