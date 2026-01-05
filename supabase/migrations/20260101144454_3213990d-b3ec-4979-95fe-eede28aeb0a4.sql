-- Funktion an tatsächliche employees-Tabelle anpassen (ohne nicht existierende Spalten)
DROP FUNCTION IF EXISTS public.create_employee_without_company_id(
  text, text, text, text, text, text, text, text, text, date, boolean, uuid, date, text, text, text, text, text, text, text, text, text, text, numeric, integer, time, time, time, time, numeric, text, text, text, text, text, text, text, text, text, text, uuid, date, integer, text, text
);

CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(
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

  -- Nur Spalten verwenden die tatsächlich in der Tabelle existieren
  INSERT INTO employees (
    company_id, name, first_name, last_name, email, position, department, team,
    employee_number, employment_type, start_date, onboarding_required, birth_date,
    nationality, phone, mobile_phone, street, city, postal_code, country,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    working_hours, vacation_days, work_start_time, work_end_time,
    lunch_break_start, lunch_break_end, salary_amount, salary_currency,
    tax_id, social_security_number, bank_name, iban, bank_bic, cost_center,
    manager_id, contract_end_date
  ) VALUES (
    v_company_id, v_full_name, p_first_name, p_last_name, p_email, p_position, p_department, p_team,
    p_employee_number, COALESCE(p_employment_type, 'full_time'), p_start_date, COALESCE(p_onboarding_required, false), p_birth_date,
    p_nationality, p_phone, p_mobile_phone, p_street, p_city, p_postal_code, p_country,
    p_emergency_contact_name, p_emergency_contact_phone, p_emergency_contact_relation,
    p_working_hours, p_vacation_days, p_work_start_time, p_work_end_time,
    p_lunch_break_start, p_lunch_break_end, p_salary_amount, COALESCE(p_salary_currency, 'EUR'),
    p_tax_id, p_social_security_number, p_bank_name, p_iban, p_bic, p_cost_center,
    p_manager_id, p_contract_end_date
  )
  RETURNING id INTO v_employee_id;

  RETURN v_employee_id;
END;
$$;