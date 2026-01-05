
-- =====================================================
-- PHASE 4 SCHRITT 1: ERSTELLE ACTIVE_TENANT_SESSIONS TABELLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.active_tenant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impersonated_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '8 hours'),
  reason TEXT,
  UNIQUE(session_user_id, impersonated_company_id)
);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_active_tenant_sessions_user ON public.active_tenant_sessions(session_user_id) WHERE is_active = true;

-- RLS aktivieren
ALTER TABLE public.active_tenant_sessions ENABLE ROW LEVEL SECURITY;
