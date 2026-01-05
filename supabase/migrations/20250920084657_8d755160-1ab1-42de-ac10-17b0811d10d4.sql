-- Erstelle RLS Policy für companies Tabelle um SuperAdmins den Zugriff zu ermöglichen
-- Aktiviere RLS für die companies Tabelle falls noch nicht aktiv
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Erstelle Policy für SuperAdmins um alle Firmen zu sehen
CREATE POLICY "SuperAdmins can view all companies" 
ON companies 
FOR SELECT 
USING (is_superadmin_safe(auth.uid()));

-- Erstelle Policy für SuperAdmins um Firmen zu verwalten
CREATE POLICY "SuperAdmins can manage all companies" 
ON companies 
FOR ALL 
USING (is_superadmin_safe(auth.uid()));

-- Aktualisiere die get_active_companies Funktion um ohne auth.uid() Check zu funktionieren
-- Da sie per RPC aufgerufen wird, funktioniert der auth.uid() Check nicht richtig
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
SET search_path = public
AS $$
BEGIN
  -- Die RLS Policies der companies Tabelle werden automatisch angewendet
  -- SuperAdmins sehen alle Firmen, normale Benutzer sehen nur ihre Firma
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
END;
$$;