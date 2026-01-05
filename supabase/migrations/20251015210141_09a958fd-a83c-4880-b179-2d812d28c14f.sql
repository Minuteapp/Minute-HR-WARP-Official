-- Schritt 1: RLS-Policy für Superadmins erweitern
DROP POLICY IF EXISTS "Employees - Company Isolation" ON employees;

CREATE POLICY "Employees - Company Isolation"
ON employees
FOR ALL
USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
)
WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- Schritt 2: get_effective_company_id() Funktion anpassen
CREATE OR REPLACE FUNCTION get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant_company_id uuid;
  v_user_company_id uuid;
  v_is_superadmin boolean;
BEGIN
  -- Prüfe ob Superadmin
  v_is_superadmin := is_superadmin_safe(auth.uid());
  
  -- Wenn im Tenant-Modus: Return tenant_company_id
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM user_tenant_sessions
  WHERE user_id = auth.uid() AND is_tenant_mode = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  IF v_tenant_company_id IS NOT NULL THEN
    RETURN v_tenant_company_id;
  END IF;
  
  -- Für Superadmins OHNE Tenant-Modus: NULL zurückgeben
  -- (damit RLS-Policy mit is_superadmin_safe greift)
  IF v_is_superadmin THEN
    RETURN NULL;
  END IF;
  
  -- Für normale Benutzer: company_id aus user_roles
  SELECT company_id INTO v_user_company_id
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_user_company_id;
END;
$$;

-- Schritt 5: RPC-Funktion create_employee_without_company_id anpassen
CREATE OR REPLACE FUNCTION create_employee_without_company_id(
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
  p_onboarding_required boolean DEFAULT false,
  p_company_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_id uuid;
  v_company_id uuid;
  v_status text;
BEGIN
  -- Wenn company_id explizit übergeben wurde, verwenden
  IF p_company_id IS NOT NULL THEN
    v_company_id := p_company_id;
  ELSE
    -- Sonst aus Context holen
    v_company_id := get_effective_company_id();
  END IF;
  
  -- Wenn immer noch NULL → Fehler
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Mitarbeiter kann nicht erstellt werden: Keine company_id verfügbar. Bitte wählen Sie eine Firma aus.';
  END IF;
  
  -- Status basierend auf Startdatum setzen
  IF p_start_date IS NOT NULL AND p_start_date > CURRENT_DATE THEN
    v_status := 'inactive';
  ELSE
    v_status := 'active';
  END IF;
  
  -- Mitarbeiter mit EXPLIZITER company_id erstellen
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
    onboarding_required
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
    p_employment_type::employment_type,
    p_start_date,
    v_status,
    p_onboarding_required
  ) RETURNING id INTO v_employee_id;
  
  RAISE NOTICE 'Mitarbeiter erfolgreich erstellt: ID=%, company_id=%', v_employee_id, v_company_id;
  
  RETURN v_employee_id;
END;
$$;