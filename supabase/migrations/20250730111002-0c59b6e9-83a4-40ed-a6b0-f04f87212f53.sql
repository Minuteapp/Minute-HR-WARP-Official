-- KRITISCHER FIX: Erstelle fehlende get_user_company_id Funktion für Datenisolierung

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_company_id UUID;
BEGIN
  -- Hole die company_id des Benutzers aus user_roles
  SELECT company_id INTO user_company_id
  FROM public.user_roles 
  WHERE user_id = $1 
  LIMIT 1;
  
  RETURN user_company_id;
END;
$function$;

-- Prüfe und erstelle Hiprocall GmbH Company ID wenn nicht vorhanden
DO $$
DECLARE
  hiprocall_company_id UUID;
BEGIN
  -- Prüfe ob Hiprocall GmbH existiert
  SELECT id INTO hiprocall_company_id
  FROM public.companies 
  WHERE name = 'Hiprocall GmbH' 
  LIMIT 1;
  
  -- Wenn nicht vorhanden, erstelle sie
  IF hiprocall_company_id IS NULL THEN
    INSERT INTO public.companies (name, address, billing_email, is_active, employee_count)
    VALUES ('Hiprocall GmbH', 'Musterstraße 1, 12345 Musterstadt', 'contact@hiprocall.de', true, 0)
    RETURNING id INTO hiprocall_company_id;
    
    RAISE NOTICE 'Hiprocall GmbH company created with ID: %', hiprocall_company_id;
  END IF;
END $$;

-- WICHTIG: Teste die RLS Policies
-- Zeige aktuellen Benutzer und seine Company
SELECT 
  'Debug Info' as type,
  auth.uid() as current_user_id,
  get_user_company_id(auth.uid()) as user_company_id,
  is_superadmin_safe(auth.uid()) as is_superadmin,
  is_in_tenant_context() as in_tenant_context,
  get_tenant_company_id_safe() as tenant_company_id;