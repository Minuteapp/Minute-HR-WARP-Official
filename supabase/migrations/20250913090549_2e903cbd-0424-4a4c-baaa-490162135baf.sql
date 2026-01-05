-- Benutzer zu SuperAdmin machen
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb
WHERE id = 'a039669c-69f0-446b-9487-1c2d447c89ae';

-- Fehlende employee_company_view erstellen
CREATE OR REPLACE VIEW public.employee_company_view AS
SELECT 
  e.id,
  e.name,
  e.first_name,
  e.last_name,
  e.email,
  e.employee_number,
  e.department,
  e.position,
  e.team,
  e.employment_type,
  e.start_date,
  e.status,
  e.company_id,
  c.name as company_name
FROM public.employees e
LEFT JOIN public.companies c ON c.id = e.company_id;