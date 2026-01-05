-- Deaktiviere RLS temporär für time_entries um das Problem zu isolieren
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;

-- Prüfe den Status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'time_entries';