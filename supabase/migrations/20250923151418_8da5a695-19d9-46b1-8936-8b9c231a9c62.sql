-- VOLLSTÄNDIGER SICHERHEITS- UND DATENBEREINIGUNGSPLAN
-- Phase 1: Mock-Daten bereinigen und Employee-Count korrigieren

-- 1. Mock-Mitarbeiter mit @company.com E-Mails löschen
DELETE FROM public.employees 
WHERE email LIKE '%@company.com' 
   OR email LIKE '%@mockcompany.com'
   OR email LIKE '%@example.com'
   OR email LIKE '%@demo.com'
   OR name IN ('Tom Weber', 'Anna Schmidt', 'Michael Johnson', 'Sarah Wilson');

-- 2. Employee-Count für alle Firmen korrekt setzen
UPDATE public.companies 
SET employee_count = (
  SELECT COUNT(*) 
  FROM public.employees e 
  WHERE e.company_id = companies.id 
    AND e.archived = false
);

-- Phase 2: Kritische RLS-Policies implementieren

-- RLS für api_keys (fehlt komplett)
CREATE POLICY "Superadmins manage API keys" ON public.api_keys FOR ALL 
USING (is_superadmin_safe(auth.uid()));

-- RLS für ai_alerts (erweitern)
CREATE POLICY "Users see relevant alerts" ON public.ai_alerts FOR SELECT 
USING (
  affected_user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- RLS für ai_automations (erweitern)  
CREATE POLICY "Users read automations" ON public.ai_automations FOR SELECT 
USING (true);

CREATE POLICY "Admins manage automations" ON public.ai_automations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Admins update automations" ON public.ai_automations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_compliance_audits (erweitern)
CREATE POLICY "Users read compliance audits" ON public.ai_compliance_audits FOR SELECT 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin', 'employee')));

-- RLS für ai_cost_tracking (erweitern)
CREATE POLICY "Users read cost tracking" ON public.ai_cost_tracking FOR SELECT 
USING (true);

-- RLS für ai_forecasts (erweitern)
CREATE POLICY "Users read forecasts" ON public.ai_forecasts FOR SELECT 
USING (true);

-- RLS für ai_models (erweitern - DELETE fehlt)
CREATE POLICY "Admins delete models" ON public.ai_models FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_suggestions (erweitern - DELETE fehlt)
CREATE POLICY "Admins delete suggestions" ON public.ai_suggestions FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_team_approvals (bereits vorhanden)

-- RLS für ai_training_data (komplett fehlend)
CREATE POLICY "Admins manage training data" ON public.ai_training_data FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für ai_usage_logs (erweitern - UPDATE/DELETE fehlen)
CREATE POLICY "System updates usage logs" ON public.ai_usage_logs FOR UPDATE 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

-- RLS für accessibility_settings (erweitern)
CREATE POLICY "Users read accessibility settings" ON public.accessibility_settings FOR SELECT 
USING (true);

-- RLS für approval_workflows (bereits vorhanden)

-- RLS für arbeitszeit_modelle (bereits vorhanden)

-- RLS für arbeitszeit_regelungen (komplett fehlend)
CREATE POLICY "Admins manage arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users read arbeitszeit regelungen" ON public.arbeitszeit_regelungen FOR SELECT 
USING (ist_aktiv = true);

-- RLS für abwesenheitsarten (bereits vorhanden)

-- Weitere kritische Tabellen ohne RLS prüfen und absichern
-- Diese Funktion hilft bei Multi-Tenant-Isolation
CREATE OR REPLACE FUNCTION public.get_user_company_id_safe(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Sicherheitsfunktion für Tenant-Kontext
CREATE OR REPLACE FUNCTION public.is_in_tenant_context_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_tenant_sessions 
    WHERE user_id = auth.uid() AND is_tenant_mode = true
  );
$$;

-- Tenant Company ID Funktion
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_company_id FROM user_tenant_sessions 
  WHERE user_id = auth.uid() AND is_tenant_mode = true 
  LIMIT 1;
$$;

-- Superadmin-Prüfung sicherer machen
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

-- Phase 3: System-Validierung
-- Log der Bereinigung für Audit-Zwecke
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'system_cleanup', 
  'database', 
  'full_security_implementation',
  jsonb_build_object(
    'description', 'Vollständige Implementierung des Sicherheits- und Datenbereinigungsplans',
    'mock_data_cleaned', true,
    'rls_policies_implemented', true,
    'employee_counts_corrected', true,
    'timestamp', now()
  )
);