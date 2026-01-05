
-- CRITICAL FIX: Allow SECURITY DEFINER functions to read tenant sessions
-- Problem: get_effective_company_id() kann user_tenant_sessions nicht lesen
-- weil RLS nur user_id = auth.uid() erlaubt, aber in SECURITY DEFINER Kontext
-- ist auth.uid() nicht verfügbar

-- Erstelle neue Policy für SECURITY DEFINER Zugriff
CREATE POLICY "Allow SECURITY DEFINER functions to read sessions" 
ON public.user_tenant_sessions 
FOR SELECT 
USING (
  -- Erlaube Zugriff wenn die aufrufende Funktion SECURITY DEFINER ist
  -- Dies ist sicher, weil SECURITY DEFINER Funktionen nur von admins erstellt werden können
  current_setting('role', true) = 'postgres' 
  OR user_id = auth.uid()
);

-- Lösche alte redundante Policies (es gibt 3 identische!)
DROP POLICY IF EXISTS "Users can manage their own tenant session" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "Users can manage their own tenant sessions" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "Users manage own tenant sessions" ON public.user_tenant_sessions;

-- Erstelle EINE saubere Policy für normale User
CREATE POLICY "Users manage own sessions" 
ON public.user_tenant_sessions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
