-- GPS Settings für Benutzer
CREATE TABLE public.gps_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gps_enabled BOOLEAN DEFAULT false,
  auto_tracking BOOLEAN DEFAULT false,
  background_tracking BOOLEAN DEFAULT false,
  battery_optimization BOOLEAN DEFAULT true,
  accuracy_mode TEXT DEFAULT 'high',
  update_interval INTEGER DEFAULT 30,
  min_distance INTEGER DEFAULT 50,
  auto_expense_submit BOOLEAN DEFAULT false,
  privacy_mode BOOLEAN DEFAULT false,
  company_id UUID REFERENCES public.companies(id),
  last_sync TIMESTAMPTZ,
  total_distance_km NUMERIC DEFAULT 0,
  trips_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Fahrten
CREATE TABLE public.gps_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance_km NUMERIC NOT NULL,
  duration_minutes INTEGER,
  trip_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  expense_id UUID,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Firmenkarten
CREATE TABLE public.company_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  card_number_last4 TEXT NOT NULL,
  card_number_masked TEXT,
  card_type TEXT DEFAULT 'Travel Card',
  monthly_limit NUMERIC NOT NULL DEFAULT 2500,
  current_spent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  valid_until DATE,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Karten-Transaktionen
CREATE TABLE public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.company_cards(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  is_flagged BOOLEAN DEFAULT false,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.gps_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own gps_settings" ON public.gps_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gps_settings" ON public.gps_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gps_settings" ON public.gps_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gps_trips" ON public.gps_trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gps_trips" ON public.gps_trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gps_trips" ON public.gps_trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view company_cards" ON public.company_cards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert company_cards" ON public.company_cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update company_cards" ON public.company_cards
  FOR UPDATE USING (true);

CREATE POLICY "Users can view card_transactions" ON public.card_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert card_transactions" ON public.card_transactions
  FOR INSERT WITH CHECK (true);