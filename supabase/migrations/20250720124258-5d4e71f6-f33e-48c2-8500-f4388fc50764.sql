-- ========================================
-- KRITISCHE SICHERHEITSVERBESSERUNGEN
-- Phase 1: Database Security Hardening
-- ========================================

-- 1. Sichere Security Audit Logs Tabelle
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB DEFAULT '{}',
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für Performance und Sicherheitsanalysen
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON public.security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_level ON public.security_audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON public.security_audit_logs(ip_address);

-- RLS für Security Audit Logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Nur Superadmins können alle Logs sehen
CREATE POLICY "Superadmins can view all security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (is_superadmin(auth.uid()));

-- Admins können ihre eigenen und Team-Logs sehen  
CREATE POLICY "Admins can view relevant security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (
    is_admin(auth.uid()) AND (
      user_id = auth.uid() OR 
      risk_level IN ('medium', 'high', 'critical')
    )
  );

-- Benutzer können nur ihre eigenen Logs sehen
CREATE POLICY "Users can view their own security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (user_id = auth.uid());

-- System kann Logs erstellen
CREATE POLICY "System can create security logs" ON public.security_audit_logs
  FOR INSERT 
  WITH CHECK (true);

-- 2. Session Management für erweiterte Sicherheit
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invalidated_at TIMESTAMP WITH TIME ZONE,
  invalidated_reason TEXT
);

-- Index für Session Management
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, expires_at);

-- RLS für User Sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT 
  USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- 3. API Rate Limiting Tabelle
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für Rate Limiting
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_ip ON public.api_rate_limits(user_id, ip_address);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_endpoint ON public.api_rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start, window_end);

-- RLS für API Rate Limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" ON public.api_rate_limits
  FOR ALL 
  USING (true);

-- 4. Erweiterte Berechtigung für sensible Operationen
CREATE TABLE IF NOT EXISTS public.sensitive_operations_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  operation_details JSONB NOT NULL DEFAULT '{}',
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_expires_at TIMESTAMP WITH TIME ZONE,
  executed BOOLEAN NOT NULL DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für Sensitive Operations
CREATE INDEX IF NOT EXISTS idx_sensitive_ops_user_id ON public.sensitive_operations_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_ops_type ON public.sensitive_operations_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_sensitive_ops_approval ON public.sensitive_operations_log(requires_approval, approved_at);

-- RLS für Sensitive Operations
ALTER TABLE public.sensitive_operations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sensitive operations" ON public.sensitive_operations_log
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sensitive operations" ON public.sensitive_operations_log
  FOR SELECT 
  USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "System can create sensitive operation logs" ON public.sensitive_operations_log
  FOR INSERT 
  WITH CHECK (true);

-- 5. Sicherheits-Konfiguration pro Unternehmen
CREATE TABLE IF NOT EXISTS public.company_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE,
  password_policy JSONB NOT NULL DEFAULT '{
    "min_length": 8,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_special": true,
    "max_age_days": 90
  }',
  session_timeout_minutes INTEGER NOT NULL DEFAULT 480,
  max_failed_logins INTEGER NOT NULL DEFAULT 5,
  lockout_duration_minutes INTEGER NOT NULL DEFAULT 30,
  require_2fa BOOLEAN NOT NULL DEFAULT false,
  allowed_ip_ranges JSONB DEFAULT '[]',
  security_notifications JSONB NOT NULL DEFAULT '{
    "login_alerts": true,
    "security_changes": true,
    "suspicious_activity": true
  }',
  data_retention_days INTEGER NOT NULL DEFAULT 2555, -- 7 Jahre
  encryption_enabled BOOLEAN NOT NULL DEFAULT true,
  audit_level TEXT NOT NULL DEFAULT 'standard' CHECK (audit_level IN ('minimal', 'standard', 'detailed', 'comprehensive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS für Company Security Settings
ALTER TABLE public.company_security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company security settings access" ON public.company_security_settings
  FOR SELECT 
  USING (
    is_superadmin(auth.uid()) OR
    (is_admin(auth.uid()) AND company_id IN (
      SELECT c.id FROM companies c 
      JOIN user_roles ur ON ur.user_id = auth.uid() 
      WHERE ur.role IN ('admin', 'superadmin')
    ))
  );

CREATE POLICY "Admins can update company security settings" ON public.company_security_settings
  FOR UPDATE 
  USING (
    is_superadmin(auth.uid()) OR
    (is_admin(auth.uid()) AND company_id IN (
      SELECT c.id FROM companies c 
      JOIN user_roles ur ON ur.user_id = auth.uid() 
      WHERE ur.role IN ('admin', 'superadmin')
    ))
  );

-- 6. Automatische Sicherheits-Trigger
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log Zugriff auf sensible Tabellen
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, details, risk_level
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'timestamp', now()
    ),
    CASE 
      WHEN TG_TABLE_NAME IN ('user_roles', 'companies', 'employees') THEN 'high'
      WHEN TG_TABLE_NAME IN ('documents', 'payroll_calculations') THEN 'medium'
      ELSE 'low'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für kritische Tabellen hinzufügen
DROP TRIGGER IF EXISTS log_user_roles_access ON public.user_roles;
CREATE TRIGGER log_user_roles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

DROP TRIGGER IF EXISTS log_companies_access ON public.companies;
CREATE TRIGGER log_companies_access
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- 7. Funktion für Sicherheits-Event-Logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, details
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;