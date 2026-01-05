-- Schritt 1: Hilfsfunktionen für bessere Tenant-Isolation erstellen

-- Funktion um zu prüfen ob User im echten Tenant-Kontext ist
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tenant_company_id UUID;
BEGIN
  -- Hole aktuelle Tenant-Company aus Session
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true;
  
  -- Wenn Tenant-Company gesetzt ist, sind wir im Tenant-Kontext
  RETURN tenant_company_id IS NOT NULL;
END;
$$;

-- Funktion um die aktuelle Tenant-Company-ID zu bekommen (sicher)
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tenant_company_id UUID;
BEGIN
  -- Hole aktuelle Tenant-Company aus Session
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true;
  
  RETURN tenant_company_id;
END;
$$;

-- Schritt 2: Policies für bessere Datenisolation aktualisieren

-- Companies: Super-Admins können alle sehen, aber nur im Super-Admin-Kontext
-- Im Tenant-Kontext sehen sie nur die spezifische Firma
DROP POLICY IF EXISTS "Company isolation policy" ON public.companies;
CREATE POLICY "Company isolation policy"
ON public.companies
FOR ALL
USING (
  -- Super-Admin kann alle Firmen sehen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context()) 
  OR
  -- Im Tenant-Kontext: nur die spezifische Firma sehen
  (is_in_tenant_context() AND id = get_tenant_company_id_safe())
  OR
  -- Normale Company-Admins sehen nur ihre Firma
  (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = companies.id 
    AND ur.role = 'admin'
  ))
)
WITH CHECK (
  -- Super-Admin kann alle Firmen verwalten, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Normale Company-Admins können nur ihre Firma verwalten
  (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = companies.id 
    AND ur.role = 'admin'
  ))
);

-- Employees: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON public.employees;
CREATE POLICY "Employee Company Isolation - SELECT"
ON public.employees
FOR SELECT
USING (
  -- Super-Admin kann alle Mitarbeiter sehen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Mitarbeiter der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Normale Benutzer sehen nur Mitarbeiter ihrer eigenen Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Benutzer können ihre eigenen Daten sehen
  (id = auth.uid())
);

DROP POLICY IF EXISTS "Employee Company Isolation - INSERT" ON public.employees;
CREATE POLICY "Employee Company Isolation - INSERT"
ON public.employees
FOR INSERT
WITH CHECK (
  -- Super-Admin kann Mitarbeiter anlegen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur für die spezifische Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Normale Company-Admins können nur für ihre Firma Mitarbeiter anlegen
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Employee Company Isolation - UPDATE" ON public.employees;
CREATE POLICY "Employee Company Isolation - UPDATE"
ON public.employees
FOR UPDATE
USING (
  -- Super-Admin kann alle bearbeiten, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Mitarbeiter der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Normale Benutzer nur ihre eigene Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Benutzer können ihre eigenen Daten bearbeiten
  (id = auth.uid())
);

DROP POLICY IF EXISTS "Employee Company Isolation - DELETE" ON public.employees;
CREATE POLICY "Employee Company Isolation - DELETE"
ON public.employees
FOR DELETE
USING (
  -- Super-Admin kann alle löschen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Mitarbeiter der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Normale Company-Admins können nur aus ihrer Firma löschen
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

-- Tasks: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Task Company Isolation - SELECT"
ON public.tasks
FOR SELECT
USING (
  -- Super-Admin kann alle Tasks sehen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Tasks der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Tasks ohne Company-ID können alle sehen (Legacy)
  (company_id IS NULL AND auth.uid() IS NOT NULL)
  OR
  -- Tasks der eigenen Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Selbst erstellte Tasks
  (created_by = auth.uid())
  OR
  -- Zugewiesene Tasks
  (auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])))
);

DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
CREATE POLICY "Task Company Isolation - INSERT"
ON public.tasks
FOR INSERT
WITH CHECK (
  -- Super-Admin kann Tasks für alle Firmen erstellen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur für die spezifische Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Tasks ohne Company-ID (Legacy)
  (company_id IS NULL AND auth.uid() IS NOT NULL)
  OR
  -- Tasks für die eigene Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Benutzer ist der Ersteller
  (created_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Task Company Isolation - UPDATE"
ON public.tasks
FOR UPDATE
USING (
  -- Super-Admin kann alle bearbeiten, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Tasks der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Tasks ohne Company-ID (Legacy)
  (company_id IS NULL AND auth.uid() IS NOT NULL)
  OR
  -- Tasks der eigenen Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Selbst erstellte Tasks
  (created_by = auth.uid())
  OR
  -- Zugewiesene Tasks
  (auth.uid() = ANY (COALESCE(assigned_to, ARRAY[]::uuid[])))
);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Task Company Isolation - DELETE"
ON public.tasks
FOR DELETE
USING (
  -- Super-Admin kann alle löschen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Tasks der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Selbst erstellte Tasks
  (created_by = auth.uid())
  OR
  -- Tasks der eigenen Firma (für Admins)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  ))
);

