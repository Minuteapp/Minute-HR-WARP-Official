-- Fix set_role_preview function to include company_id
CREATE OR REPLACE FUNCTION public.set_role_preview(p_preview_role user_role)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_original_role user_role;
  v_company_id uuid;
BEGIN
  -- Nur für Superadmins
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nur Superadmins können Role Preview aktivieren'
    );
  END IF;
  
  -- Originale Rolle ermitteln
  SELECT role INTO v_original_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Company ID des Benutzers ermitteln
  SELECT company_id INTO v_company_id
  FROM employees
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Fallback: Wenn keine company_id gefunden, nimm die erste verfügbare
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id
    FROM companies
    LIMIT 1;
  END IF;
  
  -- Preview-Session erstellen/aktualisieren
  INSERT INTO user_role_preview_sessions (
    user_id, preview_role, original_role, is_preview_active, company_id, updated_at
  )
  VALUES (
    auth.uid(), p_preview_role, COALESCE(v_original_role, 'superadmin'::user_role), true, v_company_id, NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    preview_role = EXCLUDED.preview_role,
    is_preview_active = true,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'preview_role', p_preview_role,
    'original_role', v_original_role,
    'company_id', v_company_id
  );
END;
$$;