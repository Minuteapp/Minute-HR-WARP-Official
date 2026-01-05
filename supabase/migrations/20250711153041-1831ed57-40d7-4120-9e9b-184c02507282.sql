-- Prüfe die aktuellen RLS-Policies für time_entries
\d+ time_entries

-- Zeige alle RLS-Policies für time_entries
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'time_entries';

-- Prüfe ob der aktuelle Benutzer Zugriff hat
SELECT auth.uid() as current_user_id;

-- Prüfe die user_roles für den aktuellen Benutzer
SELECT * FROM public.user_roles WHERE user_id = auth.uid();