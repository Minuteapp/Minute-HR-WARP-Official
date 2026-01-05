-- SYSTEMWEITE DATENISOLIERUNG REPARIEREN
-- Problem: Alle Daten mit company_id = NULL sind für alle Firmen sichtbar

-- 1. KRITISCH: Tasks mit NULL company_id komplett ausblenden für Tenant-Benutzer
DROP POLICY IF EXISTS "Task Company Isolation - SELECT" ON public.tasks;
CREATE POLICY "Task Company Isolation - SELECT" 
ON public.tasks FOR SELECT 
USING (
  -- Nur Superadmin kann Daten ohne company_id sehen, und nur außerhalb Tenant-Kontext
  (company_id IS NULL AND is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: NUR Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer außerhalb Tenant: nur ihre Firma-spezifischen Daten
  (NOT is_in_tenant_context() AND company_id IS NOT NULL AND 
   company_id = get_user_company_id(auth.uid()))
);

-- 2. Projekte: Gleiche strikte Isolation
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON public.projects;
CREATE POLICY "Project Company Isolation - SELECT" 
ON public.projects FOR SELECT 
USING (
  -- Nur Superadmin kann Daten ohne company_id sehen, und nur außerhalb Tenant-Kontext
  (company_id IS NULL AND is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: NUR Daten der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer außerhalb Tenant: nur ihre Firma-spezifischen Daten
  (NOT is_in_tenant_context() AND company_id IS NOT NULL AND 
   company_id = get_user_company_id(auth.uid()))
);

-- 3. Zeiteinträge (time_entries): Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Time entries isolation" ON public.time_entries;
CREATE POLICY "Time entries isolation" 
ON public.time_entries FOR ALL 
USING (
  -- Nur Superadmin außerhalb Tenant kann alle sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Daten der aktuellen Firma
  (is_in_tenant_context() AND EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_entries.user_id 
    AND e.company_id = get_tenant_company_id_safe()
  )) OR
  -- Normale Benutzer: nur ihre eigenen Daten
  (NOT is_in_tenant_context() AND user_id = auth.uid())
);

-- 4. Mitarbeiter (employees): Strikte Firmen-Isolation reparieren
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON public.employees;
CREATE POLICY "Employee Company Isolation - SELECT" 
ON public.employees FOR SELECT 
USING (
  -- Nur Superadmin außerhalb Tenant kann alle sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Mitarbeiter der aktuellen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe()) OR
  -- Normale Benutzer: nur Mitarbeiter ihrer Firma + sich selbst
  (NOT is_in_tenant_context() AND 
   ((company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid())) OR id = auth.uid()))
);

-- 5. Abwesenheitsanträge: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Absence Company Isolation" ON public.absence_requests;
CREATE POLICY "Absence Company Isolation" 
ON public.absence_requests FOR ALL 
USING (
  -- Nur Superadmin außerhalb Tenant kann alle sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Anträge der aktuellen Firma
  (is_in_tenant_context() AND user_id IN (
    SELECT e.id FROM employees e 
    WHERE e.company_id = get_tenant_company_id_safe()
  )) OR
  -- Normale Benutzer: nur ihre eigenen Anträge oder ihrer Firma
  (NOT is_in_tenant_context() AND 
   (user_id = auth.uid() OR user_id IN (
     SELECT e.id FROM employees e 
     WHERE e.company_id = get_user_company_id(auth.uid()) AND e.company_id IS NOT NULL
   )))
);

-- 6. Kalenderevents: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Calendar events isolation" ON public.calendar_events;
CREATE POLICY "Calendar events isolation" 
ON public.calendar_events FOR ALL 
USING (
  -- Nur Superadmin außerhalb Tenant kann alle sehen
  (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context()) OR
  -- Im Tenant-Kontext: nur Events der aktuellen Firma
  (is_in_tenant_context() AND (
    created_by IN (
      SELECT e.id FROM employees e 
      WHERE e.company_id = get_tenant_company_id_safe()
    ) OR created_by = auth.uid()
  )) OR
  -- Normale Benutzer: nur ihre eigenen Events
  (NOT is_in_tenant_context() AND created_by = auth.uid())
);