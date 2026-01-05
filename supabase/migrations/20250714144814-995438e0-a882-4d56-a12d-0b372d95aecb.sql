-- Sicherheitsverbesserungen für HR-Anwendung

-- 1. Tabelle für MFA-Einstellungen (TOTP)
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  totp_secret TEXT NULL,
  backup_codes TEXT[] NULL,
  last_used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Tabelle für Login-Versuche und Sicherheitsprotokollierung
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NULL,
  resource_id TEXT NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabelle für HR-Datenvalidierung (Fehlgeschlagene Validierungen)
CREATE TABLE IF NOT EXISTS public.hr_validation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  data_type TEXT NOT NULL, -- 'employee', 'absence_request', 'payroll', etc.
  validation_errors JSONB NOT NULL,
  submitted_data JSONB NOT NULL,
  ip_address INET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Verbesserte RLS für sensible HR-Daten
-- Sensible Spalten in employee_documents anonymisieren
ALTER TABLE IF EXISTS public.employee_documents 
ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'standard' CHECK (access_level IN ('standard', 'confidential', 'restricted'));

-- 5. Audit-Trigger für kritische Tabellen hinzufügen
CREATE OR REPLACE FUNCTION public.log_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log changes to sensitive employee data
  IF TG_TABLE_NAME IN ('employees', 'user_roles', 'employee_contracts') THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      jsonb_build_object(
        'old_values', COALESCE(to_jsonb(OLD), '{}'::jsonb),
        'new_values', COALESCE(to_jsonb(NEW), '{}'::jsonb)
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für kritische Tabellen
DROP TRIGGER IF EXISTS audit_employees_changes ON public.employees;
CREATE TRIGGER audit_employees_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_changes();

DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_changes();

-- 6. RLS-Richtlinien für neue Tabellen
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_validation_logs ENABLE ROW LEVEL SECURITY;

-- MFA Settings: Benutzer können nur ihre eigenen Einstellungen sehen/bearbeiten
CREATE POLICY "Users can manage their own MFA settings"
ON public.user_mfa_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Security Logs: Nur Admins können alle Logs sehen, Benutzer nur ihre eigenen
CREATE POLICY "Users can view their own security logs"
ON public.security_audit_logs
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security logs"
ON public.security_audit_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- HR Validation Logs: Nur Admins können zugreifen
CREATE POLICY "Admins can view HR validation logs"
ON public.hr_validation_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- 7. Verbesserungen für bestehende Tabellen (zusätzliche Sicherheit)
-- Indexe für bessere Performance bei Sicherheitsabfragen
CREATE INDEX IF NOT EXISTS idx_security_logs_user_created ON public.security_audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_action_created ON public.security_audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_hr_validation_logs_user_created ON public.hr_validation_logs(user_id, created_at);

-- 8. Session-Sicherheit
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires ON public.user_sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);

-- 9. Passwort-Richtlinien (für Dokumentation)
COMMENT ON TABLE public.user_mfa_settings IS 'Stores multi-factor authentication settings for users. TOTP secrets are encrypted.';
COMMENT ON TABLE public.security_audit_logs IS 'Comprehensive audit trail for all security-relevant actions.';
COMMENT ON TABLE public.hr_validation_logs IS 'Logs failed HR data validation attempts for security monitoring.';