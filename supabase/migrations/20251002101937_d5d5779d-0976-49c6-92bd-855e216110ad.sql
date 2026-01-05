-- SICHERHEITSREPARATUR TEIL 2: Security Definer Functions & RLS (final)

-- Drop und neu erstellen der is_superadmin_safe Function
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid);
CREATE FUNCTION public.is_superadmin_safe(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'superadmin'
  );
END;
$$;

-- Neue Security Definer Functions für rekursive Policy-Fixes
CREATE OR REPLACE FUNCTION public.is_channel_member_safe(channel_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_initiative_team_member_safe(initiative_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM green_initiative_team_members 
    WHERE initiative_id = initiative_uuid AND user_id = user_uuid
  );
$$;

-- companies Policies aktualisieren
DROP POLICY IF EXISTS "Admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Only superadmins can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users view own company" ON public.companies;
DROP POLICY IF EXISTS "Superadmins insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admins update own company" ON public.companies;

CREATE POLICY "Company view by user role"
ON public.companies FOR SELECT
USING (
  id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
  OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "Company insert by superadmin"
ON public.companies FOR INSERT
WITH CHECK (is_superadmin_safe(auth.uid()));

CREATE POLICY "Company update by admin"
ON public.companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);