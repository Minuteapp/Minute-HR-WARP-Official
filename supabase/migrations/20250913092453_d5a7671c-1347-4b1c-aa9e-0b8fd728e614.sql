-- SCHRITT 1: Employees Tabelle - KRITISCHE Tenant-Isolation
DROP POLICY IF EXISTS "Employee Company Isolation" ON public.employees;
CREATE POLICY "Employee Company Isolation" ON public.employees
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur Daten der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Daten
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);