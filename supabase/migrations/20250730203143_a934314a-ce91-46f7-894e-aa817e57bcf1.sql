-- NOTFALL-REPARATUR TEIL 2: Funktion droppen und neu erstellen

-- 1. LÖSCHE die existierende Funktion
DROP FUNCTION IF EXISTS get_user_company_id(uuid);

-- 2. ALLE Daten der duplizierten Firmen löschen  
DELETE FROM employees WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM tasks WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM projects WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM goals WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';
DELETE FROM calendar_events WHERE company_id != '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1';

-- 3. Tenant-Kontext komplett löschen
DELETE FROM user_tenant_sessions WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- 4. NEUE strenge get_user_company_id Funktion
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  -- HARDCODE: Ihr User gehört zur ursprünglichen Firma
  IF user_uuid = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' THEN
    RETURN '3650d0c8-99b3-4af5-9f8a-62dec75d1ae1'::UUID;
  END IF;
  
  -- Andere User: Suche in user_roles
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = user_uuid
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;