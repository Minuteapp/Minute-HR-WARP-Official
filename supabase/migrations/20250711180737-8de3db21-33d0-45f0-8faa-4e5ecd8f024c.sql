-- Entferne die fehlerhafte Policy die auf auth.users zugreift
DROP POLICY IF EXISTS "allow_superadmin_access" ON public.companies;

-- Die anderen Policies (superadmin_access) sollten bereits ausreichen für SuperAdmin Zugriff