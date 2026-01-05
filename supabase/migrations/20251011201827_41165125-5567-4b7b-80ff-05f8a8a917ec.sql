-- Fix RLS policies for publicly exposed tables (safe version)

-- ============================================
-- 1. COMPANIES TABLE - Restrict public access
-- ============================================

DO $$ 
BEGIN
  -- Drop existing overly permissive policies
  DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
  DROP POLICY IF EXISTS "Public can view companies" ON public.companies;

  -- Create restricted policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Authenticated users can view their own company'
  ) THEN
    CREATE POLICY "Authenticated users can view their own company"
      ON public.companies
      FOR SELECT
      TO authenticated
      USING (
        id = get_effective_company_id() OR
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid() 
          AND ur.company_id = companies.id
        ) OR
        is_superadmin_safe(auth.uid())
      );
  END IF;
END $$;

-- ============================================
-- 2. PROFILES TABLE - Restrict public access
-- ============================================

DO $$ 
BEGIN
  -- Drop existing overly permissive policies
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

  -- Create restricted policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view profiles in same company'
  ) THEN
    CREATE POLICY "Users can view profiles in same company"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id OR
        EXISTS (
          SELECT 1 FROM user_roles ur1
          JOIN user_roles ur2 ON ur1.company_id = ur2.company_id
          WHERE ur1.user_id = auth.uid() 
          AND ur2.user_id = profiles.id
        ) OR
        is_superadmin_safe(auth.uid())
      );
  END IF;
END $$;

-- ============================================
-- 3. CROSS_MODULE_EVENTS - Restrict employee data
-- ============================================

DO $$ 
BEGIN
  -- Drop existing overly permissive policies
  DROP POLICY IF EXISTS "Public can view cross module events" ON public.cross_module_events;
  DROP POLICY IF EXISTS "Anyone can view events" ON public.cross_module_events;

  -- Create restricted policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cross_module_events' 
    AND policyname = 'Users can view their own events'
  ) THEN
    CREATE POLICY "Users can view their own events"
      ON public.cross_module_events
      FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin', 'hr', 'manager')
          AND ur.company_id = get_effective_company_id()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cross_module_events' 
    AND policyname = 'Admins can manage events in their company'
  ) THEN
    CREATE POLICY "Admins can manage events in their company"
      ON public.cross_module_events
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin', 'hr')
          AND ur.company_id = get_effective_company_id()
        )
      );
  END IF;
END $$;