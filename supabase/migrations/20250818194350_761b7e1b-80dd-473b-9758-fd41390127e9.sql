-- Korrekte Migration für location_holidays
DROP TABLE IF EXISTS public.location_holidays;

CREATE TABLE public.location_holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES public.company_locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    is_public_holiday BOOLEAN DEFAULT TRUE,
    is_company_holiday BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT TRUE,
    category TEXT DEFAULT 'public',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, date, name)
);

-- RLS für location_holidays
ALTER TABLE public.location_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location holidays access" ON public.location_holidays
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.company_locations cl
        WHERE cl.id = public.location_holidays.location_id
        AND (
            CASE
                WHEN is_in_tenant_context() THEN (cl.company_id = get_tenant_company_id_safe())
                WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
                ELSE (cl.company_id = get_user_company_id(auth.uid()))
            END
        )
    )
);

-- Index für location_holidays
CREATE INDEX idx_location_holidays_location_id ON public.location_holidays(location_id);
CREATE INDEX idx_location_holidays_date ON public.location_holidays(date);