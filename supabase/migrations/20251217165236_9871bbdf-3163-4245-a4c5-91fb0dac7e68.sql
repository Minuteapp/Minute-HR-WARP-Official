-- =====================================================
-- SUPERADMIN IMPERSONATION/TUNNEL SYSTEM
-- =====================================================

-- 1. Impersonation Sessions Tabelle
CREATE TABLE public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Wer tunnelt
  superadmin_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- In wen wird getunnelt
  target_user_id UUID REFERENCES auth.users(id), -- NULL für Pre-Tenant
  target_tenant_id UUID REFERENCES companies(id),
  
  -- Session-Details
  mode TEXT NOT NULL CHECK (mode IN ('view_only', 'act_as')),
  justification TEXT NOT NULL,
  justification_type TEXT NOT NULL CHECK (justification_type IN ('ticket', 'test_case', 'support', 'debugging', 'other')),
  
  -- Time-Boxing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'ended', 'revoked')),
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  two_factor_verified BOOLEAN DEFAULT false,
  
  -- Pre-Tenant Support
  is_pre_tenant BOOLEAN DEFAULT false,
  setup_state JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices für Performance
CREATE INDEX idx_impersonation_sessions_superadmin ON impersonation_sessions(superadmin_id);
CREATE INDEX idx_impersonation_sessions_target_user ON impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_sessions_target_tenant ON impersonation_sessions(target_tenant_id);
CREATE INDEX idx_impersonation_sessions_active ON impersonation_sessions(status) WHERE status = 'active';
CREATE INDEX idx_impersonation_sessions_expires ON impersonation_sessions(expires_at);

-- 2. Impersonation Audit Logs Tabelle
CREATE TABLE public.impersonation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES impersonation_sessions(id) ON DELETE CASCADE,
  
  -- Wer hat was gemacht
  actor_user_id UUID NOT NULL, -- Der impersonierte User
  performed_by_superadmin_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Aktion
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  
  -- Änderungen (nur bei act_as)
  old_values JSONB,
  new_values JSONB,
  diff JSONB,
  
  -- Kontext
  endpoint TEXT,
  method TEXT,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Risikobewertung
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_impersonation_audit_session ON impersonation_audit_logs(session_id);
CREATE INDEX idx_impersonation_audit_superadmin ON impersonation_audit_logs(performed_by_superadmin_id);
CREATE INDEX idx_impersonation_audit_created ON impersonation_audit_logs(created_at DESC);

-- 3. RLS Policies
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_audit_logs ENABLE ROW LEVEL SECURITY;

-- Nur Superadmins können Sessions sehen/erstellen
CREATE POLICY "superadmin_sessions_policy" ON impersonation_sessions
  FOR ALL USING (is_superadmin_safe(auth.uid()));

CREATE POLICY "superadmin_audit_policy" ON impersonation_audit_logs
  FOR ALL USING (is_superadmin_safe(auth.uid()));

