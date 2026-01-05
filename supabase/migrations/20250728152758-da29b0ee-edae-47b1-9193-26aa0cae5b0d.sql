-- ERSTELLE TRIGGER FÜR AUTOMATISCHE COMPANY_ID ZUWEISUNG

-- Function für automatische company_id Zuweisung für neue Tasks
CREATE OR REPLACE FUNCTION auto_assign_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur setzen wenn company_id NULL ist
  IF NEW.company_id IS NULL THEN
    -- Im Tenant-Kontext: verwende tenant_company_id
    IF is_in_tenant_context() THEN
      NEW.company_id := get_tenant_company_id_safe();
    ELSE
      -- Normale Benutzer: verwende ihre Firma
      NEW.company_id := get_user_company_id(auth.uid());
    END IF;
    
    -- Fallback: verwende Legacy-Firma
    IF NEW.company_id IS NULL THEN
      NEW.company_id := '00000000-0000-0000-0000-000000000001';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Tasks
DROP TRIGGER IF EXISTS auto_assign_company_id_tasks ON tasks;
CREATE TRIGGER auto_assign_company_id_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

-- Trigger für Projects  
DROP TRIGGER IF EXISTS auto_assign_company_id_projects ON projects;
CREATE TRIGGER auto_assign_company_id_projects
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();

-- Trigger für Employees
DROP TRIGGER IF EXISTS auto_assign_company_id_employees ON employees;
CREATE TRIGGER auto_assign_company_id_employees
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_company_id();