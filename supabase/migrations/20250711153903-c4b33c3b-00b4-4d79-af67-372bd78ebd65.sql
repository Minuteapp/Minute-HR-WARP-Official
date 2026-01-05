-- Prüfe ob RLS auf time_entries aktiviert ist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'time_entries';

-- Prüfe ob der Benutzer in user_roles existiert
SELECT * FROM public.user_roles WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';

-- Prüfe die aktuellen Policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'time_entries';

-- Teste die aktuelle Benutzer-ID
SELECT auth.uid() as current_user_id;