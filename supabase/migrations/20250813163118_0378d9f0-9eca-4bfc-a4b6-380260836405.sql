-- Migration Korrektur: Datumsformat bei urlaub_verfall_datum
-- ================================================

-- Fix the date format issue
ALTER TABLE public.arbeitszeit_regelungen 
ALTER COLUMN urlaub_verfall_datum SET DEFAULT '2025-03-31'::date;

-- Also fix the uebertragung_bis_datum column
ALTER TABLE public.de_abwesenheitsarten 
ALTER COLUMN uebertragung_bis_datum SET DEFAULT '2025-03-31'::date;

-- Create missing helper function for user company ID
CREATE OR REPLACE FUNCTION get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = $1
    LIMIT 1
  );
END;
$$;

-- Update arbeitszeit_regelungen policies
CREATE POLICY "Company Isolation - arbeitszeit_regelungen" ON public.arbeitszeit_regelungen
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Update abwesenheitsarten policies
CREATE POLICY "Company Isolation - de_abwesenheitsarten" ON public.de_abwesenheitsarten
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Update abwesenheitsantraege policies for company isolation
CREATE POLICY "Company Isolation - de_abwesenheitsantraege" ON public.de_abwesenheitsantraege
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Add company isolation for payroll tables
CREATE POLICY "Company Isolation - lohnsteuer_stammdaten" ON public.de_lohnsteuer_stammdaten
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - sozialversicherung_stammdaten" ON public.de_sozialversicherung_stammdaten
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - lohnabrechnungen" ON public.de_lohnabrechnungen
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - zeitbuchungen" ON public.de_zeitbuchungen
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "Company Isolation - arbeitstage" ON public.de_arbeitstage
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- Add missing auto-assign triggers
CREATE TRIGGER auto_assign_company_arbeitszeit_regelungen
  BEFORE INSERT ON public.arbeitszeit_regelungen
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_abwesenheitsarten
  BEFORE INSERT ON public.de_abwesenheitsarten
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_abwesenheitsantraege
  BEFORE INSERT ON public.de_abwesenheitsantraege
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_lohnsteuer_stammdaten
  BEFORE INSERT ON public.de_lohnsteuer_stammdaten
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_sozialversicherung_stammdaten
  BEFORE INSERT ON public.de_sozialversicherung_stammdaten
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_lohnabrechnungen
  BEFORE INSERT ON public.de_lohnabrechnungen
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_zeitbuchungen
  BEFORE INSERT ON public.de_zeitbuchungen
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();

CREATE TRIGGER auto_assign_company_de_arbeitstage
  BEFORE INSERT ON public.de_arbeitstage
  FOR EACH ROW EXECUTE FUNCTION auto_assign_company_id();