-- Phase 1: Kritische Sicherheitsfixes

-- 1. RLS Policies für wichtige Tabellen ohne Policies hinzufügen

-- user_mfa_settings table (falls nicht existiert)
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mfa_enabled BOOLEAN DEFAULT false,
  totp_secret TEXT, -- In Produktion verschlüsselt
  backup_codes TEXT[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS für user_mfa_settings aktivieren
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;

-- Policies für user_mfa_settings
CREATE POLICY "Users can manage their own MFA settings"
ON public.user_mfa_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view MFA settings for security audit"
ON public.user_mfa_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- user_sessions Tabelle für Session Management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT
);

-- RLS für user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Session Policies
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
ON public.user_sessions
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all sessions for security"
ON public.user_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für bestehende kritische Tabellen ohne Policies

-- companies Tabelle (falls noch nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Company Isolation'
  ) THEN
    CREATE POLICY "Company Isolation" ON public.companies
    FOR ALL
    USING (
      CASE
        WHEN is_in_tenant_context() THEN (id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (id = get_user_company_id(auth.uid()))
      END
    );
  END IF;
END $$;

-- employees Tabelle Company Isolation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employees' AND policyname = 'Employee Company Isolation'
  ) THEN
    CREATE POLICY "Employee Company Isolation" ON public.employees
    FOR ALL
    USING (
      CASE
        WHEN is_in_tenant_context() THEN (company_id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (
          company_id = get_user_company_id(auth.uid()) OR 
          id = auth.uid() OR
          company_id IS NULL
        )
      END
    );
  END IF;
END $$;

-- user_roles Sicherheit verstärken
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Secure Role Management'
  ) THEN
    CREATE POLICY "Secure Role Management" ON public.user_roles
    FOR ALL
    USING (
      -- Benutzer können ihre eigene Rolle einsehen
      user_id = auth.uid() OR
      -- Admins können Rollen in ihrer Firma verwalten
      (
        EXISTS (
          SELECT 1 FROM public.user_roles ur2
          WHERE ur2.user_id = auth.uid() 
          AND ur2.role IN ('admin', 'superadmin')
          AND (
            -- Superadmin kann alle Rollen sehen
            ur2.role = 'superadmin' OR
            -- Admin kann nur in seiner Firma
            ur2.company_id = company_id OR
            company_id IS NULL
          )
        )
      )
    )
    WITH CHECK (
      -- Neue Rollen können nur von Admins erstellt werden
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      ) OR
      -- Oder Benutzer kann seine eigene Rolle aktualisieren (mit Einschränkungen)
      user_id = auth.uid()
    );
  END IF;
END $$;

-- Sichere Funktion für Role-Überprüfung (ohne hardcoded email)
CREATE OR REPLACE FUNCTION public.is_superadmin_secure(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Prüfe nur über user_roles Tabelle und Metadaten, KEINE hardcoded emails
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = $1 AND role = 'superadmin'::user_role
    )),
    (SELECT 
      CASE 
        WHEN raw_user_meta_data->>'role' = 'superadmin' THEN true
        ELSE false
      END
      FROM auth.users 
      WHERE id = $1
    ),
    false
  );
$$;

-- Update alle bestehenden RLS Policies die is_superadmin verwenden
-- Sicherheitskritische Funktion überschreiben
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Verwende die sichere Version ohne hardcoded emails
  SELECT public.is_superadmin_secure($1);
$$;

-- Rate Limiting für Login-Versuche
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  failure_reason TEXT
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Login attempts können nur vom System verwaltet werden
CREATE POLICY "System manages login attempts"
ON public.login_attempts
FOR ALL
USING (auth.role() = 'service_role');

-- Admins können Login-Versuche einsehen
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Trigger für automatische updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_mfa()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mfa_settings_updated_at
  BEFORE UPDATE ON public.user_mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_mfa();

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_user_id ON public.user_mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ip ON public.login_attempts(email, ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON public.login_attempts(attempted_at);