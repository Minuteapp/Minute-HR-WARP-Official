-- Sichere Updates für kritische Sicherheitslücken

-- 1. Verbesserte RLS-Richtlinien für user_roles Tabelle
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;

-- Sichere RLS-Richtlinien für user_roles
CREATE POLICY "Users can view their own role" 
ON user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Only superadmins can manage user roles" 
ON user_roles 
FOR ALL 
USING (is_superadmin(auth.uid()));

-- 2. Sichere RLS für companies Tabelle
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmins can view all companies"
ON companies
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "SuperAdmins can manage companies"
ON companies
FOR ALL
USING (is_superadmin(auth.uid()));

-- 3. Sichere Funktion für Benutzer-Company-Zuordnung
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  company_id UUID;
BEGIN
  SELECT ur.company_id INTO company_id
  FROM user_roles ur
  WHERE ur.user_id = $1
  LIMIT 1;
  
  RETURN company_id;
END;
$$;

-- 4. Rate Limiting für Login-Versuche
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, created_at);

-- RLS für login_attempts
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage login attempts" 
ON login_attempts 
FOR ALL 
USING (true);

-- 5. Sichere Passwort-Policy Tabelle
CREATE TABLE IF NOT EXISTS password_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_length INTEGER NOT NULL DEFAULT 8,
  require_uppercase BOOLEAN NOT NULL DEFAULT true,
  require_lowercase BOOLEAN NOT NULL DEFAULT true,
  require_numbers BOOLEAN NOT NULL DEFAULT true,
  require_special_chars BOOLEAN NOT NULL DEFAULT true,
  max_age_days INTEGER DEFAULT 90,
  prevent_reuse_count INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Standard-Passwort-Policy
INSERT INTO password_policies (id, min_length, require_uppercase, require_lowercase, require_numbers, require_special_chars)
VALUES (gen_random_uuid(), 8, true, true, true, true)
ON CONFLICT DO NOTHING;

-- RLS für password_policies
ALTER TABLE password_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage password policies" 
ON password_policies 
FOR ALL 
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "All can view active password policies" 
ON password_policies 
FOR SELECT 
USING (is_active = true);

-- 6. Sichere Session-Verwaltung
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- RLS für user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
ON user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
ON user_sessions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can manage all sessions" 
ON user_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- 7. Verbesserte API Keys Sicherheit
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS allowed_origins TEXT[];

-- 8. Sichere Trigger für Audit-Logging
CREATE OR REPLACE FUNCTION log_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log nur bei wichtigen Tabellen
  IF TG_TABLE_NAME IN ('user_roles', 'companies', 'api_keys') THEN
    INSERT INTO security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id)::text,
      jsonb_build_object(
        'old_values', CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE null END,
        'new_values', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE null END,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger für kritische Tabellen
DROP TRIGGER IF EXISTS audit_user_roles_changes ON user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

DROP TRIGGER IF EXISTS audit_companies_changes ON companies;
CREATE TRIGGER audit_companies_changes
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

DROP TRIGGER IF EXISTS audit_api_keys_changes ON api_keys;
CREATE TRIGGER audit_api_keys_changes
  AFTER INSERT OR UPDATE OR DELETE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();