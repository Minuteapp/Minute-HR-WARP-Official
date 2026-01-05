-- Erstelle eine einfache RPC-Funktion um Session-Variablen zu setzen
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_company_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Setze die Session-Variable
  PERFORM set_config('app.tenant_company_id', tenant_company_id, true);
END;
$$;