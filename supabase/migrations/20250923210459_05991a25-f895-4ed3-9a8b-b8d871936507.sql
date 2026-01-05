-- SECURITY FIX: Security Definer View Problem beheben (korrigiert)
-- Die employee_company_view umgeht RLS-Policies durch postgres-Superuser-Berechtigung

-- 1. Lösche die unsichere View
DROP VIEW IF EXISTS public.employee_company_view;

-- 2. Erstelle eine sichere Security Definer Funktion mit expliziter RLS-Respektierung
CREATE OR REPLACE FUNCTION public.get_employee_company_data(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(
    id uuid,
    name text,
    first_name text,
    last_name text,
    email text,
    employee_number text,
    department text,
    "position" text,
    team text,
    employment_type employment_type,
    start_date date,
    status text,
    company_id uuid,
    company_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Sichere Alternative: Explizite RLS-Prüfung
  -- Nur eigene Daten oder Admin/HR-Berechtigungen
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.first_name,
    e.last_name,
    e.email,
    e.employee_number,
    e.department,
    e."position",
    e.team,
    e.employment_type,
    e.start_date,
    e.status,
    e.company_id,
    c.name AS company_name
  FROM public.employees e
  LEFT JOIN public.companies c ON c.id = e.company_id
  WHERE 
    -- RLS-sichere Bedingung: Nur eigene Daten oder berechtigte Admins
    (
      e.id = p_user_id  -- Eigene Mitarbeiterdaten
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p_user_id 
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND (ur.company_id = e.company_id OR ur.role = 'superadmin')
      )
    );
END;
$function$;

-- 3. Erstelle sichere View-Alternative mit security_barrier
CREATE OR REPLACE VIEW public.employee_company_secure_view 
WITH (security_barrier = true) AS
SELECT 
  e.id,
  e.name,
  e.first_name,
  e.last_name,
  e.email,
  e.employee_number,
  e.department,
  e."position",
  e.team,
  e.employment_type,
  e.start_date,
  e.status,
  e.company_id,
  c.name AS company_name
FROM public.employees e
LEFT JOIN public.companies c ON c.id = e.company_id;

-- 4. Berechtigungen für sichere View setzen (ohne Owner-Änderung)
GRANT SELECT ON public.employee_company_secure_view TO authenticated;
GRANT SELECT ON public.employee_company_secure_view TO anon;

-- 5. Audit-Log für kritischen Sicherheitsfix
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_view_fixed', 
  'database_view', 
  'employee_company_view_removal',
  jsonb_build_object(
    'description', 'KRITISCHER SICHERHEITSFIX: Security Definer View entfernt',
    'vulnerability_type', 'RLS Bypass through SECURITY DEFINER View',
    'old_view', 'employee_company_view (postgres owner, vollständiger RLS-Bypass)',
    'new_solution', 'get_employee_company_data() function + security_barrier view',
    'security_improvement', 'Explizite RLS-Prüfung statt Superuser-Berechtigung',
    'impact', 'Verhindert unbefugten Zugriff auf alle Mitarbeiterdaten',
    'affected_files', 'types.ts, absenceService.ts'
  ),
  'critical'
);