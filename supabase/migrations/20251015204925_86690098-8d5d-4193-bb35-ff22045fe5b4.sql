-- Step 1: Entferne alte Policies
DROP POLICY IF EXISTS "Admins can manage all employees" ON employees;
DROP POLICY IF EXISTS "Users can view all employees" ON employees;
DROP POLICY IF EXISTS "Superadmins can manage all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;