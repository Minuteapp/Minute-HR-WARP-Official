-- =============================================================================
-- COMPREHENSIVE RLS SECURITY FIX
-- Schließt alle kritischen Datenlecks durch qual:true Policies
-- =============================================================================

-- =============================================================================
-- SCHRITT 1: Neue Security-Funktionen für Act-As / Effective Identity
-- =============================================================================

-- 1.1 Prüft ob aktueller User in einer Act-As Session ist
CREATE OR REPLACE FUNCTION public.is_acting_as()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.impersonation_sessions
    WHERE admin_user_id = auth.uid()
      AND mode = 'act_as'
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- 1.2 Gibt die effektive User-ID zurück (target_user_id bei Act-As, sonst auth.uid())
CREATE OR REPLACE FUNCTION public.get_effective_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  -- Prüfe auf aktive Act-As Session
  SELECT target_user_id INTO target_id
  FROM public.impersonation_sessions
  WHERE admin_user_id = auth.uid()
    AND mode = 'act_as'
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF target_id IS NOT NULL THEN
    RETURN target_id;
  END IF;
  
  RETURN auth.uid();
END;
$$;

-- 1.3 Mandanten-scoped Rollenprüfung
CREATE OR REPLACE FUNCTION public.has_role_in_company(
  _user_id uuid,
  _company_id uuid,
  _roles text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role::text = ANY(_roles)
  );
END;
$$;

-- =============================================================================
-- SCHRITT 2: ALLE gefährlichen qual:true SELECT Policies entfernen
-- =============================================================================

-- absence_requests
DROP POLICY IF EXISTS "Users can view absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.absence_requests;

-- time_entries
DROP POLICY IF EXISTS "Users can view time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.time_entries;
DROP POLICY IF EXISTS "Authenticated users can read time entries" ON public.time_entries;

-- employees
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;

-- business_trips
DROP POLICY IF EXISTS "Users can view business trips" ON public.business_trips;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.business_trips;

-- employee_benefits
DROP POLICY IF EXISTS "Users can view employee benefits" ON public.employee_benefits;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_benefits;

-- employee_documents
DROP POLICY IF EXISTS "Users can view employee documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_documents;

-- employee_warnings
DROP POLICY IF EXISTS "Users can view employee warnings" ON public.employee_warnings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_warnings;

-- chats
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Users can view chats" ON public.chats;

-- profiles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view user roles" ON public.user_roles;

-- companies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;

-- departments
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Users can view departments" ON public.departments;

-- locations
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Users can view locations" ON public.locations;

-- teams
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams" ON public.teams;

-- notifications
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Users can view notifications" ON public.notifications;

-- tickets
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.tickets;
DROP POLICY IF EXISTS "Users can view tickets" ON public.tickets;

-- projects
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;

-- tasks
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;

-- documents
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents" ON public.documents;

-- =============================================================================
-- SCHRITT 3: Sichere SELECT Policies hinzufügen
-- =============================================================================

-- time_entries: Nur eigene Einträge ODER Admin/HR/Manager im gleichen Mandanten
DROP POLICY IF EXISTS "time_entries_select_own_or_manager" ON public.time_entries;
CREATE POLICY "time_entries_select_own_or_manager" ON public.time_entries
FOR SELECT USING (
  user_id = get_effective_user_id()
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'manager', 'superadmin'])
);

-- employees: Nur eigener Eintrag ODER Admin/HR/Manager im gleichen Mandanten
DROP POLICY IF EXISTS "employees_select_own_or_manager" ON public.employees;
CREATE POLICY "employees_select_own_or_manager" ON public.employees
FOR SELECT USING (
  user_id = get_effective_user_id()
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'manager', 'superadmin'])
);

-- chats: Nur wenn man Teilnehmer ist oder Ersteller
DROP POLICY IF EXISTS "chats_select_participant" ON public.chats;
CREATE POLICY "chats_select_participant" ON public.chats
FOR SELECT USING (
  created_by = get_effective_user_id()
  OR get_effective_user_id() = ANY(participants)
);

-- profiles: Nur eigenes Profil (profiles hat keine company_id)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (
  id = get_effective_user_id()
);

