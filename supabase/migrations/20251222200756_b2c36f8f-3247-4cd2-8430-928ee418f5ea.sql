
-- Chats Policies entfernen und neu erstellen
DROP POLICY IF EXISTS "chats_select_all" ON public.chats;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.chats;

-- Chats: created_by ist uuid, participants ist uuid[]
CREATE POLICY "chats_select_secure" ON public.chats FOR SELECT TO authenticated
USING (
  created_by = public.get_effective_user_id() 
  OR public.get_effective_user_id() = ANY(participants)
);
