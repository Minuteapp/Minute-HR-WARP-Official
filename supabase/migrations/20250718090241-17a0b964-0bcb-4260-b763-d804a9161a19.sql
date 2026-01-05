-- Komplette Bereinigung und Neuaufbau der user_roles RLS-Policies

-- 1. Entferne ALLE existierenden RLS-Policies von user_roles
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "SuperAdmins can manage all user roles with audit" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role only" ON public.user_roles;
DROP POLICY IF EXISTS "allow_own_role_view" ON public.user_roles;
DROP POLICY IF EXISTS "superadmin_full_access" ON public.user_roles;

-- 2. Deaktiviere RLS temporär
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Aktiviere RLS wieder
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Erstelle eine einfache, nicht-rekursive Policy für SELECT
CREATE POLICY "simple_user_role_select" ON public.user_roles
FOR SELECT USING (
  -- Benutzer können ihre eigene Rolle sehen
  user_id = auth.uid() OR
  -- Hardcoded Superadmin UUID (falls vorhanden)
  auth.uid() = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid
);

-- 5. Einfache Policy für INSERT (nur für spezielle Admin-Operationen)
CREATE POLICY "simple_user_role_insert" ON public.user_roles
FOR INSERT WITH CHECK (
  -- Nur der hardcoded Superadmin kann Rollen einfügen
  auth.uid() = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid
);

-- 6. Einfache Policy für UPDATE
CREATE POLICY "simple_user_role_update" ON public.user_roles
FOR UPDATE USING (
  -- Nur der hardcoded Superadmin kann Rollen aktualisieren
  auth.uid() = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid
);

-- 7. Einfache Policy für DELETE
CREATE POLICY "simple_user_role_delete" ON public.user_roles
FOR DELETE USING (
  -- Nur der hardcoded Superadmin kann Rollen löschen
  auth.uid() = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::uuid
);