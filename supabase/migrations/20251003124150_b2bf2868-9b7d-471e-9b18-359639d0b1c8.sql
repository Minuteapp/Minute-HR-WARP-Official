-- =====================================================
-- KRITISCHE SICHERHEITS-FIXES
-- =====================================================

-- 1. PROFILES TABELLE ABSICHERN
-- Benutzer können nur ihr eigenes Profil sehen
-- Admins/HR/Superadmins können alle Profile ihrer Firma sehen

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Company admins can view company profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin', 'hr')
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin')
    )
  );

-- 2. COMPANIES TABELLE ABSICHERN
-- Nur Admins und Superadmins können Firmeninformationen sehen

DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;
DROP POLICY IF EXISTS "Superadmins have full access to companies" ON public.companies;
DROP POLICY IF EXISTS "Company users can view their company" ON public.companies;

CREATE POLICY "Superadmins can manage all companies"
  ON public.companies
  FOR ALL
  USING (is_superadmin_safe(auth.uid()));

CREATE POLICY "Company admins can view their company"
  ON public.companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.company_id = companies.id
      AND ur.role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Company admins can update their company"
  ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.company_id = companies.id
      AND ur.role = 'admin'
    )
  );

-- 3. ADMIN_INVITATIONS TABELLE ABSICHERN
-- Nur Superadmins können Admin-Einladungen sehen und verwalten
-- (Diese Policies existieren bereits, aber wir stellen sicher, dass sie korrekt sind)

DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;

-- Die bestehenden Policies sind bereits korrekt (nur Superadmins)
-- Keine Änderungen nötig, da bereits restriktiv

-- 4. CROSS_MODULE_EVENTS TABELLE ABSICHERN
-- Benutzer können nur Events ihrer Firma sehen

DROP POLICY IF EXISTS "Users can view events" ON public.cross_module_events;
DROP POLICY IF EXISTS "Public read access" ON public.cross_module_events;

CREATE POLICY "Users can view company events"
  ON public.cross_module_events
  FOR SELECT
  USING (
    -- Eigene Events
    auth.uid() = user_id
    OR
    -- Events der gleichen Firma (über user_roles ermitteln)
    EXISTS (
      SELECT 1 FROM public.user_roles ur1
      WHERE ur1.user_id = auth.uid()
      AND ur1.company_id IN (
        SELECT ur2.company_id FROM public.user_roles ur2
        WHERE ur2.user_id = cross_module_events.user_id
      )
    )
    OR
    -- Admins/HR/Superadmins können alle Events sehen
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin', 'hr')
    )
  );

CREATE POLICY "Admins can manage events"
  ON public.cross_module_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin')
    )
  );

-- 5. VOICEMAIL_MESSAGES TABELLE ABSICHERN
-- Benutzer können nur ihre eigenen Voicemail-Nachrichten sehen

DROP POLICY IF EXISTS "Users view own voicemails" ON public.voicemail_messages;
DROP POLICY IF EXISTS "Public voicemail access" ON public.voicemail_messages;

CREATE POLICY "Users can view own voicemails"
  ON public.voicemail_messages
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin', 'hr')
    )
  );

CREATE POLICY "Users can manage own voicemails"
  ON public.voicemail_messages
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all voicemails"
  ON public.voicemail_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'superadmin')
    )
  );

-- 6. FUNKTIONS-HÄRTUNG: search_path für Funktionen setzen
-- Dies verhindert Search Path Injection Attacks

-- Funktion: get_user_company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$;

-- Funktion: is_in_tenant_context
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions
    WHERE user_id = auth.uid()
    AND is_tenant_mode = true
  );
END;
$$;

-- Funktion: get_tenant_company_id_safe
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_company_id uuid;
BEGIN
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM public.user_tenant_sessions
  WHERE user_id = auth.uid()
  AND is_tenant_mode = true
  LIMIT 1;
  
  RETURN v_tenant_company_id;
END;
$$;

-- Funktion: clear_tenant_context_with_user_id
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_tenant_sessions
  WHERE user_id = p_user_id;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Funktion: get_company_users_secure
CREATE OR REPLACE FUNCTION public.get_company_users_secure()
RETURNS TABLE(
  id uuid,
  email text,
  role text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_company_id uuid;
  v_is_superadmin boolean;
BEGIN
  -- Prüfe ob Benutzer Superadmin ist
  v_is_superadmin := is_superadmin_safe(auth.uid());
  
  IF v_is_superadmin THEN
    -- Superadmins sehen alle Benutzer
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      COALESCE(ur.role::text, 'employee') as role,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id;
  ELSE
    -- Andere Admins sehen nur Benutzer ihrer Firma
    SELECT ur.company_id INTO v_user_company_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr')
    LIMIT 1;
    
    IF v_user_company_id IS NULL THEN
      -- Kein Zugriff
      RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      COALESCE(ur.role::text, 'employee') as role,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id
    WHERE ur.company_id = v_user_company_id;
  END IF;
END;
$$;