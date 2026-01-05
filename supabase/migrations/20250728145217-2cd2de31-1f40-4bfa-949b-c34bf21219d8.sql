-- Kritisches Problem: Tasks und Projekte ohne company_id sind für alle sichtbar
-- Das führt zur Datenleckage zwischen Firmen

-- 1. Task Company Isolation korrigieren - NULL company_id nur für superadmin erlauben
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON public.tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON public.tasks FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur ihre eigenen Daten oder Firma-spezifische Daten
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (created_by = auth.uid()) OR 
    (auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])))))
);

DROP POLICY IF EXISTS "Task Company Isolation - INSERT" ON public.tasks;  
CREATE POLICY "Task Company Isolation - INSERT" 
ON public.tasks FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur mit ihrer company_id oder als Owner
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (created_by = auth.uid())))
);

-- 2. Project Company Isolation korrigieren
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON public.projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON public.projects FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur ihre eigenen Daten oder Firma-spezifische Daten
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (owner_id = auth.uid()) OR 
    (auth.uid() = ANY (team_members))))
);

DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON public.projects;
CREATE POLICY "Project Company Isolation - INSERT" 
ON public.projects FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur mit ihrer company_id oder als Owner
  (NOT is_in_tenant_context() AND 
   ((company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL) OR 
    (owner_id = auth.uid())))
);

-- 3. Helper-Funktion um company_id zu bekommen
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