-- 4. RPC: Session starten
CREATE OR REPLACE FUNCTION start_impersonation_session(
  p_target_user_id UUID,
  p_target_tenant_id UUID,
  p_mode TEXT,
  p_justification TEXT,
  p_justification_type TEXT,
  p_duration_minutes INTEGER DEFAULT 30,
  p_is_pre_tenant BOOLEAN DEFAULT false,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_superadmin_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_superadmin_id := auth.uid();
  
  -- Nur Superadmins dürfen
  IF NOT is_superadmin_safe(v_superadmin_id) THEN
    RETURN json_build_object('success', false, 'error', 'Nur Superadmins können Impersonation-Sessions starten');
  END IF;
  
  -- Prüfe ob bereits eine aktive Session existiert
  IF EXISTS (
    SELECT 1 FROM impersonation_sessions 
    WHERE superadmin_id = v_superadmin_id 
    AND status = 'active' 
    AND expires_at > now()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Es existiert bereits eine aktive Session. Bitte diese zuerst beenden.');
  END IF;
  
  -- Berechne Ablaufzeit (max 60 Minuten)
  v_expires_at := now() + (LEAST(p_duration_minutes, 60) || ' minutes')::interval;
  
  -- Session erstellen
  INSERT INTO impersonation_sessions (
    superadmin_id,
    target_user_id,
    target_tenant_id,
    mode,
    justification,
    justification_type,
    expires_at,
    is_pre_tenant,
    ip_address,
    user_agent
  ) VALUES (
    v_superadmin_id,
    p_target_user_id,
    p_target_tenant_id,
    p_mode,
    p_justification,
    p_justification_type,
    v_expires_at,
    p_is_pre_tenant,
    p_ip_address::inet,
    p_user_agent
  ) RETURNING id INTO v_session_id;
  
  -- Initiales Audit-Log
  INSERT INTO impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    action,
    resource_type,
    resource_id,
    new_values
  ) VALUES (
    v_session_id,
    COALESCE(p_target_user_id, v_superadmin_id),
    v_superadmin_id,
    'session_started',
    'impersonation_session',
    v_session_id::text,
    json_build_object(
      'mode', p_mode,
      'justification', p_justification,
      'target_tenant_id', p_target_tenant_id,
      'target_user_id', p_target_user_id,
      'duration_minutes', p_duration_minutes
    )::jsonb
  );
  
  RETURN json_build_object(
    'success', true,
    'session_id', v_session_id,
    'expires_at', v_expires_at
  );
END;
$$;

-- 5. RPC: Session beenden
CREATE OR REPLACE FUNCTION end_impersonation_session(
  p_session_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_superadmin_id UUID;
  v_session RECORD;
BEGIN
  v_superadmin_id := auth.uid();
  
  -- Session holen
  SELECT * INTO v_session 
  FROM impersonation_sessions 
  WHERE id = p_session_id AND superadmin_id = v_superadmin_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session nicht gefunden');
  END IF;
  
  IF v_session.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Session ist bereits beendet');
  END IF;
  
  -- Session beenden
  UPDATE impersonation_sessions 
  SET status = 'ended', ended_at = now(), updated_at = now()
  WHERE id = p_session_id;
  
  -- Audit-Log
  INSERT INTO impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    action,
    resource_type,
    resource_id
  ) VALUES (
    p_session_id,
    COALESCE(v_session.target_user_id, v_superadmin_id),
    v_superadmin_id,
    'session_ended',
    'impersonation_session',
    p_session_id::text
  );
  
  RETURN json_build_object('success', true);
END;
$$;

-- 6. RPC: Aktive Session abrufen
CREATE OR REPLACE FUNCTION get_active_impersonation_session()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_target_user RECORD;
  v_target_tenant RECORD;
BEGIN
  -- Aktive Session suchen
  SELECT * INTO v_session 
  FROM impersonation_sessions 
  WHERE superadmin_id = auth.uid() 
  AND status = 'active' 
  AND expires_at > now()
  ORDER BY started_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('active', false);
  END IF;
  
  -- User-Infos
  IF v_session.target_user_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data->>'full_name' as full_name INTO v_target_user
    FROM auth.users WHERE id = v_session.target_user_id;
  END IF;
  
  -- Tenant-Infos
  IF v_session.target_tenant_id IS NOT NULL THEN
    SELECT name INTO v_target_tenant
    FROM companies WHERE id = v_session.target_tenant_id;
  END IF;
  
  RETURN json_build_object(
    'active', true,
    'session_id', v_session.id,
    'mode', v_session.mode,
    'target_user_id', v_session.target_user_id,
    'target_user_email', v_target_user.email,
    'target_user_name', v_target_user.full_name,
    'target_tenant_id', v_session.target_tenant_id,
    'target_tenant_name', v_target_tenant.name,
    'started_at', v_session.started_at,
    'expires_at', v_session.expires_at,
    'is_pre_tenant', v_session.is_pre_tenant,
    'justification', v_session.justification
  );
END;
$$;

-- 7. RPC: Aktion loggen
CREATE OR REPLACE FUNCTION log_impersonation_action(
  p_session_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_session RECORD;
  v_diff JSONB;
  v_risk_level TEXT := 'low';
BEGIN
  -- Session holen
  SELECT * INTO v_session FROM impersonation_sessions WHERE id = p_session_id;
  
  IF NOT FOUND OR v_session.status != 'active' THEN
    RAISE EXCEPTION 'Ungültige oder inaktive Session';
  END IF;
  
  -- Diff berechnen wenn beide Werte vorhanden
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    v_diff := p_new_values;
  END IF;
  
  -- Risikobewertung
  IF p_action IN ('delete', 'bulk_delete', 'permission_change', 'role_change') THEN
    v_risk_level := 'high';
  ELSIF p_action IN ('update', 'create') THEN
    v_risk_level := 'medium';
  END IF;
  
  -- Log erstellen
  INSERT INTO impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    diff,
    endpoint,
    method,
    risk_level
  ) VALUES (
    p_session_id,
    COALESCE(v_session.target_user_id, v_session.superadmin_id),
    v_session.superadmin_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    v_diff,
    p_endpoint,
    p_method,
    v_risk_level
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 8. RPC: Session verlängern
CREATE OR REPLACE FUNCTION extend_impersonation_session(
  p_session_id UUID,
  p_additional_minutes INTEGER DEFAULT 15
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_new_expires TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_session 
  FROM impersonation_sessions 
  WHERE id = p_session_id AND superadmin_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session nicht gefunden');
  END IF;
  
  -- Max 60 Minuten ab jetzt
  v_new_expires := LEAST(
    v_session.expires_at + (p_additional_minutes || ' minutes')::interval,
    now() + interval '60 minutes'
  );
  
  UPDATE impersonation_sessions 
  SET expires_at = v_new_expires, updated_at = now()
  WHERE id = p_session_id;
  
  -- Audit
  INSERT INTO impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    action,
    resource_type,
    new_values
  ) VALUES (
    p_session_id,
    COALESCE(v_session.target_user_id, v_session.superadmin_id),
    v_session.superadmin_id,
    'session_extended',
    'impersonation_session',
    json_build_object('new_expires_at', v_new_expires, 'additional_minutes', p_additional_minutes)::jsonb
  );
  
  RETURN json_build_object('success', true, 'new_expires_at', v_new_expires);
END;
$$;

-- 9. Trigger: Auto-Expire Sessions
CREATE OR REPLACE FUNCTION expire_old_impersonation_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE impersonation_sessions 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Kommentare
COMMENT ON TABLE impersonation_sessions IS 'Speichert Superadmin Impersonation/Tunnel Sessions für Support und Debugging';
COMMENT ON TABLE impersonation_audit_logs IS 'Vollständiges Audit-Log aller Aktionen während einer Impersonation Session';
COMMENT ON FUNCTION start_impersonation_session IS 'Startet eine neue Impersonation Session für einen Superadmin';
COMMENT ON FUNCTION end_impersonation_session IS 'Beendet eine aktive Impersonation Session';
COMMENT ON FUNCTION get_active_impersonation_session IS 'Gibt die aktive Session des aktuellen Superadmins zurück';
COMMENT ON FUNCTION log_impersonation_action IS 'Protokolliert eine Aktion während einer Impersonation Session';