-- Projects: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON public.projects;
CREATE POLICY "Project Company Isolation - SELECT"
ON public.projects
FOR SELECT
USING (
  -- Super-Admin kann alle Projekte sehen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Projekte der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Projekte der eigenen Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Eigene Projekte
  (owner_id = auth.uid())
  OR
  -- Team-Mitglied
  (auth.uid() = ANY (team_members))
);

DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON public.projects;
CREATE POLICY "Project Company Isolation - INSERT"
ON public.projects
FOR INSERT
WITH CHECK (
  -- Super-Admin kann Projekte für alle Firmen erstellen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur für die spezifische Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Projekte für die eigene Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Benutzer ist der Owner
  (owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Project Company Isolation - UPDATE" ON public.projects;
CREATE POLICY "Project Company Isolation - UPDATE"
ON public.projects
FOR UPDATE
USING (
  -- Super-Admin kann alle bearbeiten, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Projekte der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Projekte der eigenen Firma
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  OR
  -- Eigene Projekte
  (owner_id = auth.uid())
  OR
  -- Team-Mitglied
  (auth.uid() = ANY (team_members))
);

DROP POLICY IF EXISTS "Project Company Isolation - DELETE" ON public.projects;
CREATE POLICY "Project Company Isolation - DELETE"
ON public.projects
FOR DELETE
USING (
  -- Super-Admin kann alle löschen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Projekte der spezifischen Firma
  (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
  OR
  -- Eigene Projekte
  (owner_id = auth.uid())
  OR
  -- Projekte der eigenen Firma (für Admins)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  ))
);

-- Absence Requests: Strikte Firmen-Isolation
DROP POLICY IF EXISTS "Company isolation for absence_requests" ON public.absence_requests;
CREATE POLICY "Absence Company Isolation"
ON public.absence_requests
FOR ALL
USING (
  -- Super-Admin kann alle sehen, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur Abwesenheiten von Mitarbeitern der spezifischen Firma
  (is_in_tenant_context() AND user_id IN (
    SELECT e.id FROM employees e 
    WHERE e.company_id = get_tenant_company_id_safe()
  ))
  OR
  -- Normale Benutzer sehen nur Abwesenheiten ihrer Firma
  (user_id IN (
    SELECT e.id FROM employees e 
    WHERE e.company_id = get_user_company_id(auth.uid()) AND e.company_id IS NOT NULL
  ))
  OR
  -- Eigene Abwesenheitsanträge
  (user_id = auth.uid())
)
WITH CHECK (
  -- Super-Admin kann alle erstellen/bearbeiten, aber nur wenn NICHT im Tenant-Kontext
  (is_superadmin(auth.uid()) AND NOT is_in_tenant_context())
  OR
  -- Im Tenant-Kontext: nur für Mitarbeiter der spezifischen Firma
  (is_in_tenant_context() AND user_id IN (
    SELECT e.id FROM employees e 
    WHERE e.company_id = get_tenant_company_id_safe()
  ))
  OR
  -- Normale Benutzer nur für ihre Firma
  (user_id IN (
    SELECT e.id FROM employees e 
    WHERE e.company_id = get_user_company_id(auth.uid()) AND e.company_id IS NOT NULL
  ))
  OR
  -- Eigene Anträge
  (user_id = auth.uid())
);

-- Entferne veraltete/überflüssige Policies
DROP POLICY IF EXISTS "Benutzer können Tasks bearbeiten" ON public.tasks;
DROP POLICY IF EXISTS "Benutzer können Tasks erstellen" ON public.tasks;
DROP POLICY IF EXISTS "Benutzer können Tasks löschen" ON public.tasks;
DROP POLICY IF EXISTS "Benutzer können alle Tasks sehen" ON public.tasks;

DROP POLICY IF EXISTS "Admins can view all absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Admins can update all absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Admins can create absence requests for others" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can view their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can create their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.absence_requests;