-- Prüfe die aktuellen RLS-Policies für time_entries
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'time_entries';

-- Überprüfe, ob auth.uid() funktioniert
SELECT auth.uid() as current_user_id;

-- Überprüfe user_roles für den aktuellen Benutzer
SELECT ur.* FROM public.user_roles ur WHERE ur.user_id = auth.uid();