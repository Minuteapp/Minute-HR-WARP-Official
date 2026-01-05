-- Verbessere die get_active_companies Funktion um auch den Slug zu liefern
CREATE OR REPLACE FUNCTION public.get_active_companies()
RETURNS TABLE(
  company_id uuid, 
  company_name text, 
  employee_count integer, 
  subscription_status text, 
  is_active boolean,
  slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    companies.id as company_id,
    companies.name as company_name,
    companies.employee_count,
    companies.subscription_status::text,
    companies.is_active,
    companies.slug
  FROM public.companies
  WHERE companies.is_active = true
  ORDER BY companies.name;
END;
$$;