-- Verbesserte RLS-Policies, die Tenant-Kontext berücksichtigen
-- Wenn wir im Tenant-Modus sind, sollten auch Super-Admins nur die Company-Daten sehen

-- Erstelle eine Funktion um zu prüfen ob wir im "echten" Super-Admin-Modus sind
-- Diese Funktion kann später erweitert werden um Session-Context zu berücksichtigen
CREATE OR REPLACE FUNCTION public.is_in_superadmin_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Für jetzt: Superadmin Context nur wenn user KEIN company_id hat
  -- Das bedeutet: Super-Admins mit company_id sind im Tenant-Modus
  RETURN is_superadmin(auth.uid()) AND get_user_company_id(auth.uid()) IS NULL;
END;
$$;

-- Verbesserte Employee Policy
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON employees;
CREATE POLICY "Employee Company Isolation - SELECT" 
ON employees FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Verbesserte Task Policy
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON tasks FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Verbesserte Project Policy
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON projects FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Verbesserte Goal Policy
DROP POLICY IF EXISTS "Goal Company Isolation - SELECT" ON goals;
CREATE POLICY "Goal Company Isolation - SELECT" 
ON goals FOR SELECT 
USING (
  -- ECHTER Super-Admin-Kontext: sieht alle
  is_in_superadmin_context() OR
  -- Tenant-Modus: NUR Company-spezifische Daten
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);