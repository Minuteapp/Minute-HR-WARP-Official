-- =====================================================
-- FIX: RLS Policies für employees anpassen
-- Superadmins können ALLE Firmen sehen (für Admin-Panel)
-- =====================================================

-- 1. Bestehende Policies löschen
DROP POLICY IF EXISTS employees_select_policy ON public.employees;
DROP POLICY IF EXISTS employees_insert_policy ON public.employees;
DROP POLICY IF EXISTS employees_update_policy ON public.employees;
DROP POLICY IF EXISTS employees_delete_policy ON public.employees;

-- 2. Neue Policies erstellen - Superadmins haben vollen Zugriff

-- SELECT: Eigene Firma ODER Superadmin
CREATE POLICY employees_select_policy ON public.employees
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- INSERT: Eigene Firma ODER Superadmin
CREATE POLICY employees_insert_policy ON public.employees
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- UPDATE: Eigene Firma ODER Superadmin
CREATE POLICY employees_update_policy ON public.employees
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- DELETE: Eigene Firma ODER Superadmin
CREATE POLICY employees_delete_policy ON public.employees
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- =====================================================
-- FIX: RLS Policies für admin_invitations anpassen
-- =====================================================

DROP POLICY IF EXISTS admin_invitations_select_policy ON public.admin_invitations;
DROP POLICY IF EXISTS admin_invitations_insert_policy ON public.admin_invitations;
DROP POLICY IF EXISTS admin_invitations_update_policy ON public.admin_invitations;
DROP POLICY IF EXISTS admin_invitations_delete_policy ON public.admin_invitations;

-- SELECT: Eigene Firma ODER Superadmin
CREATE POLICY admin_invitations_select_policy ON public.admin_invitations
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- INSERT: Eigene Firma ODER Superadmin
CREATE POLICY admin_invitations_insert_policy ON public.admin_invitations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- UPDATE: Eigene Firma ODER Superadmin
CREATE POLICY admin_invitations_update_policy ON public.admin_invitations
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- DELETE: Eigene Firma ODER Superadmin
CREATE POLICY admin_invitations_delete_policy ON public.admin_invitations
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- =====================================================
-- FIX: RLS Policies für user_roles anpassen
-- =====================================================

DROP POLICY IF EXISTS user_roles_select_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_update_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete_policy ON public.user_roles;

-- SELECT: Eigene Firma ODER Superadmin
CREATE POLICY user_roles_select_policy ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- INSERT: Eigene Firma ODER Superadmin
CREATE POLICY user_roles_insert_policy ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- UPDATE: Eigene Firma ODER Superadmin
CREATE POLICY user_roles_update_policy ON public.user_roles
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );

-- DELETE: Eigene Firma ODER Superadmin
CREATE POLICY user_roles_delete_policy ON public.user_roles
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      company_id = get_effective_company_id()
      OR is_superadmin_safe(auth.uid())
    )
  );