-- user_roles: Nur eigene Rollen ODER Admin im gleichen Mandanten
DROP POLICY IF EXISTS "user_roles_select_own_or_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
FOR SELECT USING (
  user_id = get_effective_user_id()
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'superadmin'])
);

-- companies: Nur eigener Mandant
DROP POLICY IF EXISTS "companies_select_own" ON public.companies;
CREATE POLICY "companies_select_own" ON public.companies
FOR SELECT USING (
  id = get_effective_company_id()
);

-- departments: Nur eigener Mandant
DROP POLICY IF EXISTS "departments_select_company" ON public.departments;
CREATE POLICY "departments_select_company" ON public.departments
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- locations: Nur eigener Mandant
DROP POLICY IF EXISTS "locations_select_company" ON public.locations;
CREATE POLICY "locations_select_company" ON public.locations
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- teams: Nur eigener Mandant
DROP POLICY IF EXISTS "teams_select_company" ON public.teams;
CREATE POLICY "teams_select_company" ON public.teams
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- notifications: Nur eigene Benachrichtigungen
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
FOR SELECT USING (
  user_id = get_effective_user_id()
);

-- tickets: Nur eigene oder zugewiesene Tickets ODER Support-Rolle
DROP POLICY IF EXISTS "tickets_select_own_or_assigned" ON public.tickets;
CREATE POLICY "tickets_select_own_or_assigned" ON public.tickets
FOR SELECT USING (
  created_by = get_effective_user_id()
  OR assigned_to = get_effective_user_id()
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'support', 'superadmin'])
);

-- projects: Nur eigener Mandant
DROP POLICY IF EXISTS "projects_select_company" ON public.projects;
CREATE POLICY "projects_select_company" ON public.projects
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- tasks: Nur eigener Mandant
DROP POLICY IF EXISTS "tasks_select_company" ON public.tasks;
CREATE POLICY "tasks_select_company" ON public.tasks
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- documents: Nur eigener Mandant
DROP POLICY IF EXISTS "documents_select_company" ON public.documents;
CREATE POLICY "documents_select_company" ON public.documents
FOR SELECT USING (
  company_id = get_effective_company_id()
);

-- business_trips: Nur eigene ODER Admin/HR im Mandanten
DROP POLICY IF EXISTS "business_trips_select_own_or_hr" ON public.business_trips;
CREATE POLICY "business_trips_select_own_or_hr" ON public.business_trips
FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = get_effective_user_id())
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'manager', 'superadmin'])
);

-- employee_benefits: Nur eigene (über employee_id lookup)
DROP POLICY IF EXISTS "employee_benefits_select_own_or_hr" ON public.employee_benefits;
CREATE POLICY "employee_benefits_select_own_or_hr" ON public.employee_benefits
FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = get_effective_user_id())
  OR employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE has_role_in_company(get_effective_user_id(), e.company_id, ARRAY['admin', 'hr', 'superadmin'])
  )
);

-- employee_documents: Nur eigene (über employee_id lookup)
DROP POLICY IF EXISTS "employee_documents_select_own_or_hr" ON public.employee_documents;
CREATE POLICY "employee_documents_select_own_or_hr" ON public.employee_documents
FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = get_effective_user_id())
  OR employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE has_role_in_company(get_effective_user_id(), e.company_id, ARRAY['admin', 'hr', 'superadmin'])
  )
);

-- employee_warnings: Nur HR/Admin im Mandanten
DROP POLICY IF EXISTS "employee_warnings_select_hr_only" ON public.employee_warnings;
CREATE POLICY "employee_warnings_select_hr_only" ON public.employee_warnings
FOR SELECT USING (
  has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'superadmin'])
);

-- absence_requests: Nur eigene ODER HR/Admin/Manager im Mandanten
DROP POLICY IF EXISTS "absence_requests_select_own_or_manager" ON public.absence_requests;
CREATE POLICY "absence_requests_select_own_or_manager" ON public.absence_requests
FOR SELECT USING (
  user_id = get_effective_user_id()
  OR has_role_in_company(get_effective_user_id(), company_id, ARRAY['admin', 'hr', 'manager', 'superadmin'])
);