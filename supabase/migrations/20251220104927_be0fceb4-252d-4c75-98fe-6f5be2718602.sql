-- Fix get_active_companies() function with explicit cast for subscription_status ENUM
DROP FUNCTION IF EXISTS public.get_active_companies();

CREATE FUNCTION public.get_active_companies()
RETURNS TABLE (
  id uuid,
  name text,
  employee_count bigint,
  subscription_status text,
  is_active boolean,
  slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is superadmin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'superadmin'
  ) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.archived = false)::bigint as employee_count,
    c.subscription_status::text,  -- Explicit cast from ENUM to text
    c.is_active,
    c.slug
  FROM companies c
  WHERE c.deleted_at IS NULL
  ORDER BY c.created_at DESC;
END;
$$;