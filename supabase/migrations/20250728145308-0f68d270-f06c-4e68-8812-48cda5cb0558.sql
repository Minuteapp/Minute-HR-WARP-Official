-- Kritisches Problem beheben: Datenisolierung zwischen Firmen funktioniert nicht
-- Neue Firmen erhalten alle Daten der bestehenden Firma

-- 1. Bestehende get_user_company_id Funktion löschen und neu erstellen
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_id UUID;
BEGIN
  SELECT ur.company_id
  INTO company_id
  FROM public.user_roles ur
  WHERE ur.user_id = $1
  LIMIT 1;
  
  RETURN company_id;
END;
$$;

-- 2. RLS-Policies für Tasks korrigieren - NULL company_id verhindern 
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON public.tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON public.tasks FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur ihre eigenen Daten oder Firma-spezifische Daten (NO NULL COMPANY_ID!)
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (created_by = auth.uid() AND company_id IS NOT NULL) OR 
    (auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])) AND company_id IS NOT NULL)))
);

DROP POLICY IF EXISTS "Task Company Isolation - INSERT" ON public.tasks;  
CREATE POLICY "Task Company Isolation - INSERT" 
ON public.tasks FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: company_id MUSS gesetzt sein und ihrer Firma entsprechen
  (NOT is_in_tenant_context() AND 
   company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- 3. RLS-Policies für Projects korrigieren - NULL company_id verhindern
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON public.projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON public.projects FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur ihre eigenen Daten oder Firma-spezifische Daten (NO NULL COMPANY_ID!)
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (owner_id = auth.uid() AND company_id IS NOT NULL) OR 
    (auth.uid() = ANY (team_members) AND company_id IS NOT NULL)))
);

DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON public.projects;
CREATE POLICY "Project Company Isolation - INSERT" 
ON public.projects FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: company_id MUSS gesetzt sein und ihrer Firma entsprechen
  (NOT is_in_tenant_context() AND 
   company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);