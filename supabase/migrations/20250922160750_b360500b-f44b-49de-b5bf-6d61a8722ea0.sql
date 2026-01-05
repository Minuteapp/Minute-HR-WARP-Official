-- Update RLS Policy für time_entries (einzeln um Deadlock zu vermeiden)

DROP POLICY IF EXISTS "Time Entry Company Isolation" ON time_entries;

CREATE POLICY "Time Entry Company Isolation" ON time_entries
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      -- Im Tenant-Modus: Nur Daten der Tenant-Firma
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      ))
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      -- SuperAdmin im Admin-Modus: Alle Daten
      true
    ELSE 
      -- Normale Benutzer: Nur eigene Daten in ihrer Firma
      (user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
        AND e.company_id IS NOT NULL
      ))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      ))
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (user_id = auth.uid())
  END
);