-- =============================================
-- SUPERADMIN ACCESS: Helper Function + RLS Policies
-- =============================================

-- 1. Sichere Helper-Funktion: is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- 2. Erweiterte RLS-Policy für employees (Superadmin kann ALLE sehen)
DROP POLICY IF EXISTS "superadmin_view_all_employees" ON employees;
CREATE POLICY "superadmin_view_all_employees" ON employees
FOR SELECT USING (
  company_id = get_effective_company_id()
  OR is_superadmin()
);

-- 3. Erweiterte RLS-Policy für user_roles (Superadmin kann ALLE sehen)
DROP POLICY IF EXISTS "superadmin_view_all_user_roles" ON user_roles;
CREATE POLICY "superadmin_view_all_user_roles" ON user_roles
FOR SELECT USING (
  company_id = get_effective_company_id()
  OR user_id = auth.uid()
  OR is_superadmin()
);

-- 4. Erweiterte RLS-Policy für profiles (Superadmin kann ALLE sehen)
DROP POLICY IF EXISTS "superadmin_view_all_profiles" ON profiles;
CREATE POLICY "superadmin_view_all_profiles" ON profiles
FOR SELECT USING (
  id = auth.uid()
  OR is_superadmin()
);

-- 5. Erweiterte RLS-Policy für admin_invitations (Superadmin kann ALLE sehen)
DROP POLICY IF EXISTS "superadmin_view_all_admin_invitations" ON admin_invitations;
CREATE POLICY "superadmin_view_all_admin_invitations" ON admin_invitations
FOR SELECT USING (
  is_superadmin()
);

-- 6. Erweiterte RLS-Policy für companies (Superadmin kann ALLE sehen)
DROP POLICY IF EXISTS "superadmin_view_all_companies" ON companies;
CREATE POLICY "superadmin_view_all_companies" ON companies
FOR SELECT USING (
  id = get_effective_company_id()
  OR is_superadmin()
);

-- 7. Superadmin kann companies auch updaten (für Support-Transparency etc.)
DROP POLICY IF EXISTS "superadmin_update_companies" ON companies;
CREATE POLICY "superadmin_update_companies" ON companies
FOR UPDATE USING (
  id = get_effective_company_id()
  OR is_superadmin()
);

-- 8. Erweiterte RLS-Policy für impersonation_sessions
DROP POLICY IF EXISTS "superadmin_manage_impersonation_sessions" ON impersonation_sessions;
CREATE POLICY "superadmin_manage_impersonation_sessions" ON impersonation_sessions
FOR ALL USING (
  superadmin_id = auth.uid()
  OR is_superadmin()
);

-- 9. Erweiterte RLS-Policy für impersonation_audit_logs
DROP POLICY IF EXISTS "superadmin_view_impersonation_audit_logs" ON impersonation_audit_logs;
CREATE POLICY "superadmin_view_impersonation_audit_logs" ON impersonation_audit_logs
FOR SELECT USING (
  performed_by_superadmin_id = auth.uid()
  OR is_superadmin()
);

-- 10. is_test_user Spalte für employees (falls nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'is_test_user'
  ) THEN
    ALTER TABLE employees ADD COLUMN is_test_user boolean DEFAULT false;
  END IF;
END $$;

-- 11. is_test_user Spalte für profiles (falls nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_test_user'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_test_user boolean DEFAULT false;
  END IF;
END $$;

-- 12. created_by_superadmin Spalte für employees (Audit-Trail)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'created_by_superadmin'
  ) THEN
    ALTER TABLE employees ADD COLUMN created_by_superadmin uuid REFERENCES auth.users(id);
  END IF;
END $$;