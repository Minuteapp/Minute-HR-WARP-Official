
-- ===== SCHRITT 1: ALLE ALTEN POLICIES LÖSCHEN =====

-- Alte Policies auf employees
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Admins and HR view company employees" ON employees;
DROP POLICY IF EXISTS "Admins and HR insert employees" ON employees;
DROP POLICY IF EXISTS "Admins and HR update company employees" ON employees;
DROP POLICY IF EXISTS "Superadmins can delete employees" ON employees;
DROP POLICY IF EXISTS "Employees view own profile" ON employees;

-- Alte Policies auf time_entries
DROP POLICY IF EXISTS "Allow all authenticated users to manage time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins can manage all time entries" ON time_entries;
DROP POLICY IF EXISTS "SuperAdmins can manage all time entries" ON time_entries;
DROP POLICY IF EXISTS "HR can view all time entries" ON time_entries;
DROP POLICY IF EXISTS "Enable read for users own entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can manage own time entries" ON time_entries;
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can read own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "own_time_entries_delete" ON time_entries;
DROP POLICY IF EXISTS "own_time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "own_time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "own_time_entries_update" ON time_entries;

-- Alte Policy auf user_tenant_sessions
DROP POLICY IF EXISTS "SECURITY DEFINER functions full access" ON user_tenant_sessions;

-- ===== SCHRITT 2: NEUE POLICIES FÜR USER_TENANT_SESSIONS =====

-- Neue permissive Policies für user_tenant_sessions
CREATE POLICY "user_tenant_sessions_select_own"
  ON user_tenant_sessions FOR SELECT
  USING (user_id = auth.uid() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "user_tenant_sessions_insert_own"
  ON user_tenant_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "user_tenant_sessions_update_own"
  ON user_tenant_sessions FOR UPDATE
  USING (user_id = auth.uid() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "user_tenant_sessions_delete_own"
  ON user_tenant_sessions FOR DELETE
  USING (user_id = auth.uid() OR is_superadmin_safe(auth.uid()));
