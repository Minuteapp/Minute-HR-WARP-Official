-- Füge Foreign Key zwischen absence_requests und employees hinzu
ALTER TABLE public.absence_requests
ADD CONSTRAINT absence_requests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.employees(id) 
ON DELETE CASCADE;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_absence_requests_user_id 
ON public.absence_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_absence_requests_status 
ON public.absence_requests(status);

CREATE INDEX IF NOT EXISTS idx_absence_requests_dates 
ON public.absence_requests(start_date, end_date);