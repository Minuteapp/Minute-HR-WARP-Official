-- SICHERHEITSREPARATUR TEIL 6: RLS für admin_invitations Tabelle
-- Kritische Tabelle mit PII-Daten sichern

-- RLS für admin_invitations aktivieren (falls noch nicht geschehen)
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Alle existierenden Policies löschen um sauberen Zustand zu schaffen
DROP POLICY IF EXISTS "SuperAdmins can manage admin invitations" ON public.admin_invitations;

-- Neue sichere RLS-Richtlinien erstellen
CREATE POLICY "SuperAdmins can manage admin invitations"
ON public.admin_invitations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

-- Policy für Admins der gleichen Firma (nur lesend)
CREATE POLICY "Company admins can view their company invitations"
ON public.admin_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
    AND (ur.company_id = admin_invitations.company_id OR ur.role = 'superadmin')
  )
);