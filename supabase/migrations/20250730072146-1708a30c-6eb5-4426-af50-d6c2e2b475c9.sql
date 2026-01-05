-- Weitere wichtige Tabellen für SuperAdmin-Zugriff

-- Projects Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to projects" ON public.projects;
CREATE POLICY "SuperAdmin full access to projects" 
ON public.projects 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Documents Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to documents" ON public.documents;
CREATE POLICY "SuperAdmin full access to documents" 
ON public.documents 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Goals Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to goals" ON public.goals;
CREATE POLICY "SuperAdmin full access to goals" 
ON public.goals 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Expenses Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to expenses" ON public.expenses;
CREATE POLICY "SuperAdmin full access to expenses" 
ON public.expenses 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));

-- User Roles Tabelle
DROP POLICY IF EXISTS "SuperAdmin full access to user_roles" ON public.user_roles;
CREATE POLICY "SuperAdmin full access to user_roles" 
ON public.user_roles 
FOR ALL 
USING (is_superadmin_safe(auth.uid())) 
WITH CHECK (is_superadmin_safe(auth.uid()));