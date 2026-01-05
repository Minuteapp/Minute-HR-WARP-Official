-- Aktualisiere set_company_id_from_context() um SuperAdmins ohne company_id zu erlauben
CREATE OR REPLACE FUNCTION public.set_company_id_from_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Wenn company_id bereits gesetzt ist, nichts tun
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Setze company_id auf get_effective_company_id()
  NEW.company_id := get_effective_company_id();
  
  -- Falls NULL und KEIN SuperAdmin: Fehler werfen
  -- SuperAdmins dürfen ohne company_id Datensätze erstellen
  IF NEW.company_id IS NULL AND NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'company_id kann nicht NULL sein. Bitte in Tenant-Modus wechseln oder company_id explizit setzen.';
  END IF;
  
  RETURN NEW;
END;
$$;