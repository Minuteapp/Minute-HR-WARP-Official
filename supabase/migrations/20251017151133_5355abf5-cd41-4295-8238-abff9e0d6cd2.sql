-- ========================================
-- ROLE PREVIEW SYSTEM FÜR SUPERADMINS
-- ========================================

-- 1. Tabelle für Role Preview Sessions
CREATE TABLE IF NOT EXISTS public.user_role_preview_sessions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preview_role user_role NOT NULL,
  original_role user_role NOT NULL,
  is_preview_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Enable RLS
ALTER TABLE public.user_role_preview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Nur Superadmins können Preview-Sessions verwalten
CREATE POLICY "Superadmins manage role previews"
  ON public.user_role_preview_sessions
  FOR ALL
  USING (is_superadmin_safe(auth.uid()))
  WITH CHECK (is_superadmin_safe(auth.uid()));

-- 2. Funktion: Effektive Rolle abrufen (mit Preview-Support)
CREATE OR REPLACE FUNCTION public.get_effective_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_preview_role user_role;
  v_actual_role user_role;
  v_is_superadmin boolean;
BEGIN
  -- Prüfe ob Superadmin
  v_is_superadmin := is_superadmin_safe(auth.uid());
  
  -- Wenn Superadmin im Preview-Modus
  IF v_is_superadmin THEN
    SELECT preview_role INTO v_preview_role
    FROM user_role_preview_sessions
    WHERE user_id = auth.uid() AND is_preview_active = true
    LIMIT 1;
    
    IF v_preview_role IS NOT NULL THEN
      RETURN v_preview_role;
    END IF;
  END IF;
  
  -- Sonst normale Rolle
  SELECT role INTO v_actual_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_actual_role, 'employee'::user_role);
END;
$$;

-- 3. RPC-Funktion: Role Preview aktivieren
CREATE OR REPLACE FUNCTION public.set_role_preview(p_preview_role user_role)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_original_role user_role;
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
  
  -- Preview-Session erstellen/aktualisieren
  INSERT INTO user_role_preview_sessions (
    user_id, preview_role, original_role, is_preview_active, updated_at
  )
  VALUES (
    auth.uid(), p_preview_role, COALESCE(v_original_role, 'superadmin'::user_role), true, NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    preview_role = EXCLUDED.preview_role,
    is_preview_active = true,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'preview_role', p_preview_role,
    'original_role', v_original_role
  );
END;
$$;

-- 4. RPC-Funktion: Role Preview deaktivieren
CREATE OR REPLACE FUNCTION public.clear_role_preview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nur für Superadmins
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nur Superadmins können Role Preview deaktivieren'
    );
  END IF;
  
  -- Preview-Session deaktivieren
  UPDATE user_role_preview_sessions
  SET is_preview_active = false, updated_at = NOW()
  WHERE user_id = auth.uid();
  
  -- Oder komplett löschen
  DELETE FROM user_role_preview_sessions
  WHERE user_id = auth.uid();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Role Preview deaktiviert'
  );
END;
$$;

-- 5. Index für Performance
CREATE INDEX IF NOT EXISTS idx_role_preview_active 
ON user_role_preview_sessions(user_id, is_preview_active) 
WHERE is_preview_active = true;