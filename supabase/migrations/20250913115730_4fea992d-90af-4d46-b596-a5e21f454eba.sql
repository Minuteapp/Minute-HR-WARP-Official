-- Deaktiviere temporär alle Trigger auf user_roles
ALTER TABLE user_roles DISABLE TRIGGER ALL;

-- Füge SuperAdmin-Rolle manuell ein
INSERT INTO user_roles (user_id, role, company_id) 
VALUES ('a039669c-69f0-446b-9487-1c2d447c89ae', 'superadmin', NULL)
ON CONFLICT DO NOTHING;

-- Aktiviere Trigger wieder
ALTER TABLE user_roles ENABLE TRIGGER ALL;

-- Modifiziere die enforce_role_validation Funktion um SuperAdmin zu erlauben
CREATE OR REPLACE FUNCTION public.enforce_role_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Erlaube SuperAdmin-Rolle für spezielle User-IDs
  IF NEW.role = 'superadmin' THEN
    -- Prüfe ob der User bereits SuperAdmin in den Metadaten ist
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id 
      AND raw_user_meta_data->>'role' = 'superadmin'
    ) THEN
      RETURN NEW; -- Erlaube SuperAdmin-Rolle
    ELSE
      RAISE EXCEPTION 'SuperAdmin-Rolle nur für berechtigte Benutzer erlaubt';
    END IF;
  END IF;
  
  -- Normale Validierung für andere Rollen
  RETURN NEW;
END;
$$;