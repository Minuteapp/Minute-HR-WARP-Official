-- SICHERHEITSREPARATUR TEIL 2 (FINAL): Nur bestätigte Tabellenstrukturen
-- Fokus auf existierende Spalten

-- 1. profiles: Benutzerdaten schützen (bestätigt vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (
      auth.uid() = id OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'superadmin']::user_role[])
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (
      auth.uid() = id OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'superadmin']::user_role[])
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. employees: Mitarbeiterdaten schützen (bestätigt vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employees' AND policyname = 'Users can view their own employee data'
  ) THEN
    CREATE POLICY "Users can view their own employee data"
    ON public.employees
    FOR SELECT
    USING (
      auth.uid() = id OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'hr', 'superadmin']::user_role[])
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employees' AND policyname = 'HR can manage employee data'
  ) THEN
    CREATE POLICY "HR can manage employee data"
    ON public.employees
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'hr', 'superadmin']::user_role[])
      )
    );
  END IF;
END $$;

-- 3. time_entries: Zeiterfassung schützen (bestätigt vorhanden)  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_entries' AND policyname = 'Users can view their own time entries'
  ) THEN
    CREATE POLICY "Users can view their own time entries"
    ON public.time_entries
    FOR SELECT
    USING (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'hr', 'superadmin']::user_role[])
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_entries' AND policyname = 'Users can manage their own time entries'
  ) THEN
    CREATE POLICY "Users can manage their own time entries"
    ON public.time_entries
    FOR ALL
    USING (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin', 'hr', 'superadmin']::user_role[])
      )
    );
  END IF;
END $$;