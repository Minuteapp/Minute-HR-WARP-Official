-- Helper function get_user_company_id (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'get_user_company_id' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
      RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO public
      AS $fn$
      DECLARE v_company uuid;
      BEGIN
        SELECT ur.company_id INTO v_company
        FROM public.user_roles ur
        WHERE ur.user_id = p_user_id
        LIMIT 1;
        RETURN v_company;
      END;
      $fn$;';
  END IF;
END $$;

-- Drop time_entries trigger if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_time_entries_auto_company_id') THEN
    DROP TRIGGER trg_time_entries_auto_company_id ON public.time_entries;
  END IF;
END $$;

-- employee_contracts policies
DO $$
DECLARE pol_exists boolean; tbl_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='employee_contracts') INTO tbl_exists;
  IF tbl_exists THEN
    EXECUTE 'ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY';

    SELECT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_contracts' AND policyname='Employee contracts company isolation select'
    ) INTO pol_exists;
    IF NOT pol_exists THEN
      EXECUTE 'CREATE POLICY "Employee contracts company isolation select" ON public.employee_contracts FOR SELECT USING (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      )';
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_contracts' AND policyname='Employee contracts company isolation modify'
    ) INTO pol_exists;
    IF NOT pol_exists THEN
      EXECUTE 'CREATE POLICY "Employee contracts company isolation modify" ON public.employee_contracts FOR ALL TO authenticated USING (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      ) WITH CHECK (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      )';
    END IF;
  END IF;
END $$;

-- payroll_calculations policies
DO $$
DECLARE pol_exists boolean; tbl_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payroll_calculations') INTO tbl_exists;
  IF tbl_exists THEN
    EXECUTE 'ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY';

    SELECT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payroll_calculations' AND policyname='Payroll calculations company isolation select'
    ) INTO pol_exists;
    IF NOT pol_exists THEN
      EXECUTE 'CREATE POLICY "Payroll calculations company isolation select" ON public.payroll_calculations FOR SELECT USING (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      )';
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payroll_calculations' AND policyname='Payroll calculations company isolation modify'
    ) INTO pol_exists;
    IF NOT pol_exists THEN
      EXECUTE 'CREATE POLICY "Payroll calculations company isolation modify" ON public.payroll_calculations FOR ALL TO authenticated USING (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      ) WITH CHECK (
        CASE
          WHEN is_in_tenant_context() THEN (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
          )
          WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
          ELSE (
            user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
          )
        END
      )';
    END IF;
  END IF;
END $$;