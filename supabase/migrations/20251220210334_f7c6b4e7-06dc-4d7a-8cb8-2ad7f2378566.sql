-- Erstelle Tabelle für Firmenkreditkarten
CREATE TABLE IF NOT EXISTS public.employee_corporate_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  card_type text NOT NULL,
  card_number_masked text NOT NULL,
  holder_name text NOT NULL,
  usage_category text,
  valid_until date,
  issued_date date,
  monthly_limit numeric DEFAULT 0,
  current_usage numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.employee_corporate_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policy für employee_corporate_cards
CREATE POLICY "Benutzer können ihre eigenen Firmenkarten sehen" 
ON public.employee_corporate_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Admins können Firmenkarten erstellen" 
ON public.employee_corporate_cards 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins können Firmenkarten aktualisieren" 
ON public.employee_corporate_cards 
FOR UPDATE 
USING (true);

-- Trigger für automatische Aktualisierung von updated_at
CREATE OR REPLACE FUNCTION public.update_employee_corporate_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_corporate_cards_timestamp
BEFORE UPDATE ON public.employee_corporate_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_employee_corporate_cards_updated_at();

-- Erweitere create_employee_without_company_id Funktion mit allen Feldern
CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(
  p_name text DEFAULT NULL,
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
  -- Neue Parameter für persönliche Daten
  p_birth_date date DEFAULT NULL,
  p_nationality text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_mobile_phone text DEFAULT NULL,
  -- Adresse
  p_street text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_location text DEFAULT NULL,
  -- Notfallkontakt
  p_emergency_contact_name text DEFAULT NULL,
  p_emergency_contact_phone text DEFAULT NULL,
  p_emergency_contact_relation text DEFAULT NULL,
  -- Arbeitszeiten
  p_working_hours integer DEFAULT 40,
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
  p_tax_class text DEFAULT NULL,
  p_social_security_number text DEFAULT NULL,
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
  p_contract_end_date date DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_id uuid;
BEGIN
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
    onboarding_required,
    company_id,
    -- Persönliche Daten
    birth_date,
    nationality,
    gender,
    phone,
    mobile_phone,
    -- Adresse
    street,
    city,
    postal_code,
    country,
    location,
    -- Notfallkontakt
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relation,
    -- Arbeitszeiten
    working_hours,
    vacation_days,
    work_start_time,
    work_end_time,
    lunch_break_start,
    lunch_break_end,
    -- Gehalt
    salary_amount,
    salary_currency,
    -- Steuer & Sozialversicherung
    tax_id,
    tax_class,
    social_security_number,
    health_insurance,
    -- Bank
    bank_name,
    bank_code,
    bank_account_number,
    iban,
    bic,
    -- Organisation
    cost_center,
    manager_id,
    contract_end_date,
    -- Standard-Felder
    status,
    role
  )
  VALUES (
    COALESCE(p_name, 'Neuer Mitarbeiter'),
    p_email,
    p_first_name,
    p_last_name,
    p_position,
    p_department,
    p_team,
    p_employee_number,
    p_employment_type,
    p_start_date,
    COALESCE(p_onboarding_required, false),
    p_company_id,
    -- Persönliche Daten
    p_birth_date,
    p_nationality,
    p_gender,
    p_phone,
    p_mobile_phone,
    -- Adresse
    p_street,
    p_city,
    p_postal_code,
    p_country,
    p_location,
    -- Notfallkontakt
    p_emergency_contact_name,
    p_emergency_contact_phone,
    p_emergency_contact_relation,
    -- Arbeitszeiten
    COALESCE(p_working_hours, 40),
    COALESCE(p_vacation_days, 30),
    p_work_start_time,
    p_work_end_time,
    p_lunch_break_start,
    p_lunch_break_end,
    -- Gehalt
    p_salary_amount,
    COALESCE(p_salary_currency, 'EUR'),
    -- Steuer & Sozialversicherung
    p_tax_id,
    p_tax_class,
    p_social_security_number,
    p_health_insurance,
    -- Bank
    p_bank_name,
    p_bank_code,
    p_bank_account_number,
    p_iban,
    p_bic,
    -- Organisation
    p_cost_center,
    p_manager_id,
    p_contract_end_date,
    -- Standard-Felder
    'active',
    'employee'
  )
  RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$$;