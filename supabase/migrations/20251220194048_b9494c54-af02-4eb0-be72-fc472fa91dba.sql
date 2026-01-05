-- =============================================
-- Restliche RLS-Policies mit DROP IF EXISTS + CREATE
-- =============================================

-- CALENDAR_SETTINGS Policies (nur neue hinzufügen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_settings' AND policyname = 'Users can view their calendar settings') THEN
    CREATE POLICY "Users can view their calendar settings" ON public.calendar_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_settings' AND policyname = 'Users can insert their calendar settings') THEN
    CREATE POLICY "Users can insert their calendar settings" ON public.calendar_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_settings' AND policyname = 'Users can update their calendar settings') THEN
    CREATE POLICY "Users can update their calendar settings" ON public.calendar_settings FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ABSENCE_REQUESTS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'absence_requests' AND policyname = 'Users can view absence requests') THEN
    CREATE POLICY "Users can view absence requests" ON public.absence_requests FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- TIME_ENTRIES Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Users can view time entries') THEN
    CREATE POLICY "Users can view time entries" ON public.time_entries FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- DOCUMENTS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view documents') THEN
    CREATE POLICY "Users can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- COMPANIES Policies  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can view companies') THEN
    CREATE POLICY "Users can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
  END IF;
END $$;