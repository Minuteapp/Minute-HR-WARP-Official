-- Erstelle locations Tabelle für Standorte
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS locations_company_id_idx ON public.locations(company_id);

-- RLS aktivieren
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS-Policies: Nur Daten der eigenen Firma sichtbar
CREATE POLICY "Users can view locations of their company"
  ON public.locations
  FOR SELECT
  USING (
    company_id IN (
      SELECT e.company_id FROM public.employees e WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert locations for their company"
  ON public.locations
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT e.company_id FROM public.employees e WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update locations of their company"
  ON public.locations
  FOR UPDATE
  USING (
    company_id IN (
      SELECT e.company_id FROM public.employees e WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete locations of their company"
  ON public.locations
  FOR DELETE
  USING (
    company_id IN (
      SELECT e.company_id FROM public.employees e WHERE e.user_id = auth.uid()
    )
  );

-- Trigger für updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();