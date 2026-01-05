-- Verbesserte get_effective_company_id Funktion
-- Berücksichtigt: user_roles, employees, admin_invitations, user_tenant_sessions, impersonation_sessions

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Hole aktuelle User-ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 1. HÖCHSTE PRIORITÄT: Aktive Impersonation-Session
  SELECT target_tenant_id INTO v_company_id
  FROM public.impersonation_sessions
  WHERE superadmin_id = v_user_id
    AND status = 'active'
  LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- 2. PRIORITÄT: Aktive Tenant-Session (manueller Tunnel)
  SELECT tenant_company_id INTO v_company_id
  FROM public.user_tenant_sessions
  WHERE user_id = v_user_id
    AND is_tenant_mode = true
  LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- 3. PRIORITÄT: User-Role mit company_id
  SELECT company_id INTO v_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
    AND company_id IS NOT NULL
    AND role != 'superadmin'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- 4. PRIORITÄT: Employees-Eintrag
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE user_id = v_user_id
    AND company_id IS NOT NULL
  LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- 5. PRIORITÄT: Admin-Invitation (akzeptiert)
  SELECT company_id INTO v_company_id
  FROM public.admin_invitations
  WHERE email = (SELECT email FROM auth.users WHERE id = v_user_id)
    AND status = 'accepted'
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$;

-- Füge Kommentar hinzu
COMMENT ON FUNCTION public.get_effective_company_id() IS 
'Ermittelt die effektive company_id für RLS-Policies. Prüft in Reihenfolge: 
1. Aktive Impersonation-Session
2. Aktive Tenant-Session
3. User-Role mit company_id
4. Employees-Eintrag
5. Admin-Invitation (akzeptiert)';