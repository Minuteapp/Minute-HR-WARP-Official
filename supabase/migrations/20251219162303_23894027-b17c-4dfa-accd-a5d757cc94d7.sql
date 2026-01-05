-- Erstelle SECURITY DEFINER Funktion für Superadmin-Impersonation
CREATE OR REPLACE FUNCTION public.is_superadmin_or_own_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = check_user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
$$;

-- Lösche bestehende Policies für time_entries
DROP POLICY IF EXISTS "Users can insert their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

-- Erstelle neue Policies mit Superadmin-Unterstützung
CREATE POLICY "time_entries_insert_policy" ON public.time_entries
FOR INSERT
WITH CHECK (public.is_superadmin_or_own_user(user_id));

CREATE POLICY "time_entries_update_policy" ON public.time_entries
FOR UPDATE
USING (public.is_superadmin_or_own_user(user_id));

CREATE POLICY "time_entries_delete_policy" ON public.time_entries
FOR DELETE
USING (public.is_superadmin_or_own_user(user_id));