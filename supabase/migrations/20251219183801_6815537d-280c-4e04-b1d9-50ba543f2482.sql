-- 1. Alte Funktion löschen
DROP FUNCTION IF EXISTS get_active_companies();

-- 2. Separate SELECT-Policy für SuperAdmins
DROP POLICY IF EXISTS "superadmins_can_select_all_companies" ON companies;
CREATE POLICY "superadmins_can_select_all_companies" 
ON companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'superadmin'
  )
);

-- 3. Neue RPC-Funktion die RLS umgeht (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_active_companies()
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  website TEXT,
  phone TEXT,
  employee_count INTEGER,
  subscription_status TEXT,
  is_active BOOLEAN,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  billing_email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe ob User SuperAdmin ist
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'superadmin'
  ) THEN
    RETURN; -- Leere Ergebnisse für nicht-SuperAdmins
  END IF;
  
  -- Gib alle Firmen zurück (nicht gelöscht)
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.address,
    c.website,
    c.phone,
    c.employee_count,
    c.subscription_status,
    c.is_active,
    c.primary_contact_name,
    c.primary_contact_email,
    c.billing_email,
    c.created_at
  FROM companies c
  WHERE c.deleted_at IS NULL
  ORDER BY c.created_at DESC;
END;
$$;