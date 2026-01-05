-- Verbesserte RLS-Policy für user_roles SELECT
-- Diese Policy erlaubt Superadmins den vollen Zugriff auf user_roles

DROP POLICY IF EXISTS "simple_user_role_select" ON public.user_roles;

CREATE POLICY "enhanced_user_role_select" ON public.user_roles
  FOR SELECT
  USING (
    -- User kann seine eigenen Rollen sehen
    user_id = auth.uid()
    OR
    -- Superadmins können alle Rollen sehen
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
    OR
    -- Fallback: Dieser spezifische SuperAdmin-User
    auth.uid() = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid
  );