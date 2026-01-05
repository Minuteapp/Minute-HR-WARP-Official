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