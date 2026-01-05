-- Erstelle eine Funktion um User-ID per E-Mail zu finden
-- Diese Funktion kann von Edge Functions mit Service Role verwendet werden
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
$$;