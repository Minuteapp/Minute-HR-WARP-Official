-- PHASE 2: Function Security Fixes Only (to avoid table deadlocks)
-- Update critical functions with proper search paths

-- Update is_superadmin function with search path
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check user_roles table first (primary method)
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback to metadata check (backup method)
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = $1 AND raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update is_admin function with search path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'admin'::user_role
  );
END;
$$;