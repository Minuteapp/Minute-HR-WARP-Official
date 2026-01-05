-- =====================================================
-- KRITISCHE DATA-ISOLATION FÜR FIRMEN-TRENNUNG
-- =====================================================

-- 1. Zuerst alle gefährlichen "ALL ACCESS" Policies entfernen
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON calendar_events;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON employees;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON tasks;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON projects;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON user_roles;

-- 2. Sicherstellen, dass wichtige Tabellen company_id haben
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id UUID;

-- 3. Company-spezifische RLS für calendar_events
DROP POLICY IF EXISTS "Users can view all calendar events" ON calendar_events;
CREATE POLICY "Company isolation for calendar_events_select" 
ON calendar_events FOR SELECT 
USING (
  company_id IS NULL OR -- Für Superadmin-Events ohne company_id
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
  ) OR
  is_superadmin(auth.uid()) OR
  created_by = auth.uid()
);

CREATE POLICY "Company isolation for calendar_events_insert" 
ON calendar_events FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND (
    company_id IS NULL OR -- Nur für Superadmins
    company_id IN (
      SELECT ur.company_id 
      FROM user_roles ur 
      WHERE ur.user_id = auth.uid()
    )
  )
);

-- 4. Company-spezifische RLS für employees
DROP POLICY IF EXISTS "Allow read access to everyone" ON employees;
DROP POLICY IF EXISTS "Benutzer können alle Mitarbeiter sehen" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "employees_select_policy" ON employees;
DROP POLICY IF EXISTS "allow_select_employees" ON employees;

CREATE POLICY "Company isolation for employees_select" 
ON employees FOR SELECT 
USING (
  company_id IS NULL AND is_superadmin(auth.uid()) OR -- Superadmin sieht alle
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ) OR
  email IN (
    SELECT au.email 
    FROM auth.users au 
    WHERE au.id = auth.uid()
  ) -- User kann sein eigenes Profil sehen
);

-- 5. Company-spezifische RLS für tasks
DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
CREATE POLICY "Company isolation for tasks_select" 
ON tasks FOR SELECT 
USING (
  company_id IS NULL AND is_superadmin(auth.uid()) OR -- Superadmin sieht alle
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ) OR
  created_by = auth.uid() OR
  auth.uid() = ANY(assigned_to)
);

CREATE POLICY "Company isolation for tasks_insert" 
ON tasks FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND (
    company_id IS NULL AND is_superadmin(auth.uid()) OR
    company_id IN (
      SELECT ur.company_id 
      FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
    )
  )
);

-- 6. Company-spezifische RLS für projects
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
CREATE POLICY "Company isolation for projects_select" 
ON projects FOR SELECT 
USING (
  company_id IS NULL AND is_superadmin(auth.uid()) OR -- Superadmin sieht alle
  company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ) OR
  owner_id = auth.uid() OR
  auth.uid() = ANY(team_members)
);

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
  p_status text DEFAULT 'active',
  p_onboarding_required boolean DEFAULT false,
  p_company_id uuid
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