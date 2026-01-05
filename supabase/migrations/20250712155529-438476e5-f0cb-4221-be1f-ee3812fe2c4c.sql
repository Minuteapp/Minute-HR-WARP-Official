-- Neue create_employee_with_company Funktion, die company_id unterstützt
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
  p_status text DEFAULT 'active'::text, 
  p_onboarding_required boolean DEFAULT false,
  p_company_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_employee_id UUID;
BEGIN
  -- Erstellt einen Mitarbeiter mit company_id und umgeht dabei die RLS
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
$function$;