-- 0) Provide helper function used by multiple policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_user_company_id'
  ) THEN
    CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
    RETURNS uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    DECLARE v_company uuid;
    BEGIN
      SELECT ur.company_id INTO v_company
      FROM public.user_roles ur
      WHERE ur.user_id = p_user_id
      LIMIT 1;
      RETURN v_company;
    END; $$;
  END IF;
END $$;

-- 1) Remove unsafe trigger on time_entries if table has no company_id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_time_entries_auto_company_id'
  ) THEN
    DROP TRIGGER trg_time_entries_auto_company_id ON public.time_entries;
  END IF;
END $$;

-- 2) EMPLOYEE CONTRACTS: isolate by company via employees
ALTER TABLE IF EXISTS public.employee_contracts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'employee_contracts' AND policyname = 'Employee contracts company isolation select'
  ) THEN
    CREATE POLICY "Employee contracts company isolation select" ON public.employee_contracts
    FOR SELECT
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
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'employee_contracts' AND policyname = 'Employee contracts company isolation modify'
  ) THEN
    CREATE POLICY "Employee contracts company isolation modify" ON public.employee_contracts
    FOR ALL
    TO authenticated
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
  END IF;
END $$;

-- 3) PAYROLL CALCULATIONS: isolate by employee company
ALTER TABLE IF EXISTS public.payroll_calculations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payroll_calculations' AND policyname = 'Payroll calculations company isolation select'
  ) THEN
    CREATE POLICY "Payroll calculations company isolation select" ON public.payroll_calculations
    FOR SELECT
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
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payroll_calculations' AND policyname = 'Payroll calculations company isolation modify'
  ) THEN
    CREATE POLICY "Payroll calculations company isolation modify" ON public.payroll_calculations
    FOR ALL
    TO authenticated
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
  END IF;
END $$;