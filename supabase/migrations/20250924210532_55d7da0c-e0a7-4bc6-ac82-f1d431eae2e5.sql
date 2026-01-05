-- CRITICAL SECURITY FIXES MIGRATION (TYPE CORRECTED)
-- Phase 1: Fix Critical RLS Policy Issues

-- 1. Fix profiles table PII exposure
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create secure profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- 2. Secure absence_requests table
DROP POLICY IF EXISTS "Users can view their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can create their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Admins and HR can manage all absence requests" ON public.absence_requests;

CREATE POLICY "Users can view their own absence requests" 
ON public.absence_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own absence requests" 
ON public.absence_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own absence requests" 
ON public.absence_requests 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins and HR can manage all absence requests" 
ON public.absence_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- 3. Secure employees table with company isolation
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage employees in their company" ON public.employees;

CREATE POLICY "Users can view their own employee record" 
ON public.employees 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Admins can manage employees in their company" 
ON public.employees 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
    AND (ur.company_id = employees.company_id OR ur.role = 'superadmin')
  )
);

-- 4. Secure companies table
DROP POLICY IF EXISTS "Companies are publicly readable" ON public.companies;
DROP POLICY IF EXISTS "Admins can view their own company" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can manage all companies" ON public.companies;

CREATE POLICY "Admins can view their own company" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
    AND (ur.company_id = companies.id OR ur.role = 'superadmin')
  )
);

CREATE POLICY "SuperAdmins can manage all companies" 
ON public.companies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

-- 5. Secure projects table with team-based access (CORRECTED for array type)
DROP POLICY IF EXISTS "Users can view projects they're assigned to" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;

CREATE POLICY "Users can view projects they're assigned to" 
ON public.projects 
FOR SELECT 
USING (
  owner_id = auth.uid() 
  OR auth.uid() = ANY(team_members)
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners and admins can update projects" 
ON public.projects 
FOR UPDATE 
USING (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- 6. Secure admin_invitations - restrict to SuperAdmins only
DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow creation of admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow updating admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "SuperAdmins can manage admin invitations" ON public.admin_invitations;

CREATE POLICY "SuperAdmins can manage admin invitations" 
ON public.admin_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);