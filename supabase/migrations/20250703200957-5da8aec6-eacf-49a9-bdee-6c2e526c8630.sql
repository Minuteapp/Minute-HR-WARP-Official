-- Füge die fehlende base_forecast_id Spalte zur enterprise_forecasts Tabelle hinzu
ALTER TABLE public.enterprise_forecasts 
ADD COLUMN IF NOT EXISTS base_forecast_id UUID REFERENCES public.enterprise_forecasts(id);

-- Füge einen Index für bessere Performance hinzu
CREATE INDEX IF NOT EXISTS idx_enterprise_forecasts_base_forecast_id 
ON public.enterprise_forecasts(base_forecast_id);