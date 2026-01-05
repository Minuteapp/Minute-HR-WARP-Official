-- ========================================
-- KRITISCHE SICHERHEITSVERBESSERUNGEN - Phase 1
-- Schritt 1: Grundlegende Sicherheitstabellen
-- ========================================

-- 1. Erweiterte Security Audit Logs Tabelle (falls noch nicht vorhanden)
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
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risiko-Level Spalte hinzufügen falls nicht vorhanden
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'security_audit_logs' 
                   AND column_name = 'risk_level') THEN
        ALTER TABLE public.security_audit_logs 
        ADD COLUMN risk_level TEXT DEFAULT 'low';
        
        ALTER TABLE public.security_audit_logs 
        ADD CONSTRAINT check_risk_level 
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
    END IF;
END $$;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON public.security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_level ON public.security_audit_logs(risk_level);

-- RLS aktivieren
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies bereinigen und neu erstellen
DROP POLICY IF EXISTS "Superadmins can view all security logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Admins can view relevant security logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "System can create security logs" ON public.security_audit_logs;

CREATE POLICY "Superadmins can view all security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (is_superadmin(auth.uid()));

CREATE POLICY "Admins can view relevant security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (
    is_admin(auth.uid()) AND (
      user_id = auth.uid() OR 
      risk_level IN ('medium', 'high', 'critical')
    )
  );

CREATE POLICY "Users can view their own security logs" ON public.security_audit_logs
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can create security logs" ON public.security_audit_logs
  FOR INSERT 
  WITH CHECK (true);

-- 2. Session Management Tabelle
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '8 hours'),
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

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT 
  USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "System can manage sessions" ON public.user_sessions
  FOR ALL 
  USING (true);