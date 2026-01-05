-- FIX: update_absence_quota Funktion - EXTRACT(EPOCH FROM integer) existiert nicht
-- date - date gibt bereits integer (Anzahl Tage) zurück, kein EXTRACT nötig

CREATE OR REPLACE FUNCTION public.update_absence_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days DECIMAL(5,2);
BEGIN
  -- KORREKT: date - date gibt integer (Anzahl Tage) zurück, +1 für inklusiv
  v_days := (NEW.end_date - NEW.start_date) + 1;
  
  IF NEW.is_partial_day AND NEW.partial_start_time IS NOT NULL AND NEW.partial_end_time IS NOT NULL THEN
    v_days := v_days * 0.5;
  END IF;

  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE absence_quotas
    SET 
      planned_days = GREATEST(0, planned_days - v_days),
      used_days = used_days + v_days,
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    UPDATE absence_quotas
    SET 
      planned_days = planned_days + v_days,
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'pending' THEN
    UPDATE absence_quotas
    SET 
      planned_days = GREATEST(0, planned_days - v_days),
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'approved' THEN
    UPDATE absence_quotas
    SET 
      used_days = GREATEST(0, used_days - v_days),
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$;