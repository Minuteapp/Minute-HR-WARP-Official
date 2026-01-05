-- Füge company_id Spalte hinzu
ALTER TABLE public.absence_requests 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Kommentar zur Dokumentation
COMMENT ON COLUMN public.absence_requests.company_id 
IS 'Referenz auf die Firma für Multi-Tenancy Unterstützung';

-- Index für bessere Performance bei company_id Queries
CREATE INDEX IF NOT EXISTS idx_absence_requests_company_id 
ON public.absence_requests(company_id);