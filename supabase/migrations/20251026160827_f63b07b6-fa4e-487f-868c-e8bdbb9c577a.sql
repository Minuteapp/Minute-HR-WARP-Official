-- Atomic policy replacement using DO block
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on channel_members
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'channel_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.channel_members', pol.policyname);
    END LOOP;

    -- Drop all policies on channels
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'channels' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.channels', pol.policyname);
    END LOOP;

    -- Drop all policies on messages
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
    END LOOP;
END $$;

-- Create simple, non-recursive policies
-- channel_members: User can only see/manage their own memberships
CREATE POLICY "cm_select" ON public.channel_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "cm_insert" ON public.channel_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "cm_update" ON public.channel_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "cm_delete" ON public.channel_members
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- channels: Public channels or owned channels
CREATE POLICY "ch_select" ON public.channels
FOR SELECT TO authenticated
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "ch_insert" ON public.channels
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "ch_update" ON public.channels
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "ch_delete" ON public.channels
FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- messages: All can read, only sender can modify
CREATE POLICY "msg_select" ON public.messages
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "msg_insert" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_update" ON public.messages
FOR UPDATE TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_delete" ON public.messages
FOR DELETE TO authenticated
USING (sender_id = auth.uid());