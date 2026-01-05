-- Setze SuperAdmin-Rolle für den User in user_roles Tabelle
INSERT INTO user_roles (user_id, role, company_id) 
VALUES ('a039669c-69f0-446b-9487-1c2d447c89ae', 'superadmin', NULL)
ON CONFLICT (user_id, role) DO NOTHING;

-- Erstelle/repariere die get_active_companies RPC-Funktion
CREATE OR REPLACE FUNCTION public.get_active_companies()
RETURNS TABLE(
  id uuid,
  name text,
  address text,
  phone text,
  website text,
  subscription_status company_subscription,
  is_active boolean,
  created_at timestamp with time zone,
  employee_count integer,
  contact_person text,
  billing_email text,
  tax_id text,
  vat_id text,
  slug text,
  logo_url text,
  primary_color text,
  secondary_color text,
  brand_font text,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- SuperAdmins sehen alle Firmen
  IF is_superadmin_safe(auth.uid()) THEN
    RETURN QUERY
    SELECT 
      c.id, c.name, c.address, c.phone, c.website,
      c.subscription_status, c.is_active, c.created_at,
      c.employee_count, c.contact_person, c.billing_email,
      c.tax_id, c.vat_id, c.slug, c.logo_url,
      c.primary_color, c.secondary_color, c.brand_font,
      c.metadata
    FROM companies c
    WHERE c.is_active = true
    ORDER BY c.created_at DESC;
  ELSE
    -- Normale Benutzer sehen nur ihre Firma
    RETURN QUERY
    SELECT 
      c.id, c.name, c.address, c.phone, c.website,
      c.subscription_status, c.is_active, c.created_at,
      c.employee_count, c.contact_person, c.billing_email,
      c.tax_id, c.vat_id, c.slug, c.logo_url,
      c.primary_color, c.secondary_color, c.brand_font,
      c.metadata
    FROM companies c
    JOIN user_roles ur ON ur.company_id = c.id
    WHERE c.is_active = true
      AND ur.user_id = auth.uid()
    ORDER BY c.created_at DESC;
  END IF;
END;
$$;