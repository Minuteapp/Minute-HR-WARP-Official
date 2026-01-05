-- Firmen-Erstellung Problem beheben: Sicherstellen dass neue Firmen keine Daten übernehmen
-- Problem: Neue Firmen übernehmen Daten der aktuellen Firma

-- Funktion für saubere Firmen-Erstellung ohne Datenübernahme
CREATE OR REPLACE FUNCTION public.create_clean_company(
  p_name text,
  p_address text,
  p_billing_email text,
  p_phone text,
  p_website text,
  p_subscription_status text,
  p_tax_id text,
  p_vat_id text,
  p_contact_person text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_company_id UUID;
  valid_subscription company_subscription;
  base_slug TEXT;
  unique_slug TEXT;
  existing_company_count INTEGER;
BEGIN
  -- Nur SuperAdmins können neue Firmen erstellen
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur SuperAdmins können neue Firmen erstellen';
  END IF;

  -- Convert the text subscription status to the enum type
  valid_subscription := p_subscription_status::company_subscription;
  
  -- Generiere einen einzigartigen Slug für die neue Firma
  base_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9 ]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Prüfe ob der Slug bereits existiert
  SELECT COUNT(*) INTO existing_company_count
  FROM companies 
  WHERE slug = base_slug;
  
  -- Wenn Slug existiert, füge eine eindeutige ID hinzu
  IF existing_company_count > 0 THEN
    unique_slug := base_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  ELSE
    unique_slug := base_slug;
  END IF;
  
  -- Erstelle die neue Firma OHNE Datenübernahme - komplett sauber
  INSERT INTO companies (
    name,
    slug,
    address,
    billing_email,
    phone,
    website,
    subscription_status,
    tax_id,
    vat_id,
    contact_person,
    is_active,
    employee_count,
    -- Alle anderen Felder bewusst NULL/Standard lassen
    logo_url,
    primary_color,
    secondary_color,
    brand_font,
    metadata
  ) VALUES (
    p_name,
    unique_slug,
    p_address,
    p_billing_email,
    p_phone,
    p_website,
    valid_subscription,
    p_tax_id,
    p_vat_id,
    p_contact_person,
    true,
    0,
    -- Explizit NULL setzen damit keine Daten übernommen werden
    NULL,
    NULL,
    NULL,
    NULL,
    '{}'::jsonb
  )
  RETURNING id INTO new_company_id;
  
  -- Log der Erstellung für Auditierung
  INSERT INTO public.security_audit_logs (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), 
    'company_created', 
    'company', 
    new_company_id::text,
    jsonb_build_object(
      'company_name', p_name,
      'created_by_superadmin', true
    )
  );
  
  RETURN new_company_id;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Invalid subscription status: %. Must be one of: free, basic, premium, enterprise', p_subscription_status;
END;
$function$;