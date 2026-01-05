-- Entferne ALLE bestehenden RLS-Richtlinien für channel_members
DROP POLICY IF EXISTS "Users can view channel members where they are members" ON channel_members;
DROP POLICY IF EXISTS "Users can insert themselves as channel members" ON channel_members;
DROP POLICY IF EXISTS "Admins and channel owners can update memberships" ON channel_members;
DROP POLICY IF EXISTS "Admins and channel owners can delete memberships" ON channel_members;
DROP POLICY IF EXISTS "Benutzer können ihre eigenen Kanalmitgliedschaften sehen" ON channel_members;
DROP POLICY IF EXISTS "Kanalmitglieder können sich selbst sehen" ON channel_members;
DROP POLICY IF EXISTS "Admins können alle Kanalmitgliedschaften verwalten" ON channel_members;

-- Erstelle einfache, nicht-rekursive RLS-Richtlinien
CREATE POLICY "channel_members_select_policy"
ON channel_members FOR SELECT
USING (
  -- Benutzer können ihre eigenen Mitgliedschaften sehen
  auth.uid() = user_id OR
  -- Admins können alles sehen
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "channel_members_insert_policy"
ON channel_members FOR INSERT
WITH CHECK (
  -- Benutzer können sich selbst hinzufügen oder Admins können jeden hinzufügen
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "channel_members_update_policy"
ON channel_members FOR UPDATE
USING (
  -- Nur Admins können Mitgliedschaften aktualisieren
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "channel_members_delete_policy"
ON channel_members FOR DELETE
USING (
  -- Benutzer können sich selbst entfernen oder Admins können jeden entfernen
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);