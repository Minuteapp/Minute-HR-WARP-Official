-- Erstelle die user_tenant_sessions Tabelle für Tenant-Context-Management

CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_company_id uuid,
  is_tenant_mode boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinien für user_tenant_sessions
CREATE POLICY "Users can manage their own tenant sessions"
ON public.user_tenant_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- SuperAdmins können alle Tenant-Sessions verwalten
CREATE POLICY "SuperAdmins can manage all tenant sessions"
ON public.user_tenant_sessions
FOR ALL
USING (is_superadmin_safe(auth.uid()))
WITH CHECK (is_superadmin_safe(auth.uid()));

-- Trigger für updated_at
CREATE TRIGGER update_user_tenant_sessions_updated_at
  BEFORE UPDATE ON public.user_tenant_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();