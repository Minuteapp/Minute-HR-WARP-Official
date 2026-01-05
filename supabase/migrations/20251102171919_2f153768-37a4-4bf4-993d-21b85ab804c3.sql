-- SCHRITT 3: Trigger-Funktion erstellen
CREATE OR REPLACE FUNCTION auto_set_company_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := get_effective_company_id();
    
    IF NEW.company_id IS NULL AND NOT is_superadmin_safe(auth.uid()) THEN
      RAISE EXCEPTION 'company_id kann nicht NULL sein. Bitte Firma auswählen.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;