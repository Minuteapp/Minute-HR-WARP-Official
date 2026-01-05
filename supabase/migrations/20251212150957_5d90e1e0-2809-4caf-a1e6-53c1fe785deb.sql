-- Foreign Key zwischen channel_members und profiles hinzufügen
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'channel_members_user_id_fkey' 
    AND table_name = 'channel_members'
  ) THEN
    ALTER TABLE public.channel_members 
    ADD CONSTRAINT channel_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;