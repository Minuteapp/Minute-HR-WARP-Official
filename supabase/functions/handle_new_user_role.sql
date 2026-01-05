
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'superadmin'::user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'admin'::user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_company_id uuid;
BEGIN
  -- Get role from user metadata or default to 'employee'
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    v_role := new.raw_user_meta_data->>'role';
  ELSE
    v_role := 'employee';
  END IF;

  -- Get company_id from metadata if available
  BEGIN
    IF new.raw_user_meta_data->>'company_id' IS NOT NULL AND 
       new.raw_user_meta_data->>'company_id' != 'null' AND 
       new.raw_user_meta_data->>'company_id' != '' THEN
      v_company_id := (new.raw_user_meta_data->>'company_id')::uuid;
    ELSE
      v_company_id := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Handle UUID conversion errors by setting to NULL
    v_company_id := NULL;
  END;
  
  -- Debug logging
  RAISE NOTICE 'New user: ID=%, Email=%, Role=%, Company=%', 
    NEW.id, NEW.email, v_role, v_company_id;
  
  -- Insert the role record - CAST the role string to user_role type
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (
    NEW.id, 
    v_role::user_role,
    v_company_id
  );
  
  RETURN NEW;
END;
$$;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_set_role ON auth.users;
CREATE TRIGGER on_auth_user_created_set_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();
