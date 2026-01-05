-- Re-apply focused tenant isolation for employees and time_entries only
-- Ensure RLS and policies are in place; avoid dynamic SQL for broader tables

-- EMPLOYEES
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'employees' AND policyname = 'Employees company isolation select'
  ) THEN
    CREATE POLICY "Employees company isolation select" ON public.employees
    FOR SELECT
    USING (
      CASE
        WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE company_id = get_user_company_id(auth.uid())
      END
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'employees' AND policyname = 'Employees company isolation modify'
  ) THEN
    CREATE POLICY "Employees company isolation modify" ON public.employees
    FOR ALL
    TO authenticated
    USING (
      CASE
        WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE company_id = get_user_company_id(auth.uid())
      END
    )
    WITH CHECK (
      CASE
        WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE company_id = get_user_company_id(auth.uid())
      END
    );
  END IF;
END $$;

-- TIME ENTRIES
ALTER TABLE IF EXISTS public.time_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'time_entries' AND policyname = 'Time entries company isolation select'
  ) THEN
    CREATE POLICY "Time entries company isolation select" ON public.time_entries
    FOR SELECT
    USING (
      CASE
        WHEN is_in_tenant_context() THEN (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
          )
        )
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
          )
        )
      END
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'time_entries' AND policyname = 'Time entries company isolation modify'
  ) THEN
    CREATE POLICY "Time entries company isolation modify" ON public.time_entries
    FOR ALL
    TO authenticated
    USING (
      CASE
        WHEN is_in_tenant_context() THEN (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
          )
        )
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
          )
        )
      END
    )
    WITH CHECK (
      CASE
        WHEN is_in_tenant_context() THEN (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
          )
        )
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (
          user_id IN (
            SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
          )
        )
      END
    );
  END IF;
END $$;