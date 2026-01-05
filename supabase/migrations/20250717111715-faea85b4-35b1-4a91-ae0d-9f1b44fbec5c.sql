-- Erstelle Security Definer Funktionen um die rekursive RLS zu vermeiden

-- Funktion um die Rolle eines Benutzers zu ermitteln
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- Funktion um zu prüfen ob ein Benutzer Admin ist
CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role IN ('admin', 'superadmin')
  );
$$;

-- Funktion um zu prüfen ob ein Benutzer Superadmin ist
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role = 'superadmin'
  );
$$;

-- Lösche alle bestehenden RLS Policies für user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;

-- Erstelle neue sichere RLS Policies für user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  user_id = auth.uid() OR 
  auth.uid() IN (
    SELECT ur.user_id FROM public.user_roles ur 
    WHERE ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  auth.uid() IN (
    SELECT ur.user_id FROM public.user_roles ur 
    WHERE ur.role = 'superadmin'
  )
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT ur.user_id FROM public.user_roles ur 
    WHERE ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT ur.user_id FROM public.user_roles ur 
    WHERE ur.role IN ('admin', 'superadmin')
  )
);