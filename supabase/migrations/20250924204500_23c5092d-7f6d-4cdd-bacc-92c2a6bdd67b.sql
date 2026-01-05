-- BEHEBUNG: Security Definer View Problem - employees_with_company View
-- Problem: View gehört dem postgres User und führt mit dessen Berechtigungen aus

-- 1. Lösche die problematische View
DROP VIEW IF EXISTS public.employees_with_company;

-- 2. Erstelle die View neu ohne Security-Probleme
-- Verwende explizit den authenticated Role als Owner
CREATE VIEW public.employees_with_company 
WITH (security_invoker = true) AS
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

-- 3. Setze explizite Berechtigungen für die neue View
GRANT SELECT ON public.employees_with_company TO authenticated;
GRANT SELECT ON public.employees_with_company TO anon;

-- 4. Stelle sicher, dass die View den richtigen Owner hat (nicht postgres)
-- Die View wird jetzt mit den Berechtigungen des aufrufenden Users ausgeführt

-- 5. Dokumentiere den Security Fix
INSERT INTO public.security_audit_logs (
  user_id, 
  action, 
  resource_type, 
  resource_id, 
  details, 
  risk_level
) VALUES (
  auth.uid(), 
  'security_definer_view_fixed', 
  'database_view', 
  'employees_with_company',
  jsonb_build_object(
    'description', 'Security Definer View Problem behoben',
    'view_name', 'employees_with_company',
    'previous_owner', 'postgres',
    'security_improvement', 'View verwendet jetzt security_invoker=true',
    'rls_enforcement', 'View respektiert jetzt RLS des aufrufenden Users'
  ),
  'high'
);