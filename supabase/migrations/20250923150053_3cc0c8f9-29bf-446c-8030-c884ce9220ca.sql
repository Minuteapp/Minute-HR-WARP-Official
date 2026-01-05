-- Kritische Sicherheitskorrekturen - Vereinfachte schrittweise Implementierung

-- 1. Nur die kritischste Sicherheitslücke zuerst: Admin Invitations
-- Diese Tabelle ist aktuell komplett öffentlich zugänglich

-- Drop alle bestehenden unsicheren Policies
DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow creation of admin invitations" ON public.admin_invitations;  
DROP POLICY IF EXISTS "Allow updating admin invitations" ON public.admin_invitations;

-- RLS aktivieren falls nicht schon aktiviert
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Neue sichere Policy: Nur SuperAdmins können admin_invitations sehen und verwalten
CREATE POLICY "admin_invitations_superadmin_only" ON public.admin_invitations
FOR ALL USING (is_superadmin_safe(auth.uid()));

-- 2. Verbesserte sichere Hilfsfunktion erstellen
CREATE OR REPLACE FUNCTION public.get_user_company_id_safe(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT ur.company_id 
  FROM public.user_roles ur 
  WHERE ur.user_id = $1
  LIMIT 1;
$$;