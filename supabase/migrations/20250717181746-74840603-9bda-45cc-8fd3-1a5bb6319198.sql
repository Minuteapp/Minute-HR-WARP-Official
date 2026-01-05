-- Fix pilot_projects RLS policies to avoid recursion and ensure proper user access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create pilot projects" ON public.pilot_projects;
DROP POLICY IF EXISTS "Users can update their pilot projects" ON public.pilot_projects;
DROP POLICY IF EXISTS "Users can view pilot projects" ON public.pilot_projects;

-- Recreate simple, non-recursive policies
CREATE POLICY "pilot_projects_insert" ON public.pilot_projects
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "pilot_projects_select" ON public.pilot_projects
FOR SELECT USING (
  created_by = auth.uid() 
  OR is_superadmin_safe(auth.uid()) 
  OR is_admin_safe(auth.uid())
);

CREATE POLICY "pilot_projects_update" ON public.pilot_projects
FOR UPDATE USING (
  created_by = auth.uid() 
  OR is_superadmin_safe(auth.uid()) 
  OR is_admin_safe(auth.uid())
);