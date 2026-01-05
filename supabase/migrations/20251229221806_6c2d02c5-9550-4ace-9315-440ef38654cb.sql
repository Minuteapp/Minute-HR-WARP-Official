-- Superadmin Audit Log Table
-- Tracks all superadmin actions for compliance and debugging

CREATE TABLE IF NOT EXISTS public.superadmin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_superadmin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_tenant_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  target_user_id UUID,
  request_payload JSONB,
  response_payload JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_superadmin_audit_log_actor ON public.superadmin_audit_log(actor_superadmin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_audit_log_tenant ON public.superadmin_audit_log(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_audit_log_action ON public.superadmin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_superadmin_audit_log_created ON public.superadmin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.superadmin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read audit logs
CREATE POLICY "Superadmins can view audit logs"
  ON public.superadmin_audit_log
  FOR SELECT
  USING (public.is_superadmin(auth.uid()));

-- No direct inserts from client - only via service role in Edge Function
-- This is enforced by not having an INSERT policy for authenticated users

COMMENT ON TABLE public.superadmin_audit_log IS 'Audit trail for all superadmin actions across tenants';