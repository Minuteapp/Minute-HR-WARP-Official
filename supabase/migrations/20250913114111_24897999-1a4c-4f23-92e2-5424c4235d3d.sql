-- SCHRITT 2: Companies Tabelle - KRITISCHE Tenant-Isolation  
DROP POLICY IF EXISTS "Company SuperAdmin Tenant Isolation" ON public.companies;
CREATE POLICY "Company SuperAdmin Tenant Isolation" ON public.companies
FOR ALL USING (
  CASE
    -- SuperAdmin im Tenant-Modus: Nur die Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant-Modus: Alle Firmen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- Normale Benutzer: Nur eigene Firma
    ELSE 
      id = get_user_company_id(auth.uid()) AND id IS NOT NULL
  END
);