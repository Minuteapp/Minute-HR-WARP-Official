-- Schritt 1: Kritische RLS-Probleme beheben

-- RLS für permission_audit_log aktivieren (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permission_audit_log') THEN
    ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;
    
    -- Policy für permission_audit_log
    DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.permission_audit_log;
    CREATE POLICY "Admins can manage audit logs" 
    ON public.permission_audit_log 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    );
  END IF;
END
$$;