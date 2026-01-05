-- Schritt 2: permission_templates RLS aktivieren

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permission_templates') THEN
    ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;
    
    -- Policies für permission_templates
    DROP POLICY IF EXISTS "Admins can manage permission templates" ON public.permission_templates;
    CREATE POLICY "Admins can manage permission templates" 
    ON public.permission_templates 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    );

    DROP POLICY IF EXISTS "All users can view permission templates" ON public.permission_templates;
    CREATE POLICY "All users can view permission templates" 
    ON public.permission_templates 
    FOR SELECT 
    USING (is_active = true);
  END IF;
END
$$;