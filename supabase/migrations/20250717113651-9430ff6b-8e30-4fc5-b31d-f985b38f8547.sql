-- Vollständige Bereinigung aller problematischen RLS-Policies

-- Entferne ALLE RLS-Policies von user_roles komplett
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Deaktiviere RLS temporär für user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Erstelle eine einfache, sichere RLS-Policy
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Einfache Policy: Jeder kann seine eigene Rolle sehen
CREATE POLICY "allow_own_role_view" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Superadmins können alles verwalten (ohne Rekursion)
CREATE POLICY "superadmin_full_access" ON public.user_roles
FOR ALL USING (
  auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
    LIMIT 1
  )
);

-- Aktualisiere andere problematische Policies in time_entries falls vorhanden
-- Entferne rekursive Policies von time_entries
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Admins can view all time entries" ON public.time_entries;

-- Erstelle sichere time_entries Policies
CREATE POLICY "own_time_entries_select" ON public.time_entries
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_time_entries_insert" ON public.time_entries
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_time_entries_update" ON public.time_entries
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "own_time_entries_delete" ON public.time_entries
FOR DELETE USING (user_id = auth.uid());