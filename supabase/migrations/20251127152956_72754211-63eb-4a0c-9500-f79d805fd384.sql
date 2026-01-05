-- Fix: Security Definer Funktion für Superadmin-Check
-- Verhindert rekursive RLS-Policy-Probleme

-- 1. Lösche alte RLS-Policy die die Funktion verwendet
DROP POLICY IF EXISTS "safe_user_role_select" ON public.user_roles;
DROP POLICY IF EXISTS "enhanced_user_role_select" ON public.user_roles;

-- 2. Lösche alte Funktion mit CASCADE
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid) CASCADE;

-- 3. Erstelle Security Definer Funktion neu mit korrektem Parameter-Namen
CREATE FUNCTION public.is_superadmin_safe(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'superadmin'
  )
$$;

-- 4. Erstelle die RLS-Policy neu
CREATE POLICY "safe_user_role_select" ON public.user_roles
  FOR SELECT
  USING (
    -- User kann seine eigenen Rollen sehen
    user_id = auth.uid()
    OR
    -- Superadmins können alle Rollen sehen (mit sicherer Funktion)
    public.is_superadmin_safe(auth.uid())
  );