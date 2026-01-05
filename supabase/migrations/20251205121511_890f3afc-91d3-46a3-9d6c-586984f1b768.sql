-- Phase 3: RPC-Funktion für sichere Rollenabfrage (umgeht RLS)
CREATE OR REPLACE FUNCTION get_user_original_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = p_user_id LIMIT 1
$$;