-- Entferne rekursive Tenant-Policies auf user_tenant_sessions
DROP POLICY IF EXISTS "tenant_user_tenant_sessions_select" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "tenant_user_tenant_sessions_insert" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "tenant_user_tenant_sessions_update" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "tenant_user_tenant_sessions_delete" ON public.user_tenant_sessions;

-- Entferne auch die superadmin Policies (werden neu angelegt)
DROP POLICY IF EXISTS "superadmin_read_own_tenant_session" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "superadmin_update_own_tenant_session" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "superadmin_insert_own_tenant_session" ON public.user_tenant_sessions;

-- Neue einfache "own row" Policies (nicht rekursiv!)
CREATE POLICY "user_tenant_sessions_select_own"
ON public.user_tenant_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "user_tenant_sessions_insert_own"
ON public.user_tenant_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_tenant_sessions_update_own"
ON public.user_tenant_sessions
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "user_tenant_sessions_delete_own"
ON public.user_tenant_sessions
FOR DELETE
USING (user_id = auth.uid());