-- 7. Neue Funktion für company-spezifische Mitarbeitererstellung
CREATE OR REPLACE FUNCTION public.create_employee_with_company(
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
  p_company_id uuid,
  p_status text DEFAULT 'active',
  p_onboarding_required boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_id UUID;
  v_user_company_id UUID;
BEGIN
  -- Prüfe ob der User zur angegebenen Company gehört (außer Superadmin)
  IF NOT is_superadmin(auth.uid()) THEN
    SELECT ur.company_id INTO v_user_company_id
    FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.company_id = p_company_id
    LIMIT 1;
    
    IF v_user_company_id IS NULL THEN
      RAISE EXCEPTION 'Sie haben keine Berechtigung für diese Firma';
    END IF;
  END IF;
  
  -- Erstelle Mitarbeiter mit company_id
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
    p_company_id
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$$;