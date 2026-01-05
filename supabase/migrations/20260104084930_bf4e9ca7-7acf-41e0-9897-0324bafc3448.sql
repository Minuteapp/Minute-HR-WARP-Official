-- Drop existing INSERT policy
DROP POLICY IF EXISTS "tenant_role_permission_matrix_insert" ON public.role_permission_matrix;

-- Create new INSERT policy that allows:
-- 1. Superadmins to insert global entries (company_id IS NULL)
-- 2. Authenticated users to insert tenant-specific entries via can_write_tenant
CREATE POLICY "tenant_role_permission_matrix_insert" 
ON public.role_permission_matrix 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (company_id IS NULL AND public.is_superadmin(auth.uid()))
  OR 
  (company_id IS NOT NULL AND can_write_tenant(company_id))
);

-- Also update UPDATE policy for consistency
DROP POLICY IF EXISTS "tenant_role_permission_matrix_update" ON public.role_permission_matrix;

CREATE POLICY "tenant_role_permission_matrix_update" 
ON public.role_permission_matrix 
FOR UPDATE 
TO authenticated 
USING (
  (company_id IS NULL AND public.is_superadmin(auth.uid()))
  OR 
  (company_id IS NOT NULL AND can_write_tenant(company_id))
);

-- Also update DELETE policy for consistency
DROP POLICY IF EXISTS "tenant_role_permission_matrix_delete" ON public.role_permission_matrix;

CREATE POLICY "tenant_role_permission_matrix_delete" 
ON public.role_permission_matrix 
FOR DELETE 
TO authenticated 
USING (
  (company_id IS NULL AND public.is_superadmin(auth.uid()))
  OR 
  (company_id IS NOT NULL AND can_write_tenant(company_id))
);