-- Sicherheitskritische Fixes: Phase 1
-- Fix 1: Sichere RLS-Richtlinien für kritische Tabellen ohne Policies

-- Companies-Tabelle RLS
CREATE POLICY "Companies basic access" ON public.companies
FOR SELECT USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE id = get_user_company_id(auth.uid())
  END
);

CREATE POLICY "SuperAdmins can manage companies" ON public.companies
FOR ALL USING (is_superadmin_safe(auth.uid()));

-- Employees-Tabelle RLS  
CREATE POLICY "Employees company isolation" ON public.employees
FOR ALL USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid())
  END
);

-- User_roles-Tabelle RLS
CREATE POLICY "User roles access" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid() OR 
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr')
    AND ur.company_id = user_roles.company_id
  )
);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- Profiles-Tabelle RLS
CREATE POLICY "Profiles access" ON public.profiles
FOR SELECT USING (
  user_id = auth.uid() OR 
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr')
  )
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Time_entries-Tabelle RLS
CREATE POLICY "Time entries user access" ON public.time_entries
FOR ALL USING (
  user_id = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'manager')
  )
);

-- Tasks-Tabelle RLS
CREATE POLICY "Tasks access" ON public.tasks
FOR ALL USING (
  assigned_to = auth.uid() OR
  created_by = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'manager')
  )
);

-- Projects-Tabelle RLS  
CREATE POLICY "Projects access" ON public.projects
FOR ALL USING (
  owner_id = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  team_members::jsonb ? auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'manager')
  )
);

-- Dokumente-Tabelle RLS
CREATE POLICY "Documents access" ON public.documents
FOR ALL USING (
  created_by = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  visibility = 'public' OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr')
  )
);

-- Channels-Tabelle RLS
CREATE POLICY "Channels access" ON public.channels
FOR ALL USING (
  created_by = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  is_channel_member(id, auth.uid())
);

-- Messages-Tabelle RLS
CREATE POLICY "Messages access" ON public.messages
FOR ALL USING (
  sender_id = auth.uid() OR
  is_superadmin_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id = messages.channel_id
    AND is_channel_member(c.id, auth.uid())
  )
);