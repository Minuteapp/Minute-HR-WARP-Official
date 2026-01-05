-- Entferne alle bestehenden RLS-Policies für time_entries
DROP POLICY IF EXISTS "Users can view own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Superadmins can manage all time entries" ON public.time_entries;
DROP POLICY IF EXISTS "SuperAdmins have full access to time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Admins have full access to time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

-- Erstelle neue, einfache RLS-Policies
-- Benutzer können ihre eigenen Zeiteinträge sehen
CREATE POLICY "Users can view their own time entries"
ON public.time_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Benutzer können ihre eigenen Zeiteinträge erstellen
CREATE POLICY "Users can create their own time entries"
ON public.time_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Zeiteinträge aktualisieren
CREATE POLICY "Users can update their own time entries"
ON public.time_entries
FOR UPDATE
USING (auth.uid() = user_id);

-- Benutzer können ihre eigenen Zeiteinträge löschen
CREATE POLICY "Users can delete their own time entries"
ON public.time_entries
FOR DELETE
USING (auth.uid() = user_id);

-- SuperAdmins können alles verwalten
CREATE POLICY "SuperAdmins can manage all time entries"
ON public.time_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Admins können alles verwalten
CREATE POLICY "Admins can manage all time entries"
ON public.time_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);