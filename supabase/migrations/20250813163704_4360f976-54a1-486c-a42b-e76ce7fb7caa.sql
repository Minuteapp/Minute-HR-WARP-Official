-- ================================================
-- SPRINT 1: Policies Fix und Setup
-- ================================================

-- Lösche und erstelle die Funktion neu
DROP FUNCTION IF EXISTS get_user_company_id(uuid);

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

-- Company Isolation Policies (falls nicht existieren)
DO $$ BEGIN
  CREATE POLICY "Company Isolation - departments" ON public.departments
  FOR ALL USING (
    CASE 
      WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
      ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
    END
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Company Isolation - positions" ON public.positions
  FOR ALL USING (
    CASE 
      WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
      ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
    END
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Company Isolation - hr_cases" ON public.hr_cases
  FOR ALL USING (
    CASE 
      WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
      ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
    END
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Company Isolation - arbeitszeit_regelungen" ON public.arbeitszeit_regelungen
  FOR ALL USING (
    CASE 
      WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
      ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
    END
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Company Isolation - de_abwesenheitsarten" ON public.de_abwesenheitsarten
  FOR ALL USING (
    CASE 
      WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
      WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
      ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
    END
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Employee access policies for German tables
DO $$ BEGIN
  CREATE POLICY "Employee Access - de_abwesenheitsantraege" ON public.de_abwesenheitsantraege
  FOR ALL USING (
    mitarbeiter_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr', 'superadmin'))
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;