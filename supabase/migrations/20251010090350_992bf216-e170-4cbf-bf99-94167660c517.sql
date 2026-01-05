-- KRITISCHE SICHERHEITS-MIGRATION: Tenant-Isolation für Multi-Tenant-System
-- Diese Migration stellt sicher, dass Superadmins im Tenant-Modus NUR Daten der Tenant-Firma sehen

-- 1. Erstelle Hilfsfunktionen für Tenant-Kontext
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT tenant_company_id 
    FROM user_tenant_sessions 
    WHERE user_id = auth.uid() 
    AND is_tenant_mode = true
    ORDER BY updated_at DESC
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_tenant_sessions 
    WHERE user_id = auth.uid() 
    AND is_tenant_mode = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant_company_id uuid;
  v_user_company_id uuid;
BEGIN
  -- Prüfe zuerst ob User im Tenant-Modus ist
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM user_tenant_sessions
  WHERE user_id = auth.uid() AND is_tenant_mode = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- Wenn im Tenant-Modus, gib Tenant Company ID zurück
  IF v_tenant_company_id IS NOT NULL THEN
    RETURN v_tenant_company_id;
  END IF;
  
  -- Sonst gib die Company ID des Users zurück
  SELECT company_id INTO v_user_company_id
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_user_company_id;
END;
$$;

-- 2. Aktualisiere RLS Policies für companies Tabelle
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Superadmins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Users view own or tenant company" ON public.companies;

CREATE POLICY "Users view own or tenant company"
ON public.companies FOR SELECT
USING (
  id = get_effective_company_id()
  OR 
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
);

-- 3. Aktualisiere RLS Policies für employees Tabelle (hat company_id)
DROP POLICY IF EXISTS "Employees view policy" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees in their company" ON public.employees;
DROP POLICY IF EXISTS "Users view employees in effective company" ON public.employees;
DROP POLICY IF EXISTS "Users manage employees in effective company" ON public.employees;

CREATE POLICY "Users view employees in effective company"
ON public.employees FOR SELECT
USING (
  company_id = get_effective_company_id()
  OR
  id = auth.uid()
  OR
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
);

CREATE POLICY "Admins manage employees in effective company"
ON public.employees FOR ALL
USING (
  company_id = get_effective_company_id()
  OR
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
);

-- 4. Aktualisiere RLS Policies für absence_requests (hat KEINE company_id, nur user_id)
DROP POLICY IF EXISTS "Admins and HR can manage all absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can view their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users view own absence requests or company requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Admins manage absence requests in effective company" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can create their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update their own absence requests" ON public.absence_requests;

-- User kann eigene Anfragen sehen
CREATE POLICY "Users view own absence requests"
ON public.absence_requests FOR SELECT
USING (user_id = auth.uid());

-- User kann eigene Anfragen erstellen
CREATE POLICY "Users create own absence requests"
ON public.absence_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

-- User kann eigene Anfragen aktualisieren
CREATE POLICY "Users update own absence requests"
ON public.absence_requests FOR UPDATE
USING (user_id = auth.uid());

-- Admins können Anfragen in ihrer effektiven Firma verwalten
CREATE POLICY "Admins view absence requests in effective company"
ON public.absence_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = absence_requests.user_id
    AND e.company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr', 'superadmin')
    )
  )
);

CREATE POLICY "Admins manage absence requests in effective company"
ON public.absence_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = absence_requests.user_id
    AND e.company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr', 'superadmin')
    )
  )
);

-- Kommentar zur Migration
COMMENT ON FUNCTION public.get_effective_company_id() IS 
'Gibt die aktive Company ID zurück: Tenant Company wenn im Tenant-Modus, sonst User Company. KRITISCH für Multi-Tenant-Isolation.';