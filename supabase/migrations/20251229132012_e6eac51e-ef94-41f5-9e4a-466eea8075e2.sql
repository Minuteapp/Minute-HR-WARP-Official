
-- =====================================================
-- PHASE 4 SCHRITT 2: RLS POLICIES + FUNKTIONEN
-- =====================================================

-- Policies für active_tenant_sessions
CREATE POLICY "Superadmins can manage sessions" ON public.active_tenant_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Users can view own sessions" ON public.active_tenant_sessions
  FOR SELECT USING (session_user_id = auth.uid());

-- Zentrale RLS-Hilfsfunktionen
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
    OR
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
    )
    OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND company_id = p_company_id)
    OR
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND company_id = p_company_id)
$$;

CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
      AND NOT EXISTS (
        SELECT 1 FROM active_tenant_sessions 
        WHERE session_user_id = auth.uid() AND is_active = true
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
        AND can_write = true
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
        AND company_id = p_company_id 
        AND role IN ('admin', 'hr_manager', 'manager')
    )
$$;

CREATE OR REPLACE FUNCTION public.can_access_user_data(p_company_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p_user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM employees WHERE id = p_user_id AND user_id = auth.uid())
    OR
    public.can_write_tenant(p_company_id)
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT impersonated_company_id FROM active_tenant_sessions 
     WHERE session_user_id = auth.uid() AND is_active = true 
     LIMIT 1),
    (SELECT company_id FROM user_roles 
     WHERE user_id = auth.uid() AND company_id IS NOT NULL
     ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END
     LIMIT 1),
    (SELECT company_id FROM employees 
     WHERE user_id = auth.uid() AND company_id IS NOT NULL 
     LIMIT 1)
  )
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.can_access_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_user_data(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
