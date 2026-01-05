-- Entferne die problematischen RLS-Richtlinien für channel_members
DROP POLICY IF EXISTS "Benutzer können ihre eigenen Kanalmitgliedschaften sehen" ON channel_members;
DROP POLICY IF EXISTS "Kanalmitglieder können sich selbst sehen" ON channel_members;
DROP POLICY IF EXISTS "Admins können alle Kanalmitgliedschaften verwalten" ON channel_members;

-- Erstelle neue, nicht-rekursive RLS-Richtlinien
CREATE POLICY "Users can view channel members where they are members"
ON channel_members FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM channel_members cm2 
    WHERE cm2.channel_id = channel_members.channel_id 
    AND cm2.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can insert themselves as channel members"
ON channel_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins and channel owners can update memberships"
ON channel_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  ) OR
  EXISTS (
    SELECT 1 FROM channels c 
    WHERE c.id = channel_members.channel_id 
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Admins and channel owners can delete memberships"
ON channel_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  ) OR
  EXISTS (
    SELECT 1 FROM channels c 
    WHERE c.id = channel_members.channel_id 
    AND c.created_by = auth.uid()
  ) OR
  auth.uid() = user_id  -- Users can remove themselves
);