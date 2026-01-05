-- SICHERHEITSREPARATUR TEIL 1: Kritische RLS-Policies für PII-Tabellen

-- 1. admin_invitations - E-Mail und persönliche Daten schützen
DROP POLICY IF EXISTS "SuperAdmins can manage admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Company admins can view their company invitations" ON public.admin_invitations;

CREATE POLICY "Only superadmins view invitations"
ON public.admin_invitations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Only superadmins insert invitations"
ON public.admin_invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Only superadmins update invitations"
ON public.admin_invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Only superadmins delete invitations"
ON public.admin_invitations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- 2. profiles - Benutzerdaten schützen
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- 3. cross_module_events - Mitarbeiterdaten schützen
CREATE POLICY "Users view own events"
ON public.cross_module_events FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Admins insert events"
ON public.cross_module_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin', 'hr')
  )
);