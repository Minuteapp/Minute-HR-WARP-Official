-- Lösche die 4 alten RLS Policies, die Superadmins alle Mitarbeiter sehen lassen
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_update_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON public.employees;

-- Nur die 4 "Strict company isolation" Policies bleiben bestehen
-- Diese erzwingen: company_id = get_effective_company_id()
-- Superadmins sehen jetzt NUR Mitarbeiter der ausgewählten Firma