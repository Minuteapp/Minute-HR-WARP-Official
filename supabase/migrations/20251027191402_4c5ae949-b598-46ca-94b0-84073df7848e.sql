-- Droppe bekannte Policies einzeln
DROP POLICY IF EXISTS "channels_select_public" ON channels;
DROP POLICY IF EXISTS "channels_select_creator" ON channels;
DROP POLICY IF EXISTS "channels_insert" ON channels;
DROP POLICY IF EXISTS "channels_update" ON channels;
DROP POLICY IF EXISTS "channels_delete" ON channels;
DROP POLICY IF EXISTS "Users can view public channels" ON channels;
DROP POLICY IF EXISTS "Users can view their own created channels" ON channels;
DROP POLICY IF EXISTS "Users can view channels where they are members" ON channels;
DROP POLICY IF EXISTS "Users can create channels" ON channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON channels;
DROP POLICY IF EXISTS "Users can delete their own channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can view channels" ON channels;

-- Erstelle neue, einfache Policies
CREATE POLICY "channels_public_select"
ON channels FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "channels_creator_select"
ON channels FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "channels_creator_insert"
ON channels FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_creator_update"
ON channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "channels_creator_delete"
ON channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());