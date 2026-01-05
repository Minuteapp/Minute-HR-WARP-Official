-- 1) Benachrichtigung an Genehmiger/HR bei neuer Abwesenheit
CREATE OR REPLACE FUNCTION public.notify_new_absence_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_company uuid;
  rec record;
  v_subject text;
  v_message text;
BEGIN
  -- Firma des Mitarbeiters ermitteln
  SELECT company_id INTO v_employee_company
  FROM public.employees
  WHERE id = NEW.user_id;

  v_subject := 'Neuer Abwesenheitsantrag eingegangen';
  v_message := 'Neuer Antrag von ' || COALESCE(NEW.employee_name,'Mitarbeiter') ||
               ' (' || COALESCE(NEW.department,'Abteilung unbekannt') || '): ' ||
               COALESCE(NEW.type, NEW.absence_type, 'Unbekannt') || ' ' ||
               NEW.start_date::text || ' bis ' || NEW.end_date::text ||
               CASE WHEN COALESCE(NEW.half_day, false) THEN ' (Halber Tag)' ELSE '' END;

  -- Admins und HR in derselben Firma informieren (Fallback: ohne Firmenbindung)
  FOR rec IN
    SELECT ur.user_id, u.email
    FROM public.user_roles ur
    LEFT JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role IN ('admin','hr')
      AND (ur.company_id = v_employee_company OR v_employee_company IS NULL)
  LOOP
    INSERT INTO public.absence_auto_notifications (
      absence_request_id,
      notification_type,
      recipient_user_id,
      recipient_email,
      subject,
      message
    ) VALUES (
      NEW.id,
      'new_request',
      rec.user_id,
      COALESCE(rec.email, 'no-reply@example.com'),
      v_subject,
      v_message
    );
  END LOOP;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_new_absence_request ON public.absence_requests;
CREATE TRIGGER trg_notify_new_absence_request
AFTER INSERT ON public.absence_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_absence_request();

-- 2) Serverseitige Validierung für Nachweise bei Krankmeldungen
CREATE OR REPLACE FUNCTION public.enforce_absence_document_requirements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_requires_document boolean := false;
  v_document_days integer := 3;
  v_days integer;
BEGIN
  -- Firma ermitteln
  SELECT company_id INTO v_company_id
  FROM public.employees 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  -- Einstellungen für Krankmeldungen holen (Fallback-Werte vorhanden)
  SELECT COALESCE(requires_document, false), COALESCE(document_days, 3)
  INTO v_requires_document, v_document_days
  FROM public.absence_settings
  WHERE absence_type = 'sick_leave'
    AND (company_id = v_company_id OR v_company_id IS NULL)
  ORDER BY company_id NULLS FIRST
  LIMIT 1;

  -- Dauer in Tagen berechnen (inkl. Start- und Enddatum)
  v_days := GREATEST(1, (NEW.end_date - NEW.start_date) + 1);

  -- Dokumentenpflicht bei Krankmeldung setzen
  IF (NEW.absence_type = 'sick_leave' OR NEW.type = 'sick_leave') THEN
    IF v_requires_document AND v_days >= v_document_days THEN
      NEW.document_required := true;
    END IF;
  END IF;

  -- Genehmigung ohne Nachweis verhindern, wenn erforderlich
  IF TG_OP = 'UPDATE' 
     AND NEW.status = 'approved' 
     AND (OLD.status IS DISTINCT FROM NEW.status) 
     AND COALESCE(NEW.document_required, false) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.absence_documents d WHERE d.absence_request_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Genehmigung nicht möglich: Erforderlicher Nachweis fehlt.';
    END IF;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_enforce_absence_document_requirements ON public.absence_requests;
CREATE TRIGGER trg_enforce_absence_document_requirements
BEFORE INSERT OR UPDATE ON public.absence_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_absence_document_requirements();