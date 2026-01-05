-- Migration: Admin-Berechtigungen für Abwesenheits-Modul (Korrigiert)

-- 1. Erstelle Security Definer Function für Admin-Check
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'superadmin')
  )
$$;

-- 2. RLS-Policy für Admins: Zugriff auf alle Abwesenheiten
DROP POLICY IF EXISTS "Admins können alle Abwesenheiten sehen" ON absence_requests;
CREATE POLICY "Admins können alle Abwesenheiten sehen"
ON absence_requests
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_superadmin(auth.uid())
  OR user_id = auth.uid()
);

-- 3. RLS-Policy für Admins: Alle Abwesenheiten genehmigen/ablehnen
DROP POLICY IF EXISTS "Admins können Abwesenheiten genehmigen" ON absence_requests;
CREATE POLICY "Admins können Abwesenheiten genehmigen"
ON absence_requests
FOR UPDATE
TO authenticated
USING (
  public.is_admin_or_superadmin(auth.uid())
  OR user_id = auth.uid()
)
WITH CHECK (
  public.is_admin_or_superadmin(auth.uid())
  OR user_id = auth.uid()
);

-- 4. RLS-Policy für Admins: Abwesenheiten erstellen (für alle Mitarbeiter)
DROP POLICY IF EXISTS "Admins können Abwesenheiten erstellen" ON absence_requests;
CREATE POLICY "Admins können Abwesenheiten erstellen"
ON absence_requests
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_superadmin(auth.uid())
  OR user_id = auth.uid()
);

-- 5. RLS-Policy für Admins: Abwesenheiten löschen
DROP POLICY IF EXISTS "Admins können Abwesenheiten löschen" ON absence_requests;
CREATE POLICY "Admins können Abwesenheiten löschen"
ON absence_requests
FOR DELETE
TO authenticated
USING (
  public.is_admin_or_superadmin(auth.uid())
);