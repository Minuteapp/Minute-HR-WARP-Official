-- 1. Bestehende Admin-Policy löschen (hat keinen WITH CHECK)
DROP POLICY IF EXISTS "Admins can manage sick leaves" ON sick_leaves;

-- 2. Neue Admin-Policy mit WITH CHECK erstellen
CREATE POLICY "Admins can manage sick leaves" ON sick_leaves
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin', 'hr')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin', 'hr')
  )
);