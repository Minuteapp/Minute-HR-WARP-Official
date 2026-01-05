-- Sichere Updates für kritische Sicherheitslücken (korrigiert)

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

-- 3. Sichere Funktion für Benutzer-Company-Zuordnung (korrigiert)
DROP FUNCTION IF EXISTS get_user_company_id(uuid);

CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid UUID)
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
  WHERE ur.user_id = user_uuid
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
INSERT INTO password_policies (min_length, require_uppercase, require_lowercase, require_numbers, require_special_chars)
VALUES (8, true, true, true, true)
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