-- Entferne alle RLS-Policies von channel_members vollständig
DROP POLICY IF EXISTS "Users can view channel members for accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels they belong to" ON public.channel_members;

-- Deaktiviere RLS temporär für channel_members
ALTER TABLE public.channel_members DISABLE ROW LEVEL SECURITY;

-- Entferne auch den problematischen Trigger
DROP TRIGGER IF EXISTS on_channel_created ON public.channels;
DROP FUNCTION IF EXISTS public.handle_new_channel();

-- Entferne die user_can_access_channel Function
DROP FUNCTION IF EXISTS public.user_can_access_channel(uuid);