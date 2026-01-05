-- Migration: Development-Firma für Superadmin anlegen
-- Schritt 1: Development-Firma erstellen (falls nicht vorhanden)
INSERT INTO public.companies (
  id,
  name,
  slug,
  is_active,
  employee_count,
  subscription_status,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Feste UUID für Development
  'Development',
  'development',
  true,
  0,
  'enterprise',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Schritt 2: Prüfe ob Superadmin bereits user_roles Eintrag hat
DO $$
DECLARE
  v_existing_role_count INT;
BEGIN
  -- Zähle existierende Einträge
  SELECT COUNT(*) INTO v_existing_role_count
  FROM public.user_roles
  WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
  AND role = 'superadmin';
  
  IF v_existing_role_count = 0 THEN
    -- Neuer Eintrag
    INSERT INTO public.user_roles (
      user_id,
      role,
      company_id,
      created_at
    ) VALUES (
      'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2',
      'superadmin',
      '00000000-0000-0000-0000-000000000001',
      NOW()
    );
  ELSE
    -- Update existierender Eintrag
    UPDATE public.user_roles
    SET 
      company_id = '00000000-0000-0000-0000-000000000001',
      updated_at = NOW()
    WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'
    AND role = 'superadmin';
  END IF;
END $$;

-- Schritt 3: get_effective_company_id() anpassen
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_company_id uuid;
  v_user_company_id uuid;
BEGIN
  -- Wenn im Tenant-Modus: Return tenant_company_id
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM user_tenant_sessions
  WHERE user_id = auth.uid() AND is_tenant_mode = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  IF v_tenant_company_id IS NOT NULL THEN
    RETURN v_tenant_company_id;
  END IF;
  
  -- Sonst: Return company_id aus user_roles
  -- (funktioniert für Superadmins UND normale Admins)
  SELECT company_id INTO v_user_company_id
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_user_company_id;
END;
$function$;