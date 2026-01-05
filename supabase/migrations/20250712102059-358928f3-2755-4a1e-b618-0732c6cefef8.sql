-- Erstelle einen Trigger, der die Edge Function aufruft, wenn ein Abwesenheitsantrag genehmigt wird
CREATE OR REPLACE FUNCTION public.handle_approved_absence()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfe ob Status zu 'approved' geändert wurde
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Rufe die Edge Function asynchron auf
    PERFORM net.http_post(
      url := 'https://teydpbqficbdgqovoqlo.supabase.co/functions/v1/update-vacation-days',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erstelle Trigger für absence_requests
DROP TRIGGER IF EXISTS trigger_approved_absence ON public.absence_requests;
CREATE TRIGGER trigger_approved_absence
  AFTER UPDATE ON public.absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_absence();

-- Erstelle employee_audit_logs Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.employee_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  performed_by UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für employee_audit_logs
ALTER TABLE public.employee_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON public.employee_audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "System can create audit logs" ON public.employee_audit_logs
FOR INSERT WITH CHECK (true);