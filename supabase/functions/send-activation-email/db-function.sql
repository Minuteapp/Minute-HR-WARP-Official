
-- This is a file to document the DB function needed
-- You would need to run this SQL in your Supabase SQL editor:

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the email exists in auth.users
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;
