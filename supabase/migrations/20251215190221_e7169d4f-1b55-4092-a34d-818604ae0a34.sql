ALTER TABLE public.absence_requests 
ADD COLUMN IF NOT EXISTS valid_for_time_tracking BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.absence_requests.valid_for_time_tracking 
IS 'Wenn true, wird die Zeiterfassung für diesen Zeitraum blockiert';