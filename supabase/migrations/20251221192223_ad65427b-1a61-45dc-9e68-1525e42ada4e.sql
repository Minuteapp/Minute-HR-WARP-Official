-- Tabelle trip_costs für Kostenaufschlüsselung
CREATE TABLE IF NOT EXISTS public.trip_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('flight', 'hotel', 'food', 'transport', 'other')),
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle trip_documents für Dokumente
CREATE TABLE IF NOT EXISTS public.trip_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_trip_id UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'other' CHECK (document_type IN ('travel_request', 'approval', 'flight_ticket', 'hotel_booking', 'receipt', 'other')),
  file_path TEXT,
  file_size_kb INTEGER,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für trip_costs
ALTER TABLE public.trip_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle können trip_costs lesen" ON public.trip_costs
  FOR SELECT USING (true);

CREATE POLICY "Authentifizierte können trip_costs erstellen" ON public.trip_costs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte können trip_costs aktualisieren" ON public.trip_costs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte können trip_costs löschen" ON public.trip_costs
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS für trip_documents
ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle können trip_documents lesen" ON public.trip_documents
  FOR SELECT USING (true);

CREATE POLICY "Authentifizierte können trip_documents erstellen" ON public.trip_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte können trip_documents aktualisieren" ON public.trip_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifizierte können trip_documents löschen" ON public.trip_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Erweitern von trip_agenda_items falls noch nicht vorhanden
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_agenda_items' AND column_name = 'item_type') THEN
    ALTER TABLE public.trip_agenda_items ADD COLUMN item_type TEXT DEFAULT 'meeting';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_agenda_items' AND column_name = 'description') THEN
    ALTER TABLE public.trip_agenda_items ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_agenda_items' AND column_name = 'day_number') THEN
    ALTER TABLE public.trip_agenda_items ADD COLUMN day_number INTEGER;
  END IF;
END $$;