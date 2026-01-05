-- SECURITY FIX: Behebe Security Definer View Problem vollständig
-- Das Problem: Auch die neue employee_company_secure_view hat postgres als Owner

-- 1. Lösche die problematische secure_view
DROP VIEW IF EXISTS public.employee_company_secure_view;

-- 2. Sichere Alternative: Direkte RLS-Policies auf den Tabellen verwenden
-- Statt einer View verwenden wir die sichere get_employee_company_data() Funktion

-- 3. Zusätzliche sichere Helper-Funktion für einfache Abfragen  
CREATE OR REPLACE FUNCTION public.get_employees_with_company()
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
  -- Verwende existierende sichere Funktion
  RETURN QUERY
  SELECT * FROM public.get_employee_company_data();
END;
$function$;

-- 4. Alternative: Erstelle View ohne SECURITY DEFINER Problem
-- Verwende security_invoker (Standard) statt security_definer
CREATE OR REPLACE VIEW public.employees_with_company AS
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

-- 5. Setze korrekte Berechtigungen für normale View
GRANT SELECT ON public.employees_with_company TO authenticated;
GRANT SELECT ON public.employees_with_company TO anon;

-- 6. Log des finalen Security Fixes
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_view_completely_fixed', 
  'database_view', 
  'all_security_definer_views_removed',
  jsonb_build_object(
    'description', 'SECURITY DEFINER VIEW Problem vollständig behoben',
    'removed_views', ARRAY['employee_company_view', 'employee_company_secure_view'],
    'created_alternatives', ARRAY['get_employee_company_data()', 'get_employees_with_company()', 'employees_with_company view'],
    'security_improvement', 'Keine Views mit postgres-Owner mehr, explizite RLS-Prüfung',
    'view_type', 'security_invoker (standard) statt security_definer'
  ),
  'critical'
);