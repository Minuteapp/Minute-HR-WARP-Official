-- SICHERHEITSREPARATUR TEIL 1: Nur companies-Tabelle
-- Einzelne Tabelle um Deadlocks zu vermeiden

DO $$
BEGIN
  -- Prüfe ob companies-Policies bereits existieren
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Users can view their own company'
  ) THEN
    CREATE POLICY "Users can view their own company"
    ON public.companies
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND (ur.company_id = companies.id OR ur.role IN ('admin', 'superadmin'))
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Admins can manage companies'
  ) THEN
    CREATE POLICY "Admins can manage companies"
    ON public.companies
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'superadmin')::user_role[]
      )
    );
  END IF;
END $$;