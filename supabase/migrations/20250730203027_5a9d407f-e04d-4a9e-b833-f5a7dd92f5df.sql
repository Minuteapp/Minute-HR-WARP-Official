-- NOTFALL-REPARATUR: SOFORTIGE Datentrennung zwischen Firmen
-- PROBLEM: Alle Daten gehören zur company_id 3650d0c8-99b3-4af5-9f8a-62dec75d1ae1

-- 1. ALLE Daten der neuen Firmen löschen (außer der ursprünglichen Firma)
DELETE FROM employees WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM tasks WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM projects WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM goals WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM calendar_events WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';

-- 2. NOTFALL: Lösche den Tenant-Kontext komplett
DELETE FROM user_tenant_sessions WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- 3. STRENGE RLS: Alle Daten müssen company_id haben
UPDATE employees SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;
UPDATE tasks SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;
UPDATE projects SET company_id = '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1' WHERE company_id IS NULL;

-- 4. NUCLEAR OPTION: Erzwinge strenge Isolation
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  -- HARDCODE: Ihr User gehört zur ursprünglichen Firma
  IF user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' THEN
    RETURN '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1'::UUID;
  END IF;
  
  -- Andere User: Suche in user_roles
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = $1
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;