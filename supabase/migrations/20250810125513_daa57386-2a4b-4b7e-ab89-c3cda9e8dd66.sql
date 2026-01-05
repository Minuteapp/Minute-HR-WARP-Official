-- Strengthen tenant isolation: add/select RLS policies for core tables
-- Note: Uses existing helper functions: is_in_tenant_context(), get_tenant_company_id_safe(),
--       get_user_company_id(uuid), is_superadmin_safe(uuid)

-- 1) EMPLOYEES: Restrict visibility to current tenant/company
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

-- Allow admins/superadmins to manage employees within their company in tenant mode
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

-- 2) TIME ENTRIES: Restrict via employees.company_id
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

-- 3) TASKS: Restrict by assigned_to via employees.company_id if column exists
-- Safe-guard: only create policy if table exists and column assigned_to exists
DO $$ DECLARE
  v_exists boolean;
  v_col_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='tasks'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='tasks' AND column_name='assigned_to'
      INTO v_col_exists;

    EXECUTE 'ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY';

    IF v_col_exists AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'Tasks company isolation select'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Tasks company isolation select" ON public.tasks
        FOR SELECT
        USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              assigned_to IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
              )
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              assigned_to IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
              )
            )
          END
        );
      $$;
    END IF;
  END IF;
END $$;

-- 4) DOCUMENTS: Restrict by owner/employee relation if owner_id exists
DO $$ DECLARE
  v_exists boolean;
  v_owner_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='documents'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='documents' AND column_name='owner_id'
      INTO v_owner_exists;

    EXECUTE 'ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY';

    IF v_owner_exists AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Documents company isolation select'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Documents company isolation select" ON public.documents
        FOR SELECT
        USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              owner_id IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
              )
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              owner_id IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
              )
            )
          END
        );
      $$;
    END IF;
  END IF;
END $$;

-- 5) PROJECTS: Restrict by owner_id/team members if available; prefer owner_id if exists
DO $$ DECLARE
  v_exists boolean;
  v_owner_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='projects'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='projects' AND column_name='owner_id'
      INTO v_owner_exists;

    EXECUTE 'ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY';

    IF v_owner_exists AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Projects company isolation select'
    ) THEN
      EXECUTE $$
        CREATE POLICY "Projects company isolation select" ON public.projects
        FOR SELECT
        USING (
          CASE
            WHEN is_in_tenant_context() THEN (
              owner_id IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_tenant_company_id_safe()
              )
            )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE (
              owner_id IN (
                SELECT e.id FROM public.employees e WHERE e.company_id = get_user_company_id(auth.uid())
              )
            )
          END
        );
      $$;
    END IF;
  END IF;
END $$;
