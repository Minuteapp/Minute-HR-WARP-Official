-- Fix: Superadmin ohne Tunnel-Session soll eigene Firma sehen können

-- 1. can_access_tenant() anpassen: Superadmin ohne Tunnel darf auf eigene Firma zugreifen
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_super_admin boolean;
  v_current_tenant uuid;
  v_user_company_id uuid;
BEGIN
  IF p_company_id IS NULL THEN
    RETURN false;
  END IF;

  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  v_is_super_admin := public.is_superadmin(v_user_id);
  v_current_tenant := public.current_tenant_id();

  -- Superadmin MIT aktivem Tenant-Context: nur diese Firma
  IF v_is_super_admin = true AND v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Superadmin OHNE Tenant-Context: eigene Firma aus user_roles erlauben
  IF v_is_super_admin = true AND v_current_tenant IS NULL THEN
    SELECT company_id INTO v_user_company_id
    FROM public.user_roles
    WHERE user_id = v_user_id AND company_id IS NOT NULL
    LIMIT 1;
    
    -- Eigene Firma erlauben, andere blockieren
    RETURN p_company_id = v_user_company_id;
  END IF;

  -- Normaler User: nur eigene Firma
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;

-- 2. current_tenant_id() anpassen: Superadmin ohne Session bekommt eigene Firma als Default
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
  v_is_super_admin boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check for active tenant session first
  SELECT impersonated_company_id INTO v_tenant_id
  FROM public.active_tenant_sessions
  WHERE session_user_id = v_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Check if superadmin
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Superadmin OHNE aktive Session: Eigene Firma als Default
  IF v_is_super_admin = true THEN
    SELECT company_id INTO v_tenant_id 
    FROM public.user_roles 
    WHERE user_id = v_user_id AND company_id IS NOT NULL
    LIMIT 1;
    RETURN v_tenant_id;
  END IF;

  -- For non-superadmin users, return their company_id from user_roles
  SELECT company_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN v_tenant_id;
END;
$$;

-- 3. get_effective_company_id() anpassen für Konsistenz
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_is_super_admin boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- First check for active tenant session
  SELECT impersonated_company_id INTO v_company_id
  FROM public.active_tenant_sessions
  WHERE session_user_id = v_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- Check if superadmin
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Superadmin ohne Session: eigene Firma als Default
  IF v_is_super_admin = true THEN
    SELECT company_id INTO v_company_id 
    FROM public.user_roles 
    WHERE user_id = v_user_id AND company_id IS NOT NULL
    LIMIT 1;
    RETURN v_company_id;
  END IF;

  -- For regular users, get their company from user_roles
  SELECT company_id INTO v_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN v_company_id;
END;
$$;

-- 4. Superadmin company_id setzen (Minute Labs GmbH als Standardfirma)
UPDATE public.user_roles 
SET company_id = 'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44'
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' 
  AND role = 'superadmin'
  AND company_id IS NULL;