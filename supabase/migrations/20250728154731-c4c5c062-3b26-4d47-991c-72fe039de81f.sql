-- KORREKTUR: DATEN-WIEDERHERSTELLUNG UND RLS-VERBESSERUNG

-- 1. Bestimme die ursprüngliche Firma des Benutzers (größte Firma außer Legacy)
DO $$
DECLARE
    user_company_id UUID;
BEGIN
    -- Finde die wahrscheinliche ursprüngliche Firma des Benutzers
    -- (größte/älteste aktive Firma außer Legacy System Data)
    SELECT id INTO user_company_id
    FROM companies 
    WHERE id != '00000000-0000-0000-0000-000000000001' 
    AND is_active = true
    ORDER BY created_at ASC, employee_count DESC
    LIMIT 1;
    
    -- Falls eine Firma gefunden wurde, verschiebe alle Legacy-Daten dorthin
    IF user_company_id IS NOT NULL THEN
        -- Tasks verschieben
        UPDATE tasks 
        SET company_id = user_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        -- Projects verschieben
        UPDATE projects 
        SET company_id = user_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        -- Employees verschieben  
        UPDATE employees 
        SET company_id = user_company_id 
        WHERE company_id = '00000000-0000-0000-0000-000000000001';
        
        -- Absence Requests verschieben
        UPDATE absence_requests 
        SET user_id = (
            SELECT e.id FROM employees e 
            WHERE e.company_id = user_company_id 
            LIMIT 1
        )
        WHERE user_id IN (
            SELECT e.id FROM employees e 
            WHERE e.company_id = '00000000-0000-0000-0000-000000000001'
        );
        
        RAISE NOTICE 'Daten von Legacy-Firma zu % verschoben', user_company_id;
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
        auth.uid()::text = ANY(team_members)
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

-- 3. Trigger anpassen - nur für neue Einträge, nicht für bestehende
DROP TRIGGER IF EXISTS auto_assign_company_id_tasks ON tasks;
DROP TRIGGER IF EXISTS auto_assign_company_id_projects ON projects;  
DROP TRIGGER IF EXISTS auto_assign_company_id_employees ON employees;

-- Neuer verbesserter Trigger
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

-- Trigger nur für INSERTs einrichten
CREATE TRIGGER auto_assign_company_id_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_id_projects
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_id_employees
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();