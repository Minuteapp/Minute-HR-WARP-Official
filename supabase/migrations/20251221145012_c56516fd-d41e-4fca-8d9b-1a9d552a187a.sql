-- Füge business_trip_id zur expenses Tabelle hinzu für Integration mit Dienstreisen
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS business_trip_id UUID REFERENCES public.business_trips(id) ON DELETE SET NULL;

-- Index für bessere Performance bei Abfragen nach business_trip_id
CREATE INDEX IF NOT EXISTS idx_expenses_business_trip_id ON public.expenses(business_trip_id);

-- Index für bessere Performance bei Abfragen nach project_id
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);

-- Füge submitted_by Spalte hinzu falls nicht vorhanden
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- Füge cost_center Spalte als Text hinzu für einfachere Zuordnung
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS cost_center TEXT;