-- Erstelle Tabelle für Sicherheitsbedrohungen
CREATE TABLE IF NOT EXISTS public.security_threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('brute_force', 'sql_injection', 'xss_attempt', 'unauthorized_access', 'data_breach', 'suspicious_activity')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für security_threats
ALTER TABLE public.security_threats ENABLE ROW LEVEL SECURITY;

-- Nur Admins und Superadmins können Sicherheitsbedrohungen verwalten
CREATE POLICY "Admins can manage security threats"
ON public.security_threats
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Erweitere bestehende security_audit_logs Tabelle falls nötig
ALTER TABLE public.security_audit_logs 
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS browser_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS session_info JSONB DEFAULT '{}';

-- Erstelle Tabelle für Sicherheitseinstellungen pro Benutzer
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  login_notifications BOOLEAN DEFAULT TRUE,
  suspicious_activity_alerts BOOLEAN DEFAULT TRUE,
  data_access_logging BOOLEAN DEFAULT TRUE,
  session_timeout_minutes INTEGER DEFAULT 480, -- 8 Stunden
  allowed_ip_addresses TEXT[],
  blocked_ip_addresses TEXT[],
  security_questions JSONB DEFAULT '[]',
  last_security_review TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für user_security_settings
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur ihre eigenen Sicherheitseinstellungen verwalten
CREATE POLICY "Users can manage their own security settings"
ON public.user_security_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins können alle Sicherheitseinstellungen einsehen (aber nicht ändern)
CREATE POLICY "Admins can view all security settings"
ON public.user_security_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Erstelle Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für security_threats
DROP TRIGGER IF EXISTS update_security_threats_updated_at ON public.security_threats;
CREATE TRIGGER update_security_threats_updated_at
  BEFORE UPDATE ON public.security_threats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger für user_security_settings  
DROP TRIGGER IF EXISTS update_user_security_settings_updated_at ON public.user_security_settings;
CREATE TRIGGER update_user_security_settings_updated_at
  BEFORE UPDATE ON public.user_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Erweiterte Sicherheitsfunktion für IP-Validierung
CREATE OR REPLACE FUNCTION public.is_ip_allowed(p_user_id UUID, p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings RECORD;
BEGIN
  -- Hole Sicherheitseinstellungen des Benutzers
  SELECT allowed_ip_addresses, blocked_ip_addresses
  INTO v_settings
  FROM public.user_security_settings
  WHERE user_id = p_user_id;
  
  -- Wenn keine Einstellungen vorhanden, erlaube Zugriff
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Prüfe Blockliste
  IF v_settings.blocked_ip_addresses IS NOT NULL AND 
     p_ip_address = ANY(v_settings.blocked_ip_addresses) THEN
    RETURN FALSE;
  END IF;
  
  -- Prüfe Zulassungsliste (wenn definiert)
  IF v_settings.allowed_ip_addresses IS NOT NULL AND 
     array_length(v_settings.allowed_ip_addresses, 1) > 0 THEN
    RETURN p_ip_address = ANY(v_settings.allowed_ip_addresses);
  END IF;
  
  -- Standardmäßig erlauben
  RETURN TRUE;
END;
$$;

-- Erweiterte Audit-Funktion für Sicherheitsereignisse
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_log_id UUID;
  v_risk_level TEXT := 'low';
BEGIN
  -- Bestimme Risikostufe basierend auf Aktion
  CASE p_action
    WHEN 'login_failed', 'unauthorized_access', 'suspicious_activity' THEN
      v_risk_level := 'medium';
    WHEN 'brute_force_detected', 'sql_injection_attempt', 'admin_action_failed' THEN
      v_risk_level := 'high';
    WHEN 'data_breach_suspected', 'security_policy_violation' THEN
      v_risk_level := 'critical';
    ELSE
      v_risk_level := 'low';
  END CASE;

  -- Erstelle Audit-Log-Eintrag
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, details, risk_level,
    browser_info, session_info
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_details, v_risk_level,
    COALESCE(p_details->'browser_info', '{}'),
    COALESCE(p_details->'session_info', '{}')
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;