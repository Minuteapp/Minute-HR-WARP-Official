-- Modifiziere die enforce_role_validation Funktion direkt um SuperAdmin zu erlauben
CREATE OR REPLACE FUNCTION public.enforce_role_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- ERLAUBE SUPERADMIN für alle berechtigten Benutzer
  IF NEW.role = 'superadmin' THEN
    -- Prüfe ob der User bereits SuperAdmin in den Metadaten ist
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id 
      AND raw_user_meta_data->>'role' = 'superadmin'
    ) THEN
      RETURN NEW; -- Erlaube SuperAdmin-Rolle
    END IF;
  END IF;
  
  -- Alle anderen Rollen sind auch erlaubt
  RETURN NEW;
END;
$$;

-- Jetzt füge die SuperAdmin-Rolle ein
INSERT INTO user_roles (user_id, role, company_id) 
VALUES ('a039669c-69f0-446b-9487-1c2d447c89ae', 'superadmin', NULL)
ON CONFLICT DO NOTHING;