-- log_sensitive_changes Funktion aktualisieren um company_id zu inkludieren
CREATE OR REPLACE FUNCTION public.log_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Versuche company_id aus dem Record zu holen
  IF TG_OP = 'DELETE' THEN
    v_company_id := OLD.company_id;
  ELSE
    v_company_id := NEW.company_id;
  END IF;
  
  -- Fallback: company_id aus user_roles
  IF v_company_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT company_id INTO v_company_id
    FROM user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  -- Nur loggen wenn company_id vorhanden
  IF auth.uid() IS NOT NULL AND v_company_id IS NOT NULL THEN
    INSERT INTO public.sensitive_operations_log (
      user_id, company_id, operation_type, operation_details, created_at
    ) VALUES (
      auth.uid(), v_company_id, TG_OP,
      jsonb_build_object('table_name', TG_TABLE_NAME, 'record_id', COALESCE(NEW.id, OLD.id)),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;