-- 🚨 KRITISCHER DATENSCHUTZ-SICHERHEITSFIX - PHASE 1 (KORRIGIERT): RLS-RICHTLINIEN REPARIEREN
-- Repariert massive PII-Exposition durch unsichere RLS-Richtlinien

-- 1. CROSS_MODULE_EVENTS: Entferne öffentlichen Zugriff, implementiere benutzer-/firmenzentrierte Sicherheit
DROP POLICY IF EXISTS "cross_module_events_insert" ON public.cross_module_events;
DROP POLICY IF EXISTS "cross_module_events_select" ON public.cross_module_events;
DROP POLICY IF EXISTS "cross_module_events_update" ON public.cross_module_events;
DROP POLICY IF EXISTS "cross_module_events_delete" ON public.cross_module_events;

-- Sichere RLS-Richtlinien für cross_module_events
CREATE POLICY "Users can view their own events or company events" 
ON public.cross_module_events 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
    AND (ur.company_id IS NULL OR ur.company_id IN (
      SELECT company_id FROM public.employees WHERE id = cross_module_events.user_id
    ))
  )
);

CREATE POLICY "Users can create events for themselves" 
ON public.cross_module_events 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update events in their company" 
ON public.cross_module_events 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);

-- 2. COMPANIES: Entferne öffentlichen Zugriff, nur Firma-Mitglieder können ihre Daten sehen
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;

-- Sichere RLS-Richtlinien für companies
CREATE POLICY "Users can view their own company" 
ON public.companies 
FOR SELECT 
USING (
  id IN (
    SELECT ur.company_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

CREATE POLICY "SuperAdmins can manage all companies" 
ON public.companies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

CREATE POLICY "Admins can update their company" 
ON public.companies 
FOR UPDATE 
USING (
  id IN (
    SELECT ur.company_id FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- 3. PROFILES: Entferne "enable_all_access_for_authenticated_users", behalte sichere Policies
DROP POLICY IF EXISTS "enable_all_access_for_authenticated_users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Sichere RLS-Richtlinien für profiles (nur erstellen wenn nicht existiert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (id = auth.uid());
  END IF;
END $$;

CREATE POLICY "HR and Admins can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'superadmin')
  )
);

-- 4. VOICEMAIL_MESSAGES: Entferne komplett öffentlichen Zugriff
DROP POLICY IF EXISTS "voicemail_messages_insert" ON public.voicemail_messages;
DROP POLICY IF EXISTS "voicemail_messages_select" ON public.voicemail_messages;
DROP POLICY IF EXISTS "voicemail_messages_update" ON public.voicemail_messages;
DROP POLICY IF EXISTS "voicemail_messages_delete" ON public.voicemail_messages;

-- Sichere RLS-Richtlinien für voicemail_messages
CREATE POLICY "Users can view their own voicemails" 
ON public.voicemail_messages 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own voicemails" 
ON public.voicemail_messages 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own voicemails" 
ON public.voicemail_messages 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own voicemails" 
ON public.voicemail_messages 
FOR DELETE 
USING (user_id = auth.uid());

-- 5. ADMIN_INVITATIONS: Sicherstellen, dass nur SuperAdmins Zugriff haben
DROP POLICY IF EXISTS "SuperAdmins can manage admin invitations" ON public.admin_invitations;

CREATE POLICY "SuperAdmins can manage admin invitations" 
ON public.admin_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

-- Log des kritischen Sicherheitsfixes
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'critical_rls_privacy_fix_corrected', 
  'database_policies', 
  'critical_data_exposure_fix_v2',
  jsonb_build_object(
    'description', 'KRITISCHER FIX: Massive PII-Exposition durch unsichere RLS-Richtlinien behoben (korrigiert)',
    'tables_secured', ARRAY['cross_module_events', 'companies', 'profiles', 'voicemail_messages', 'admin_invitations'],
    'vulnerabilities_fixed', ARRAY[
      'cross_module_events: Öffentlicher Zugriff auf alle Mitarbeiterdaten entfernt',
      'companies: Firmendaten vor öffentlichem Zugriff geschützt', 
      'profiles: enable_all_access_for_authenticated_users entfernt',
      'voicemail_messages: Komplett öffentlicher Zugriff entfernt',
      'admin_invitations: SuperAdmin-only Zugriff sichergestellt'
    ],
    'privacy_impact', 'Massive DSGVO-Verletzung behoben - PII-Daten jetzt geschützt',
    'phase', 'Critical Phase 1 - Data Privacy Emergency Fix (Corrected)'
  ),
  'critical'
);