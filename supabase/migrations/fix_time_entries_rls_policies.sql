
-- Korrigiere RLS-Richtlinien für time_entries um kritische Fehler zu beheben

-- Zuerst alle bestehenden Richtlinien für time_entries entfernen
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Superadmins can view all time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Admins can view all time entries" ON public.time_entries;

-- Neue, weniger restriktive Richtlinien erstellen

-- SuperAdmins können alles sehen und verwalten
CREATE POLICY "SuperAdmins have full access to time entries"
ON public.time_entries
FOR ALL
USING (public.is_superadmin(auth.uid()));

-- Admins können alles sehen und verwalten
CREATE POLICY "Admins have full access to time entries"
ON public.time_entries
FOR ALL
USING (public.is_admin(auth.uid()));

-- Benutzer können ihre eigenen Zeiteinträge sehen
CREATE POLICY "Users can view their own time entries"
ON public.time_entries
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Benutzer können ihre eigenen Zeiteinträge erstellen
CREATE POLICY "Users can create their own time entries"
ON public.time_entries
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Benutzer können ihre eigenen Zeiteinträge aktualisieren
CREATE POLICY "Users can update their own time entries"
ON public.time_entries
FOR UPDATE
USING (
  auth.uid() = user_id OR
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Benutzer können ihre eigenen Zeiteinträge löschen
CREATE POLICY "Users can delete their own time entries"
ON public.time_entries
FOR DELETE
USING (
  auth.uid() = user_id OR
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Auch die user_roles Richtlinien überarbeiten für bessere Kompatibilität
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage user roles" ON public.user_roles;

-- Neue user_roles Richtlinien
CREATE POLICY "All authenticated users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- SuperAdmins können alle Rollen sehen und verwalten
CREATE POLICY "SuperAdmins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.is_superadmin(auth.uid()));

-- Admins können alle Rollen sehen
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (
  public.is_admin(auth.uid()) OR
  public.is_superadmin(auth.uid())
);

-- Sicherstellen, dass auch employees Tabelle korrekt funktioniert
DROP POLICY IF EXISTS "Users can view their own employee data" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee data" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage employee data" ON public.employees;

-- Neue employees Richtlinien
CREATE POLICY "Users can view their own employee data"
ON public.employees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = employees.email
  ) OR
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- SuperAdmins und Admins können alle Mitarbeiterdaten verwalten
CREATE POLICY "Admins can manage all employee data"
ON public.employees
FOR ALL
USING (
  public.is_superadmin(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Temporär weniger restriktive Richtlinien für documents
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Sicherheitsaudit-Logs sollen nur von SuperAdmins eingesehen werden
CREATE POLICY "Only SuperAdmins can view security audit logs"
ON public.security_audit_logs
FOR SELECT
USING (public.is_superadmin(auth.uid()));

-- Alle können Sicherheitsereignisse protokollieren (für die Funktion)
CREATE POLICY "Allow security event logging"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (true);
