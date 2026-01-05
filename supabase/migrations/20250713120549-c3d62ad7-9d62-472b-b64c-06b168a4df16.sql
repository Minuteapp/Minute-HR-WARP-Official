-- Füge fehlende currency Spalte zur travel_requests Tabelle hinzu
ALTER TABLE public.travel_requests 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Füge fehlende employee_id Spalte zur training_sessions Tabelle hinzu (falls sie existiert)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'training_sessions') THEN
        ALTER TABLE public.training_sessions 
        ADD COLUMN IF NOT EXISTS employee_id uuid;
    END IF;
END $$;