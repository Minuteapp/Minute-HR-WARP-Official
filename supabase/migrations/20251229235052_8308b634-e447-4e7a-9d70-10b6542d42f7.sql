-- Update create_employee_bypass_rls function to automatically set company_id
CREATE OR REPLACE FUNCTION public.create_employee_bypass_rls(
  p_name text, 
  p_email text, 
  p_first_name text, 
  p_last_name text, 
  p_position text, 
  p_department text, 
  p_team text, 
  p_employee_number text, 
  p_employment_type text, 
  p_start_date date, 
  p_status text DEFAULT 'active', 
  p_onboarding_required boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_id UUID;
  v_company_id UUID;
BEGIN
  -- Company ID ermitteln (Tenant-Session zuerst, dann User-Rolle)
  SELECT uts.tenant_company_id INTO v_company_id
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL;
  
  -- Fallback: User's eigene Company aus user_roles
  IF v_company_id IS NULL THEN
    SELECT ur.company_id INTO v_company_id
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
  END IF;
  
  -- Sicherheitsprüfung
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Keine Unternehmens-ID gefunden. Bitte melden Sie sich erneut an.';
  END IF;

  INSERT INTO public.employees (
    name,
    email,
    first_name,
    last_name,
    position,
    department,
    team,
    employee_number,
    employment_type,
    start_date,
    status,
    onboarding_required,
    company_id
  ) VALUES (
    p_name,
    p_email,
    p_first_name,
    p_last_name,
    p_position,
    p_department,
    p_team,
    p_employee_number,
    p_employment_type::employment_type,
    p_start_date,
    p_status,
    p_onboarding_required,
    v_company_id
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$$;