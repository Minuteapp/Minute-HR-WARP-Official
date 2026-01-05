-- =====================================================
-- KRITISCHE PII-EXPOSURE BEHEBEN (Korrigiert)
-- =====================================================

-- 1. PROFILES: Nur eigenes Profil sichtbar
-- =====================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. COMPANIES: Nur für Admins/SuperAdmins
-- =====================================================
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;
DROP POLICY IF EXISTS "Public can view companies" ON public.companies;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Only admins can view companies'
  ) THEN
    CREATE POLICY "Only admins can view companies"
      ON public.companies FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid() 
          AND role IN ('admin', 'superadmin', 'hr')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Only superadmins can manage companies'
  ) THEN
    CREATE POLICY "Only superadmins can manage companies"
      ON public.companies FOR ALL
      USING (is_superadmin_safe(auth.uid()));
  END IF;
END $$;

-- 3. ADMIN_INVITATIONS: Öffentliche Policies entfernen
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Public can view admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Allow all to view admin invitations" ON public.admin_invitations;

-- 4. CROSS_MODULE_EVENTS: Nur für authentifizierte Benutzer
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cross_module_events;
DROP POLICY IF EXISTS "Public can view events" ON public.cross_module_events;
DROP POLICY IF EXISTS "Anyone can view cross module events" ON public.cross_module_events;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cross_module_events' 
    AND policyname = 'Authenticated users can view their company events'
  ) THEN
    CREATE POLICY "Authenticated users can view their company events"
      ON public.cross_module_events FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
          AND ur.role IN ('admin', 'superadmin', 'hr', 'manager')
        )
      );
  END IF;
END $$;

-- 5. VOICEMAIL_MESSAGES: Nur für Eigentümer und Admins (korrigierte Spalte: user_id)
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.voicemail_messages;
DROP POLICY IF EXISTS "Public can view voicemail" ON public.voicemail_messages;
DROP POLICY IF EXISTS "Anyone can view voicemail messages" ON public.voicemail_messages;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'voicemail_messages' 
    AND policyname = 'Users can view their own voicemail'
  ) THEN
    CREATE POLICY "Users can view their own voicemail"
      ON public.voicemail_messages FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'superadmin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'voicemail_messages' 
    AND policyname = 'Users can create voicemail'
  ) THEN
    CREATE POLICY "Users can create voicemail"
      ON public.voicemail_messages FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'voicemail_messages' 
    AND policyname = 'Users can update their voicemail'
  ) THEN
    CREATE POLICY "Users can update their voicemail"
      ON public.voicemail_messages FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;