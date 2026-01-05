-- Fehlende Tabellen für erweiterte Geschäftsreisen-Funktionalität

-- 1. Approval Decisions (für kürzliche Entscheidungen)
CREATE TABLE IF NOT EXISTS public.approval_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID REFERENCES public.travel_approvals(id) ON DELETE CASCADE,
  approver_id UUID,
  approver_name TEXT,
  decision TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  decided_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Archived Trips (für Archiv Tab)
CREATE TABLE IF NOT EXISTS public.archived_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_number TEXT,
  destination TEXT,
  origin TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  total_cost NUMERIC DEFAULT 0,
  audit_score INTEGER DEFAULT 0,
  compliance_status TEXT DEFAULT 'compliant',
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Traveler Locations (für Live-Karte)
CREATE TABLE IF NOT EXISTS public.traveler_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT,
  current_lat NUMERIC,
  current_lng NUMERIC,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  destination_name TEXT,
  origin_name TEXT,
  status TEXT DEFAULT 'on_time',
  flight_number TEXT,
  delay_minutes INTEGER DEFAULT 0,
  department TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. System Integrations (für Integrationen Tab)
CREATE TABLE IF NOT EXISTS public.system_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  category TEXT,
  status TEXT DEFAULT 'inactive',
  last_sync TIMESTAMPTZ,
  sync_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 100,
  config JSONB DEFAULT '{}'::jsonb,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traveler_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies für approval_decisions
CREATE POLICY "Users can view approval_decisions in their company"
ON public.approval_decisions FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert approval_decisions in their company"
ON public.approval_decisions FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- RLS Policies für archived_trips
CREATE POLICY "Users can view archived_trips in their company"
ON public.archived_trips FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert archived_trips in their company"
ON public.archived_trips FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- RLS Policies für traveler_locations
CREATE POLICY "Users can view traveler_locations in their company"
ON public.traveler_locations FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage traveler_locations in their company"
ON public.traveler_locations FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- RLS Policies für system_integrations
CREATE POLICY "Users can view system_integrations in their company"
ON public.system_integrations FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage system_integrations in their company"
ON public.system_integrations FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_approval_decisions_approval ON public.approval_decisions(approval_id);
CREATE INDEX IF NOT EXISTS idx_archived_trips_company ON public.archived_trips(company_id);
CREATE INDEX IF NOT EXISTS idx_traveler_locations_company ON public.traveler_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_system_integrations_company ON public.system_integrations(company_id);