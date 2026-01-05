-- =====================================================
-- OPTION 2: RPC-Funktionen erweitern für Admins und HR
-- =====================================================

-- Erweitere set_tenant_context_with_user_id: 
-- Erlaube SuperAdmins, Admins UND HR-Manager den Tenant-Context zu setzen
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inserted_id uuid;
  v_user_role text;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Prüfe ob der Benutzer berechtigt ist (SuperAdmin ODER Admin ODER HR)
  IF v_user_role NOT IN ('superadmin', 'admin', 'hr', 'hr_manager') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext setzen',
      'user_id', p_user_id,
      'user_role', COALESCE(v_user_role, 'keine Rolle gefunden')
    );
  END IF;
  
  -- Für Admins und HR: Prüfe ob sie versuchen, auf IHRE eigene Firma zuzugreifen
  IF v_user_role IN ('admin', 'hr', 'hr_manager') THEN
    -- Hole die company_id des Users
    DECLARE
      v_user_company_id uuid;
    BEGIN
      SELECT company_id INTO v_user_company_id
      FROM user_roles
      WHERE user_id = p_user_id
      LIMIT 1;
      
      -- Admin/HR darf nur seine eigene Firma setzen
      IF v_user_company_id IS DISTINCT FROM p_company_id THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Nicht berechtigt - Sie können nur den Kontext Ihrer eigenen Firma setzen',
          'user_id', p_user_id,
          'user_role', v_user_role,
          'user_company_id', v_user_company_id,
          'requested_company_id', p_company_id
        );
      END IF;
    END;
  END IF;
  
  -- Lösche vorhandene Session
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  -- Erstelle neue Session mit RETURNING
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, created_at)
  VALUES (p_user_id, p_company_id, true, NOW())
  RETURNING user_id INTO v_inserted_id;
  
  -- Prüfe ob INSERT erfolgreich war
  IF v_inserted_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'INSERT fehlgeschlagen - Session konnte nicht erstellt werden',
      'user_id', p_user_id,
      'company_id', p_company_id
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user_id', v_inserted_id,
    'company_id', p_company_id,
    'user_role', v_user_role,
    'debug', 'Tenant-Session erfolgreich erstellt'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id,
      'company_id', p_company_id
    );
END;
$$;

-- Erweitere clear_tenant_context_with_user_id: 
-- Füge Berechtigungsprüfung hinzu
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Prüfe ob der Benutzer berechtigt ist (SuperAdmin ODER Admin ODER HR)
  IF v_user_role NOT IN ('superadmin', 'admin', 'hr', 'hr_manager') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext löschen',
      'user_id', p_user_id,
      'user_role', COALESCE(v_user_role, 'keine Rolle gefunden')
    );
  END IF;
  
  -- Lösche Tenant-Session
  DELETE FROM user_tenant_sessions
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_role', v_user_role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id
    );
END;
$$;