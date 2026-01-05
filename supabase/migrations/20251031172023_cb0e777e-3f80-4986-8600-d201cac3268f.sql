-- Migration: Fix user_tenant_sessions RLS und set_tenant_context_with_user_id Logging
-- Problem: SECURITY DEFINER Funktionen können nicht in user_tenant_sessions schreiben
-- Lösung: Policy für SECURITY DEFINER Funktionen hinzufügen

-- 1. Lösche alte Policies
DROP POLICY IF EXISTS "Users manage own sessions" ON public.user_tenant_sessions;
DROP POLICY IF EXISTS "Allow SECURITY DEFINER functions to read sessions" ON public.user_tenant_sessions;

-- 2. Neue Policy: Users können ihre eigenen Sessions managen
CREATE POLICY "Users manage own sessions" 
ON public.user_tenant_sessions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. KRITISCH: Erlaube SECURITY DEFINER Funktionen ALLE Operationen
CREATE POLICY "SECURITY DEFINER functions full access" 
ON public.user_tenant_sessions 
FOR ALL 
USING (current_setting('role', true) = 'postgres')
WITH CHECK (current_setting('role', true) = 'postgres');

-- 4. Funktion mit verbessertem Logging und Fehlerbehandlung
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inserted_id uuid;
BEGIN
  -- Prüfe ob der Benutzer berechtigt ist
  IF NOT is_superadmin_safe(p_user_id) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Nicht berechtigt - Nur SuperAdmins können Tenant-Kontext setzen',
      'user_id', p_user_id,
      'is_superadmin', false
    );
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