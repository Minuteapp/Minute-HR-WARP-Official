-- SICHERHEITSREPARATUR TEIL 15: Finale kritische Funktionen härten  
-- Batch 5: Verbleibende search_path Funktionen

-- Härtung aller verbleibenden Funktionen ohne SET search_path = public
-- Diese Funktion repariert die letzten kritischen Sicherheitslücken

-- get_effective_time_rules bereits vorhanden - zusätzliche Härtung
CREATE OR REPLACE FUNCTION public.get_effective_time_rules(p_user_id uuid, p_date date DEFAULT (now())::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_company uuid;
  v_dept text;
  v_team text;
  v_country text;
  v_rules jsonb := '{}'::jsonb;
  v_company_overrides jsonb := '{}'::jsonb;
  v_travel_params jsonb := '{}'::jsonb;
  v_sources text[] := ARRAY[]::text[];
  cr RECORD;
  rec RECORD;
BEGIN
  -- Identify employee and company
  SELECT company_id, department, team INTO v_company, v_dept, v_team
  FROM employees WHERE id = p_user_id LIMIT 1;
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'Kein Mitarbeiter mit ID % gefunden', p_user_id;
  END IF;

  -- Authorization: same user, same company, or admin/hr/superadmin
  IF NOT (
    auth.uid() = p_user_id
    OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.company_id = v_company)
  ) THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'date', p_date,
    'country_code', COALESCE(v_country, 'DE'),
    'rules', v_rules,
    'sources', v_sources
  );
END;
$function$;

-- create_employee_without_company_id Funktion reparieren
CREATE OR REPLACE FUNCTION public.create_employee_without_company_id(p_name text, p_first_name text, p_last_name text, p_email text, p_employee_number text, p_department text, p_position text, p_team text, p_employment_type text, p_start_date date, p_onboarding_required boolean)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_employee_id uuid;
BEGIN
  INSERT INTO employees (
    name, status, first_name, last_name, email,
    employee_number, department, position, team,
    employment_type, start_date, onboarding_required
  ) VALUES (
    p_name, 'active', p_first_name, p_last_name, p_email,
    p_employee_number, p_department, p_position, p_team,
    p_employment_type::employment_type, p_start_date, p_onboarding_required
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$function$;