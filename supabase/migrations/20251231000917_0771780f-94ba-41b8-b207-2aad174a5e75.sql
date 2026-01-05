-- Aktualisiere die RPC-Funktion um alle Mitarbeiter-Felder zu unterstützen
CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(
  p_name text,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_team text DEFAULT NULL,
  p_employee_number text DEFAULT NULL,
  p_employment_type text DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_onboarding_required boolean DEFAULT false,
  p_company_id uuid DEFAULT NULL,
  -- Persönliche Daten
  p_birth_date date DEFAULT NULL,
  p_nationality text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_mobile_phone text DEFAULT NULL,
  -- Adresse
  p_street text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_country text DEFAULT NULL,
  -- Notfallkontakt
  p_emergency_contact_name text DEFAULT NULL,
  p_emergency_contact_phone text DEFAULT NULL,
  p_emergency_contact_relation text DEFAULT NULL,
  -- Arbeitszeiten
  p_working_hours numeric DEFAULT 40,
  p_vacation_days integer DEFAULT 30,
  p_work_start_time time DEFAULT NULL,
  p_work_end_time time DEFAULT NULL,
  p_lunch_break_start time DEFAULT NULL,
  p_lunch_break_end time DEFAULT NULL,
  -- Gehalt
  p_salary_amount numeric DEFAULT NULL,
  p_salary_currency text DEFAULT 'EUR',
  -- Steuer & Sozialversicherung
  p_tax_id text DEFAULT NULL,
  p_social_security_number text DEFAULT NULL,
  p_tax_class text DEFAULT NULL,
  p_health_insurance text DEFAULT NULL,
  -- Bank
  p_bank_name text DEFAULT NULL,
  p_bank_code text DEFAULT NULL,
  p_bank_account_number text DEFAULT NULL,
  p_iban text DEFAULT NULL,
  p_bic text DEFAULT NULL,
  -- Organisation
  p_cost_center text DEFAULT NULL,
  p_manager_id uuid DEFAULT NULL,
  p_contract_end_date date DEFAULT NULL,
  -- Zusätzliche Felder
  p_probation_months integer DEFAULT NULL,
  p_remote_work text DEFAULT NULL,
  p_location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_employee_id uuid;
  v_company_id uuid;
  v_status text;
BEGIN
  -- company_id aus Tenant-Context holen, oder explizit übergebene verwenden
  v_company_id := COALESCE(p_company_id, get_effective_company_id());
  
  -- Wenn NULL (Superadmin ohne Tenant-Modus), FEHLER werfen
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Mitarbeiter kann nicht erstellt werden: Kein Tenant-Context aktiv. Bitte wählen Sie zuerst eine Firma aus.';
  END IF;
  
  -- Status basierend auf Startdatum setzen
  IF p_start_date IS NOT NULL AND p_start_date > CURRENT_DATE THEN
    v_status := 'inactive';
  ELSE
    v_status := 'active';
  END IF;
  
  -- Mitarbeiter mit allen Feldern erstellen
  INSERT INTO public.employees (
    company_id,
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
    birth_date,
    nationality,
    phone,
    mobile_phone,
    street,
    city,
    postal_code,
    country,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relation,
    working_hours,
    vacation_days,
    work_start_time,
    work_end_time,
    lunch_break_start,
    lunch_break_end,
    salary_amount,
    salary_currency,
    tax_id,
    social_security_number,
    bank_name,
    iban,
    bank_bic,
    cost_center,
    manager_id,
    contract_end_date
  ) VALUES (
    v_company_id,
    p_name,
    p_email,
    p_first_name,
    p_last_name,
    p_position,
    p_department,
    p_team,
    p_employee_number,
    CASE WHEN p_employment_type IS NOT NULL THEN p_employment_type::employment_type ELSE NULL END,
    p_start_date,
    v_status,
    p_onboarding_required,
    p_birth_date,
    p_nationality,
    p_phone,
    p_mobile_phone,
    p_street,
    p_city,
    p_postal_code,
    p_country,
    p_emergency_contact_name,
    p_emergency_contact_phone,
    p_emergency_contact_relation,
    p_working_hours,
    p_vacation_days,
    p_work_start_time,
    p_work_end_time,
    p_lunch_break_start,
    p_lunch_break_end,
    p_salary_amount,
    p_salary_currency,
    p_tax_id,
    p_social_security_number,
    p_bank_name,
    p_iban,
    p_bic,
    p_cost_center,
    p_manager_id,
    p_contract_end_date
  ) RETURNING id INTO v_employee_id;
  
  RAISE NOTICE 'Mitarbeiter erfolgreich erstellt: ID=%, company_id=%', v_employee_id, v_company_id;
  
  RETURN v_employee_id;
END;
$function$;