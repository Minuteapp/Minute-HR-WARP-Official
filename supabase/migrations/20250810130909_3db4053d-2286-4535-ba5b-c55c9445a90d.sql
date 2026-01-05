-- Create helper function get_user_company_id only if missing, using safe quoting
DO $$
DECLARE fn_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'get_user_company_id' AND n.nspname = 'public'
  ) INTO fn_exists;

  IF NOT fn_exists THEN
    EXECUTE $ddl$
      CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
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
      $fn$;
    $ddl$;
  END IF;
END $$;

-- Drop unsafe trigger on time_entries (if it exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_time_entries_auto_company_id'
  ) THEN
    DROP TRIGGER trg_time_entries_auto_company_id ON public.time_entries;
  END IF;
END $$;

-- Apply RLS policies guarded by table existence
DO $$
DECLARE tbl_exists boolean;
BEGIN
  -- employee_contracts
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='employee_contracts'
  ) INTO tbl_exists;
  IF tbl_exists THEN
    EXECUTE 'ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_contracts' AND policyname='Employee contracts company isolation select'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Employee contracts company isolation select" ON public.employee_contracts
        FOR SELECT USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        );
      $$;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_contracts' AND policyname='Employee contracts company isolation modify'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Employee contracts company isolation modify" ON public.employee_contracts
        FOR ALL TO authenticated
        USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        )
        WITH CHECK (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        );
      $$;
    END IF;
  END IF;

  -- payroll_calculations
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='payroll_calculations'
  ) INTO tbl_exists;
  IF tbl_exists THEN
    EXECUTE 'ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payroll_calculations' AND policyname='Payroll calculations company isolation select'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Payroll calculations company isolation select" ON public.payroll_calculations
        FOR SELECT USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        );
      $$;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payroll_calculations' AND policyname='Payroll calculations company isolation modify'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Payroll calculations company isolation modify" ON public.payroll_calculations
        FOR ALL TO authenticated
        USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        )
        WITH CHECK (
          CASE
            WHEN is_in_tenant_context() THEN (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe())
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              user_id IN (SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid()))
            )
          END
        );
      $$;
    END IF;
  END IF;
END $$;