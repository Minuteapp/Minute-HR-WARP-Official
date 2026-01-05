-- RLS-POLICIES NUR FÜR TABELLEN OHNE ARRAY-PROBLEME

-- EMPLOYEES TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'employees'
    AND policyname = 'Users can view employees in their company'
  ) THEN
    CREATE POLICY "Users can view employees in their company"
      ON public.employees FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND (role = 'superadmin' OR company_id = employees.company_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'employees'
    AND policyname = 'Admins can manage employees'
  ) THEN
    CREATE POLICY "Admins can manage employees"
      ON public.employees FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr')
        )
      );
  END IF;
END $$;

-- TIME_ENTRIES TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'time_entries'
    AND policyname = 'Users can view their own time entries'
  ) THEN
    CREATE POLICY "Users can view their own time entries"
      ON public.time_entries FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'time_entries'
    AND policyname = 'Users can create their own time entries'
  ) THEN
    CREATE POLICY "Users can create their own time entries"
      ON public.time_entries FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'time_entries'
    AND policyname = 'Users can update their own time entries'
  ) THEN
    CREATE POLICY "Users can update their own time entries"
      ON public.time_entries FOR UPDATE
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr')
        )
      );
  END IF;
END $$;

-- SICK_LEAVES TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'sick_leaves'
    AND policyname = 'Users can view their own sick leaves'
  ) THEN
    CREATE POLICY "Users can view their own sick leaves"
      ON public.sick_leaves FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'sick_leaves'
    AND policyname = 'Users can create their own sick leaves'
  ) THEN
    CREATE POLICY "Users can create their own sick leaves"
      ON public.sick_leaves FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'sick_leaves'
    AND policyname = 'Admins can manage sick leaves'
  ) THEN
    CREATE POLICY "Admins can manage sick leaves"
      ON public.sick_leaves FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr')
        )
      );
  END IF;
END $$;

-- SHIFTS TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'shifts'
    AND policyname = 'Users can view their shifts'
  ) THEN
    CREATE POLICY "Users can view their shifts"
      ON public.shifts FOR SELECT
      USING (
        auth.uid() = employee_id
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'shifts'
    AND policyname = 'Admins can manage shifts'
  ) THEN
    CREATE POLICY "Admins can manage shifts"
      ON public.shifts FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin', 'hr', 'manager')
        )
      );
  END IF;
END $$;

-- NOTIFICATIONS TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notifications'
    AND policyname = 'Users can view their notifications'
  ) THEN
    CREATE POLICY "Users can view their notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notifications'
    AND policyname = 'Users can update their notifications'
  ) THEN
    CREATE POLICY "Users can update their notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notifications'
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;