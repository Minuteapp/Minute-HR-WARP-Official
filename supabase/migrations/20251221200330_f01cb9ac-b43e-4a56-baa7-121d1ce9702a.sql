-- Per Diem Rates Table
CREATE TABLE IF NOT EXISTS public.per_diem_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  city TEXT,
  country_code TEXT,
  full_day_rate NUMERIC NOT NULL,
  half_day_rate NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  eur_equivalent_full NUMERIC,
  eur_equivalent_half NUMERIC,
  source TEXT DEFAULT 'official',
  valid_from DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Types Table
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'car',
  rate_per_km NUMERIC NOT NULL,
  co2_factor NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.per_diem_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for per_diem_rates
CREATE POLICY "Users can view per diem rates" ON public.per_diem_rates
  FOR SELECT USING (true);

CREATE POLICY "Users can insert per diem rates" ON public.per_diem_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update per diem rates" ON public.per_diem_rates
  FOR UPDATE USING (true);

-- RLS Policies for vehicle_types
CREATE POLICY "Users can view vehicle types" ON public.vehicle_types
  FOR SELECT USING (true);

CREATE POLICY "Users can insert vehicle types" ON public.vehicle_types
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update vehicle types" ON public.vehicle_types
  FOR UPDATE USING (true);

-- Add missing columns to expense_categories if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'budget_limit') THEN
    ALTER TABLE public.expense_categories ADD COLUMN budget_limit NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'budget_used') THEN
    ALTER TABLE public.expense_categories ADD COLUMN budget_used NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'transaction_count') THEN
    ALTER TABLE public.expense_categories ADD COLUMN transaction_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'average_amount') THEN
    ALTER TABLE public.expense_categories ADD COLUMN average_amount NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'limit_per_transaction') THEN
    ALTER TABLE public.expense_categories ADD COLUMN limit_per_transaction NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'compliance_rate') THEN
    ALTER TABLE public.expense_categories ADD COLUMN compliance_rate NUMERIC DEFAULT 100;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_categories' AND column_name = 'top_departments') THEN
    ALTER TABLE public.expense_categories ADD COLUMN top_departments TEXT[] DEFAULT '{}';
  END IF;
END $$;