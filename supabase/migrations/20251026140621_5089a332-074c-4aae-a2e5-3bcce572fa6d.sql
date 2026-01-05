-- Fix infinite recursion in channel_members - Safe approach
-- First create helper functions if they don't exist

DO $$ 
BEGIN
  -- Drop existing functions if they exist
  DROP FUNCTION IF EXISTS public.is_channel_member(uuid, uuid);
  DROP FUNCTION IF EXISTS public.is_channel_public(uuid);
END $$;

-- Create security definer function to check channel membership
CREATE FUNCTION public.is_channel_member(_channel_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM channel_members
    WHERE channel_id = _channel_id
      AND user_id = _user_id
  );
$$;

-- Create security definer function to check if channel is public
CREATE FUNCTION public.is_channel_public(_channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_public, false)
  FROM channels
  WHERE id = _channel_id;
$$;

-- Now replace policies one by one
DO $$ 
BEGIN
  -- Replace SELECT policy
  DROP POLICY IF EXISTS "channel_members_select" ON channel_members;
  DROP POLICY IF EXISTS "channel_members_select_policy" ON channel_members;
  
  CREATE POLICY "channel_members_select_policy"
  ON channel_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_channel_member(channel_id, auth.uid())
    OR public.is_channel_public(channel_id)
  );

  -- Replace INSERT policy
  DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;
  DROP POLICY IF EXISTS "channel_members_insert_policy" ON channel_members;
  
  CREATE POLICY "channel_members_insert_policy"
  ON channel_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.is_channel_public(channel_id)
      OR auth.uid() IS NOT NULL
    )
  );

  -- Replace UPDATE policy
  DROP POLICY IF EXISTS "channel_members_update" ON channel_members;
  DROP POLICY IF EXISTS "channel_members_update_policy" ON channel_members;
  
  CREATE POLICY "channel_members_update_policy"
  ON channel_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

  -- Replace DELETE policy
  DROP POLICY IF EXISTS "channel_members_delete" ON channel_members;
  DROP POLICY IF EXISTS "channel_members_delete_policy" ON channel_members;
  
  CREATE POLICY "channel_members_delete_policy"
  ON channel_members FOR DELETE
  USING (user_id = auth.uid());
END $$;