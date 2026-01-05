-- KORREKTUR: DATEN-WIEDERHERSTELLUNG UND RLS-VERBESSERUNG (KORRIGIERT)

-- 1. Bestimme die ursprüngliche Firma des Benutzers und verschiebe Daten zurück
DO $$
DECLARE
    user_company_id UUID;
    main_company_id UUID;
BEGIN
    -- Finde die wahrscheinliche ursprüngliche Firma des Benutzers
    -- (älteste aktive Firma außer Legacy System Data)
    SELECT id INTO main_company_id
    FROM companies 
    WHERE id != '00000000-0000-0000-0000-000000000001' 
    AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Falls eine Firma gefunden wurde, verschiebe alle Legacy-Daten dorthin
    IF main_company_id IS NOT NULL THEN
        -- Tasks verschieben
        UPDATE tasks 
        SET company_id = main_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        -- Projects verschieben
        UPDATE projects 
        SET company_id = main_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        -- Employees verschieben  
        UPDATE employees 
        SET company_id = main_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        RAISE NOTICE 'Daten von Legacy-Firma zu % verschoben', main_company_id;
    END IF;
END $$;

-- 2. Verbesserte RLS-Richtlinien für bessere Datenisolation

-- Tasks RLS verbessern
DROP POLICY IF EXISTS "Tasks Company Isolation" ON tasks;
CREATE POLICY "Tasks Company Isolation" ON tasks
FOR ALL USING (
    -- SuperAdmins sehen alles (außer in Tenant-Kontext)
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Daten der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur ihre Firmendaten
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Projects RLS verbessern  
DROP POLICY IF EXISTS "Projects Company Isolation" ON projects;
CREATE POLICY "Projects Company Isolation" ON projects
FOR ALL USING (
    -- SuperAdmins sehen alles (außer in Tenant-Kontext)
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Daten der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur ihre Firmendaten + sie sind Projektbesitzer/Mitglied
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL AND (
        owner_id = auth.uid() OR 
        auth.uid()::text = ANY(team_members::text[])
    ))
);

-- Employees RLS verbessern
DROP POLICY IF EXISTS "Employees Company Isolation" ON employees;
CREATE POLICY "Employees Company Isolation" ON employees  
FOR ALL USING (
    -- SuperAdmins sehen alles (außer in Tenant-Kontext)
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Daten der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur ihre Firmendaten
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- 3. Neuer Trigger nur für neue Einträge
CREATE OR REPLACE FUNCTION auto_assign_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur setzen wenn company_id NULL ist UND es ein INSERT ist
  IF NEW.company_id IS NULL AND TG_OP = 'INSERT' THEN
    -- Im Tenant-Kontext: verwende tenant_company_id
    IF is_in_tenant_context() THEN
      NEW.company_id := get_tenant_company_id_safe();
    ELSE
      -- Normale Benutzer: verwende ihre Firma
      NEW.company_id := get_user_company_id(auth.uid());
    END IF;
    
    -- Kein Legacy-Fallback mehr! Neue Firmen müssen komplett leer sein
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;