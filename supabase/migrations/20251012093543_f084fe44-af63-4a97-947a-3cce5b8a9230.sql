-- Migration 2: RLS Policy Fix - NULL company_id explizit ausschließen

-- Lösche die alte Policy
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;

-- Erstelle die neue, verbesserte Policy
CREATE POLICY "Employee Company Isolation" ON employees
FOR ALL USING (
  CASE 
    -- Im Tenant-Kontext: NUR Mitarbeiter der Tenant-Firma (NULL explizit ausschließen)
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe() AND company_id IS NOT NULL)
    
    -- Superadmin OHNE Tenant: Sieht alles (inkl. NULL für Debugging)
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    
    -- Normale User: Nur ihre Firma (NULL explizit ausschließen)
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  END
);

-- Kommentar zur Policy
COMMENT ON POLICY "Employee Company Isolation" ON employees IS 
'Strikte Firmen-Isolation: Verhindert dass Mitarbeiter mit NULL company_id in Firmen-Kontexten sichtbar sind';
