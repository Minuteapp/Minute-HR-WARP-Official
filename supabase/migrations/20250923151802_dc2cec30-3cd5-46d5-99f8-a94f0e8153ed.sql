-- VOLLSTÄNDIGER PLAN (Fix für Funktionskonflikt)
-- Phase 1: Existierende Funktionen prüfen und Mock-Daten bereinigen

-- 1a. Funktionskonflikt lösen
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid);
DROP FUNCTION IF EXISTS public.is_superadmin_safe();

-- 1b. Alle referenzierenden Daten von Mock-Mitarbeitern löschen
DELETE FROM public.shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com' 
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')
);

DELETE FROM public.absence_requests 
WHERE user_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com'
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')  
);

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com'
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')
);

-- 1c. Mock-Mitarbeiter löschen
DELETE FROM public.employees 
WHERE email LIKE '%@company.com' 
   OR email LIKE '%@mockcompany.com'
   OR email LIKE '%@example.com'
   OR email LIKE '%@demo.com'
   OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson');

-- 1d. Employee-Count korrigieren
UPDATE public.companies 
SET employee_count = (
  SELECT COUNT(*) 
  FROM public.employees e 
  WHERE e.company_id = companies.id 
    AND e.archived = false
);

-- Phase 2: Kritische RLS-Policies

-- RLS für ai_training_data
CREATE POLICY "Admins manage training data" ON public.ai_training_data FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_models (DELETE hinzufügen)
CREATE POLICY "Admins delete models" ON public.ai_models FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_suggestions (DELETE hinzufügen)  
CREATE POLICY "Admins delete suggestions" ON public.ai_suggestions FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_usage_logs (UPDATE hinzufügen)
CREATE POLICY "System updates usage logs" ON public.ai_usage_logs FOR UPDATE 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für arbeitszeit_regelungen
CREATE POLICY "Admins manage arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users read arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR SELECT 
USING (ist_aktiv = true);

-- Phase 3: Audit-Log
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'mock_data_cleanup', 
  'employees', 
  'system_wide',
  jsonb_build_object(
    'description', 'Mock-Daten erfolgreich bereinigt und RLS-Policies implementiert',
    'timestamp', now()
  )
);