-- Fix RLS for role_permission_matrix so global rows (company_id IS NULL) are readable
-- The table has UNIQUE(role, module_name), so it is designed to be global.
-- Existing SELECT policy required can_access_tenant(company_id), which hides all global rows.

BEGIN;

DROP POLICY IF EXISTS tenant_role_permission_matrix_select ON public.role_permission_matrix;

CREATE POLICY tenant_role_permission_matrix_select
ON public.role_permission_matrix
FOR SELECT
TO authenticated
USING (
  company_id IS NULL
  OR can_access_tenant(company_id)
);

COMMIT;