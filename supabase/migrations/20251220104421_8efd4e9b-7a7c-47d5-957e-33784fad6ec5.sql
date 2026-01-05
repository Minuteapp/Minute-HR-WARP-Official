-- Lösche alte Funktion und erstelle neu mit echter Mitarbeiterzählung
DROP FUNCTION IF EXISTS public.get_active_companies();

CREATE FUNCTION public.get_active_companies()
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  website text,
  phone text,
  employee_count bigint,
  subscription_status text,
  is_active boolean,
  primary_contact_name text,
  primary_contact_email text,
  billing_email text,
  created_at timestamptz
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
    RETURN;
  END IF;
  
  -- Gib alle Firmen zurück mit ECHTER Mitarbeiterzählung aus employees-Tabelle
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.address,
    c.website,
    c.phone,
    (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.archived = false)::bigint as employee_count,
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