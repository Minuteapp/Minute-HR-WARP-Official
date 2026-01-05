-- Fix RAISE parameters in validate_position_assignment
CREATE OR REPLACE FUNCTION public.validate_position_assignment()
RETURNS TRIGGER AS $$
DECLARE
  overlap_count int;
  qual_ok boolean := true;
  req_type text;
  req_level int;
BEGIN
  SELECT count(*) INTO overlap_count
  FROM public.position_assignments pa
  WHERE pa.employee_id = NEW.employee_id
    AND pa.date = NEW.date
    AND pa.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')::uuid
    AND (
      (NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL AND pa.start_time IS NOT NULL AND pa.end_time IS NOT NULL AND
       tstzrange(pa.start_time, pa.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)'))
      OR (NEW.start_time IS NULL AND NEW.end_time IS NULL)
    );
  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'Konflikt: Zeitliche Überlappung mit bestehender Zuweisung';
  END IF;

  IF NEW.slot_id IS NOT NULL THEN
    SELECT s.required_qualification_type, s.required_level
      INTO req_type, req_level
    FROM public.shift_position_slots s
    WHERE s.id = NEW.slot_id;

    IF req_type IS NOT NULL THEN
      SELECT (eq.level >= COALESCE(req_level,1)) AND (eq.valid_until IS NULL OR eq.valid_until >= NEW.date)
        INTO qual_ok
      FROM public.employee_qualifications eq
      WHERE eq.employee_id = NEW.employee_id AND eq.qualification_type = req_type
      ORDER BY eq.level DESC
      LIMIT 1;
      IF qual_ok IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Konflikt: Qualifikation % (Level %) unzureichend oder abgelaufen', req_type, COALESCE(req_level,1);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;