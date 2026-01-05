-- Fix get_active_companies function to bypass RLS for superadmins
-- The function needs SET search_path and proper SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_active_companies()
RETURNS TABLE (
  id uuid,
  name text,
  employee_count bigint,
  subscription_status text,
  is_active boolean,
  slug text,
  address text,
  website text,
  phone text,
  primary_contact_name text,
  primary_contact_email text,
  billing_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user id
  current_user_id := auth.uid();
  
  -- Check if user is superadmin
  IF NOT public.is_superadmin(current_user_id) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.archived = false)::bigint as employee_count,
    c.subscription_status::text,
    c.is_active,
    c.slug,
    c.address,
    c.website,
    c.phone,
    c.primary_contact_name,
    c.primary_contact_email,
    c.billing_email
  FROM companies c
  WHERE c.deleted_at IS NULL
  ORDER BY c.created_at DESC;
END;
$$;