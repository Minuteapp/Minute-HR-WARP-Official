-- RLS aktivieren für neue Tabellen
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_module_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für company_modules
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'company_modules' 
    AND policyname = 'Everyone can view active modules'
  ) THEN
    CREATE POLICY "Everyone can view active modules"
    ON public.company_modules FOR SELECT
    USING (is_active = true);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'company_modules' 
    AND policyname = 'Admins can manage modules'
  ) THEN
    CREATE POLICY "Admins can manage modules"
    ON public.company_modules FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    );
  END IF;
END $$;

-- RLS Policies für company_module_assignments
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'company_module_assignments' 
    AND policyname = 'Admins can view all assignments'
  ) THEN
    CREATE POLICY "Admins can view all assignments"
    ON public.company_module_assignments FOR SELECT
    USING (
      EXISTS (
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
    AND tablename = 'company_module_assignments' 
    AND policyname = 'Admins can manage assignments'
  ) THEN
    CREATE POLICY "Admins can manage assignments"
    ON public.company_module_assignments FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    );
  END IF;
END $$;