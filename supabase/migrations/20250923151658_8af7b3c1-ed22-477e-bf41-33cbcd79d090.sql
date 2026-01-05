-- VOLLSTÄNDIGER SICHERHEITS- UND DATENBEREINIGUNGSPLAN (Korrigiert)
-- Phase 1: Mock-Daten systematisch bereinigen

-- 1a. Zuerst alle referenzierenden Daten von Mock-Mitarbeitern löschen
DELETE FROM public.shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com'
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')
);

-- 1b. Weitere referenzierende Tabellen bereinigen
DELETE FROM public.absence_requests 
WHERE user_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com'
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')
);

-- 1c. User roles von Mock-Mitarbeitern entfernen
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM public.employees 
  WHERE email LIKE '%@company.com' 
     OR email LIKE '%@mockcompany.com'
     OR email LIKE '%@example.com'
     OR email LIKE '%@demo.com'
     OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson')
);

-- 1d. Jetzt Mock-Mitarbeiter sicher löschen
DELETE FROM public.employees 
WHERE email LIKE '%@company.com' 
   OR email LIKE '%@mockcompany.com'
   OR email LIKE '%@example.com'
   OR email LIKE '%@demo.com'
   OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson');

-- 1e. Employee-Count für alle Firmen korrekt setzen
UPDATE public.companies 
SET employee_count = (
  SELECT COUNT(*) 
  FROM public.employees e 
  WHERE e.company_id = companies.id 
    AND e.archived = false
);

-- Phase 2: Kritische RLS-Policies implementieren

-- Sicherheitsfunktionen zuerst definieren
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'superadmin' FROM user_roles WHERE user_id = user_uuid LIMIT 1),
    false
  );
$$;

-- RLS für ai_training_data (komplett fehlend)
CREATE POLICY "Admins manage training data" ON public.ai_training_data FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_models (DELETE Policy hinzufügen)
CREATE POLICY "Admins delete models" ON public.ai_models FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_suggestions (DELETE Policy hinzufügen)
CREATE POLICY "Admins delete suggestions" ON public.ai_suggestions FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_usage_logs (UPDATE Policy hinzufügen)
CREATE POLICY "System updates usage logs" ON public.ai_usage_logs FOR UPDATE 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für arbeitszeit_regelungen (komplett fehlend)
CREATE POLICY "Admins manage arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users read arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR SELECT 
USING (ist_aktiv = true);

-- Phase 3: System-Validierung und Audit-Log
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'system_cleanup_completed', 
  'database', 
  'full_security_implementation',
  jsonb_build_object(
    'description', 'Mock-Daten bereinigt und kritische RLS-Policies implementiert',
    'mock_employees_removed', true,
    'foreign_keys_handled', true,
    'employee_counts_corrected', true,
    'timestamp', now()
  )
);