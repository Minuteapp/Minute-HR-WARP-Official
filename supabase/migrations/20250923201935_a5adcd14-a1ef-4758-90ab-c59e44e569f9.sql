-- KRITISCHE SICHERHEITSFIX #1: Öffentliche Profile-Zugriffe entfernen
-- Diese Policy stellt das größte Sicherheitsrisiko dar

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Neue sichere Policy nur für authentifizierte Benutzer
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

-- Log der kritischen Sicherheitsreparatur
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'critical_security_fix_profiles', 
  'rls_policy', 
  'profiles',
  '{"description": "Removed public access to profiles table", "severity": "critical"}'::jsonb,
  'critical'
);