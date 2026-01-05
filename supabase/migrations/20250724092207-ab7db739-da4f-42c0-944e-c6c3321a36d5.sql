-- Lösche alle existierenden Policies für channel_members
DROP POLICY IF EXISTS "Users can view channel members if they are members" ON channel_members;
DROP POLICY IF EXISTS "Users can view members of channels they belong to" ON channel_members;
DROP POLICY IF EXISTS "Users can add themselves to public channels" ON channel_members;
DROP POLICY IF EXISTS "Channel creators can add members" ON channel_members;
DROP POLICY IF EXISTS "Members can remove themselves" ON channel_members;
DROP POLICY IF EXISTS "Channel creators can remove members" ON channel_members;

-- Erstelle einfache, nicht-rekursive Policies
CREATE POLICY "Users can view all channel members" 
ON channel_members 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert themselves into channels" 
ON channel_members 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON channel_members 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own membership" 
ON channel_members 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);