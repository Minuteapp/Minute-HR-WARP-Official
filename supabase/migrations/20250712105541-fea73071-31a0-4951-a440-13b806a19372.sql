-- Sicherheitsfix 1: Mapbox-Token-Tabelle erstellen und Edge Function für sicheren Token-Abruf
CREATE TABLE IF NOT EXISTS public.mapbox_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_token text NOT NULL DEFAULT 'pk.your_mapbox_public_token_here',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Initiale Standardkonfiguration einfügen
INSERT INTO public.mapbox_settings (public_token) 
VALUES ('pk.your_mapbox_public_token_here')
ON CONFLICT DO NOTHING;

-- RLS aktivieren
ALTER TABLE public.mapbox_settings ENABLE ROW LEVEL SECURITY;

-- Richtlinie: Alle können die öffentlichen Token lesen
CREATE POLICY "Everyone can read public mapbox tokens"
ON public.mapbox_settings
FOR SELECT
USING (true);

-- Richtlinie: Nur SuperAdmins können Token verwalten
CREATE POLICY "Only superadmins can manage mapbox tokens"
ON public.mapbox_settings
FOR ALL
USING (public.is_superadmin(auth.uid()));

-- Sicherheitsfix 2: Verbesserte Audit-Logs für Benutzerverwaltung
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Richtlinie: Nur SuperAdmins können Security-Logs einsehen
CREATE POLICY "Only superadmins can view security logs"
ON public.security_audit_logs
FOR SELECT
USING (public.is_superadmin(auth.uid()));

-- Richtlinie: System kann Logs erstellen
CREATE POLICY "System can create security logs"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (true);

-- Sicherheitsfix 3: Verbesserte RLS-Richtlinien für user_roles
-- Bestehende Richtlinien entfernen und durch sichere ersetzen
DROP POLICY IF EXISTS "All authenticated users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "SuperAdmins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Neue sichere Richtlinien
CREATE POLICY "Users can view their own role only"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- SuperAdmins können alle Rollen verwalten (aber nur mit Audit-Log)
CREATE POLICY "SuperAdmins can manage all user roles with audit"
ON public.user_roles
FOR ALL
USING (public.is_superadmin(auth.uid()));

-- Admins können nur Rollen lesen, nicht ändern
CREATE POLICY "Admins can view user roles"
ON public.user_roles
FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_superadmin(auth.uid())
);

-- Trigger für Audit-Logging bei Rollenänderungen
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(), 
      'role_changed', 
      'user_role', 
      NEW.user_id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_user', NEW.user_id
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(), 
      'role_assigned', 
      'user_role', 
      NEW.user_id::text,
      jsonb_build_object(
        'role', NEW.role,
        'target_user', NEW.user_id
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, resource_type, resource_id, details
    ) VALUES (
      auth.uid(), 
      'role_removed', 
      'user_role', 
      OLD.user_id::text,
      jsonb_build_object(
        'role', OLD.role,
        'target_user', OLD.user_id
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen
CREATE TRIGGER audit_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();