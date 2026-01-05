-- Fix für Rollenverwaltung: Sichere Validierung bei Registrierung
CREATE OR REPLACE FUNCTION public.validate_user_registration(
  p_email text,
  p_role text,
  p_company_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validiere E-Mail-Format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Ungültiges E-Mail-Format';
  END IF;
  
  -- Validiere Rolle
  IF p_role NOT IN ('employee', 'admin', 'hr', 'manager', 'moderator') THEN
    RAISE EXCEPTION 'Ungültige Rolle: %', p_role;
  END IF;
  
  -- Admin-Rolle nur mit gültiger Firma und Einladung erlaubt
  IF p_role = 'admin' THEN
    IF p_company_id IS NULL THEN
      RAISE EXCEPTION 'Admin-Rolle erfordert eine Firmen-ID';
    END IF;
    
    -- Prüfe ob eine gültige Admin-Einladung existiert
    IF NOT EXISTS (
      SELECT 1 FROM public.admin_invitations ai
      WHERE ai.email = p_email 
      AND ai.company_id = p_company_id
      AND ai.status = 'created'
    ) THEN
      RAISE EXCEPTION 'Keine gültige Admin-Einladung gefunden';
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Trigger für automatische Rollenvalidierung
CREATE OR REPLACE FUNCTION public.enforce_role_validation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validiere neue Rolleneinträge
  IF TG_OP = 'INSERT' THEN
    -- SuperAdmin-Rolle nur für bestimmte Benutzer
    IF NEW.role = 'superadmin' AND NEW.user_id::text != 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' THEN
      RAISE EXCEPTION 'SuperAdmin-Rolle nicht erlaubt';
    END IF;
    
    -- Admin-Rolle ohne Firma nicht erlaubt
    IF NEW.role = 'admin' AND NEW.company_id IS NULL THEN
      RAISE EXCEPTION 'Admin-Rolle erfordert eine Firmen-ID';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger anwenden
DROP TRIGGER IF EXISTS trigger_validate_user_roles ON public.user_roles;
CREATE TRIGGER trigger_validate_user_roles
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_validation();