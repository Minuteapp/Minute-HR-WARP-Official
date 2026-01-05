-- Alle 5 Versionen explizit löschen

-- Version 1: 11 Parameter
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  p_name text, p_email text, p_first_name text, p_last_name text, p_position text, 
  p_department text, p_team text, p_employee_number text, p_employment_type text, 
  p_start_date date, p_onboarding_required boolean
);

-- Version 2: 12 Parameter
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  p_name text, p_email text, p_first_name text, p_last_name text, p_position text, 
  p_department text, p_team text, p_employee_number text, p_employment_type text, 
  p_start_date date, p_onboarding_required boolean, p_company_id uuid
);

-- Version 3: 44 Parameter mit p_gender
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  p_name text, p_email text, p_first_name text, p_last_name text, p_position text, 
  p_department text, p_team text, p_employee_number text, p_employment_type text, 
  p_start_date date, p_onboarding_required boolean, p_company_id uuid, p_birth_date date, 
  p_nationality text, p_gender text, p_phone text, p_mobile_phone text, p_street text, 
  p_city text, p_postal_code text, p_country text, p_location text, p_emergency_contact_name text, 
  p_emergency_contact_phone text, p_emergency_contact_relation text, p_working_hours integer, 
  p_vacation_days integer, p_work_start_time time, p_work_end_time time, 
  p_lunch_break_start time, p_lunch_break_end time, p_salary_amount numeric, 
  p_salary_currency text, p_tax_id text, p_tax_class text, p_social_security_number text, 
  p_health_insurance text, p_bank_name text, p_bank_code text, p_bank_account_number text, 
  p_iban text, p_bic text, p_cost_center text, p_manager_id uuid, p_contract_end_date date
);

-- Version 4: 45 Parameter mit working_hours integer
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  p_name text, p_email text, p_first_name text, p_last_name text, p_position text, 
  p_department text, p_team text, p_employee_number text, p_employment_type text, 
  p_start_date date, p_onboarding_required boolean, p_company_id uuid, p_birth_date date, 
  p_nationality text, p_phone text, p_mobile_phone text, p_street text, p_city text, 
  p_postal_code text, p_country text, p_emergency_contact_name text, 
  p_emergency_contact_phone text, p_emergency_contact_relation text, p_working_hours integer, 
  p_vacation_days integer, p_work_start_time time, p_work_end_time time, 
  p_lunch_break_start time, p_lunch_break_end time, p_salary_amount numeric, 
  p_salary_currency text, p_tax_id text, p_social_security_number text, p_bank_name text, 
  p_bank_code text, p_bank_account_number text, p_cost_center text, p_manager_id uuid, 
  p_contract_end_date date, p_iban text, p_bic text, p_tax_class text, p_health_insurance text, 
  p_probation_months integer, p_remote_work text, p_location text
);

-- Version 5: 45 Parameter mit working_hours numeric
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  p_name text, p_email text, p_first_name text, p_last_name text, p_position text, 
  p_department text, p_team text, p_employee_number text, p_employment_type text, 
  p_start_date date, p_onboarding_required boolean, p_company_id uuid, p_birth_date date, 
  p_nationality text, p_phone text, p_mobile_phone text, p_street text, p_city text, 
  p_postal_code text, p_country text, p_emergency_contact_name text, 
  p_emergency_contact_phone text, p_emergency_contact_relation text, p_working_hours numeric, 
  p_vacation_days integer, p_work_start_time time, p_work_end_time time, 
  p_lunch_break_start time, p_lunch_break_end time, p_salary_amount numeric, 
  p_salary_currency text, p_tax_id text, p_social_security_number text, p_tax_class text, 
  p_health_insurance text, p_bank_name text, p_bank_code text, p_bank_account_number text, 
  p_iban text, p_bic text, p_cost_center text, p_manager_id uuid, p_contract_end_date date, 
  p_probation_months integer, p_remote_work text, p_location text
);

