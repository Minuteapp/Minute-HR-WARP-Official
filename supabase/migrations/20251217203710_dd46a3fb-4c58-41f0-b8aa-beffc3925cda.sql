-- Tasks INSERT Policy anpassen für SuperAdmins ohne Tenant-Modus
DROP POLICY IF EXISTS "Users can create tasks in their company" ON tasks;

CREATE POLICY "Users can create tasks in their company" ON tasks
FOR INSERT 
TO authenticated
WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- Auch UPDATE und DELETE Policies für SuperAdmins anpassen
DROP POLICY IF EXISTS "Users can update tasks in their company" ON tasks;

CREATE POLICY "Users can update tasks in their company" ON tasks
FOR UPDATE
TO authenticated
USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

DROP POLICY IF EXISTS "Users can delete tasks in their company" ON tasks;

CREATE POLICY "Users can delete tasks in their company" ON tasks
FOR DELETE
TO authenticated
USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);