-- RLS für die 3 Tabellen ohne Row Level Security

-- 1. company_role_permissions
ALTER TABLE public.company_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view company_role_permissions" 
ON public.company_role_permissions FOR SELECT TO authenticated USING (true);

-- 2. permission_change_log
ALTER TABLE public.permission_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view permission_change_log" 
ON public.permission_change_log FOR SELECT TO authenticated USING (true);

-- 3. user_tenant_sessions
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tenant sessions" 
ON public.user_tenant_sessions FOR SELECT TO authenticated 
USING (user_id = auth.uid());