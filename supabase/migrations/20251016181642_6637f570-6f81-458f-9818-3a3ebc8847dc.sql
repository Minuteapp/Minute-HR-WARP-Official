-- Schritt 0: UNIQUE Constraint hinzufügen falls nicht vorhanden
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Schritt 1: Superadmin-Rolle in user_roles erstellen
INSERT INTO public.user_roles (user_id, role, company_id)
VALUES ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 'superadmin', NULL)
ON CONFLICT (user_id, role) DO NOTHING;

-- Schritt 2: is_superadmin_safe mit Fallback aktualisieren
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Primär: Prüfe user_roles Tabelle
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback: Prüfe Auth-Metadaten (für Migration/Backup)
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Schritt 3: Alle Mitarbeiter zurück zur Development Company verschieben
UPDATE employees 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IN (
  'fe235933-3e90-4ce5-a363-a20ea05e8c2f',  -- Hiprocall
  'a581a8b5-3b4d-4ed9-a565-103cd5cdbd44'   -- Minute Labs
);

-- Schritt 4: Tenant-Sessions bereinigen
DELETE FROM user_tenant_sessions 
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2';