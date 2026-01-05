-- SCHRITT 1: RPC-Funktion create_employee_without_company_id reparieren
-- Diese Funktion muss EXPLIZIT die company_id aus get_effective_company_id() holen

DROP FUNCTION IF EXISTS public.create_employee_without_company_id(text, text, text, text, text, text, text, text, text, date, boolean);

CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(
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
  p_onboarding_required boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_id uuid;
  v_company_id uuid;
  v_status text;
BEGIN
  -- KRITISCH: company_id EXPLIZIT aus Tenant-Context holen
  v_company_id := get_effective_company_id();
  
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
  
  -- Mitarbeiter mit EXPLIZITER company_id erstellen
  INSERT INTO public.employees (
    company_id,  -- EXPLIZIT setzen!
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
    onboarding_required
  ) VALUES (
    v_company_id,  -- EXPLIZIT aus Tenant-Context
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
    v_status,
    p_onboarding_required
  ) RETURNING id INTO v_employee_id;
  
  RAISE NOTICE 'Mitarbeiter erfolgreich erstellt: ID=%, company_id=%', v_employee_id, v_company_id;
  
  RETURN v_employee_id;
END;
$$;