-- Neue, einheitliche Funktion erstellen
CREATE FUNCTION public.create_employee_without_company_id(
  p_first_name text,
  p_last_name text,
  p_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_team text DEFAULT NULL,
  p_employee_number text DEFAULT NULL,
  p_employment_type text DEFAULT 'full_time',
  p_start_date date DEFAULT NULL,
  p_onboarding_required boolean DEFAULT false,
  p_company_id uuid DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_nationality text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_mobile_phone text DEFAULT NULL,
  p_street text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_emergency_contact_name text DEFAULT NULL,
  p_emergency_contact_phone text DEFAULT NULL,
  p_emergency_contact_relation text DEFAULT NULL,
  p_working_hours numeric DEFAULT NULL,
  p_vacation_days integer DEFAULT NULL,
  p_work_start_time time DEFAULT NULL,
  p_work_end_time time DEFAULT NULL,
  p_lunch_break_start time DEFAULT NULL,
  p_lunch_break_end time DEFAULT NULL,
  p_salary_amount numeric DEFAULT NULL,
  p_salary_currency text DEFAULT 'EUR',
  p_tax_id text DEFAULT NULL,
  p_social_security_number text DEFAULT NULL,
  p_tax_class text DEFAULT NULL,
  p_health_insurance text DEFAULT NULL,
  p_bank_name text DEFAULT NULL,
  p_bank_code text DEFAULT NULL,
  p_bank_account_number text DEFAULT NULL,
  p_iban text DEFAULT NULL,
  p_bic text DEFAULT NULL,
  p_cost_center text DEFAULT NULL,
  p_manager_id uuid DEFAULT NULL,
  p_contract_end_date date DEFAULT NULL,
  p_probation_months integer DEFAULT NULL,
  p_remote_work text DEFAULT NULL,
  p_location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_employee_id uuid;
  v_full_name text;
BEGIN
  IF p_company_id IS NOT NULL THEN
    v_company_id := p_company_id;
  ELSE
    SELECT company_id INTO v_company_id
    FROM user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Keine Firma gefunden';
  END IF;

  v_full_name := COALESCE(p_name, TRIM(COALESCE(p_first_name, '') || ' ' || COALESCE(p_last_name, '')));

  INSERT INTO employees (
    company_id, name, first_name, last_name, email, position, department, team,
    employee_number, employment_type, start_date, onboarding_required, birth_date,
    nationality, phone, mobile_phone, street, city, postal_code, country,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    working_hours, vacation_days, work_start_time, work_end_time,
    lunch_break_start, lunch_break_end, salary_amount, salary_currency,
    tax_id, social_security_number, tax_class, health_insurance,
    bank_name, bank_code, bank_account_number, iban, bic, cost_center,
    manager_id, contract_end_date, probation_months, remote_work, location, is_active
  ) VALUES (
    v_company_id, v_full_name, p_first_name, p_last_name, p_email, p_position, p_department, p_team,
    p_employee_number, COALESCE(p_employment_type, 'full_time'), p_start_date, COALESCE(p_onboarding_required, false), p_birth_date,
    p_nationality, p_phone, p_mobile_phone, p_street, p_city, p_postal_code, p_country,
    p_emergency_contact_name, p_emergency_contact_phone, p_emergency_contact_relation,
    p_working_hours, p_vacation_days, p_work_start_time, p_work_end_time,
    p_lunch_break_start, p_lunch_break_end, p_salary_amount, COALESCE(p_salary_currency, 'EUR'),
    p_tax_id, p_social_security_number, p_tax_class, p_health_insurance,
    p_bank_name, p_bank_code, p_bank_account_number, p_iban, p_bic, p_cost_center,
    p_manager_id, p_contract_end_date, p_probation_months, p_remote_work, p_location, true
  )
  RETURNING id INTO v_employee_id;

  RETURN v_employee_id;
END;
$$;