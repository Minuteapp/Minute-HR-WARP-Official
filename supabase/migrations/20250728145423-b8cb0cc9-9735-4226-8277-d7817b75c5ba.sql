-- KERNPROBLEM: Tasks/Projekte mit company_id = NULL sind für alle Benutzer sichtbar
-- Das ist der Grund warum neue Firmen alle bestehenden Daten sehen

-- 1. Tasks ohne company_id für normale Benutzer komplett ausblenden
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON public.tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON public.tasks FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- KRITISCH: Normale Benutzer können KEINE Tasks ohne company_id sehen
  (NOT is_in_tenant_context() AND company_id IS NOT NULL AND 
   ((company_id = get_user_company_id(auth.uid())) OR 
    (created_by = auth.uid()) OR 
    (auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])))))
);

-- 2. Projekte ohne company_id für normale Benutzer komplett ausblenden
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON public.projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON public.projects FOR SELECT 
USING (
  -- Superadmin außerhalb Tenant-Kontext: Alles sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- KRITISCH: Normale Benutzer können KEINE Projekte ohne company_id sehen
  (NOT is_in_tenant_context() AND company_id IS NOT NULL AND 
   ((company_id = get_user_company_id(auth.uid())) OR 
    (owner_id = auth.uid()) OR 
    (auth.uid() = ANY (team_members))))
);

-- 3. Task INSERT Policy - company_id MUSS gesetzt werden
DROP POLICY IF EXISTS "Task Company Isolation - INSERT" ON public.tasks;  
CREATE POLICY "Task Company Isolation - INSERT" 
ON public.tasks FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- KRITISCH: Normale Benutzer MÜSSEN immer company_id setzen
  (NOT is_in_tenant_context() AND 
   company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- 4. Project INSERT Policy - company_id MUSS gesetzt werden
DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON public.projects;
CREATE POLICY "Project Company Isolation - INSERT" 
ON public.projects FOR INSERT 
WITH CHECK (
  -- Superadmin außerhalb Tenant-Kontext: Alles erlaubt
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: company_id muss der aktuellen Firma entsprechen
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- KRITISCH: Normale Benutzer MÜSSEN immer company_id setzen
  (NOT is_in_tenant_context() AND 
   company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);