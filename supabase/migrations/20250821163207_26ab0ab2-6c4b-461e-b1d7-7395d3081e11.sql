-- Erweitere die bestehenden business-travel Tabellen für erweiterte Spesenabrechnung

-- Spesenkategorien Tabelle
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  requires_receipt BOOLEAN DEFAULT false,
  vat_rules JSONB DEFAULT '{}',
  per_diem_applicable BOOLEAN DEFAULT false,
  max_amount NUMERIC,
  company_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-Diem Sätze
CREATE TABLE IF NOT EXISTS public.per_diem_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  city TEXT,
  accommodation_rate NUMERIC NOT NULL,
  meal_rate NUMERIC NOT NULL,
  incidental_rate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  effective_from DATE NOT NULL,
  effective_to DATE,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kilometersätze
CREATE TABLE IF NOT EXISTS public.mileage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT NOT NULL, -- 'car', 'motorcycle', 'bicycle'
  rate_per_km NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  effective_from DATE NOT NULL,
  effective_to DATE,
  company_id UUID,
  requires_gps_proof BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Firmenkarten
CREATE TABLE IF NOT EXISTS public.company_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number_masked TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  card_type TEXT NOT NULL, -- 'credit', 'debit', 'corporate'
  assigned_to UUID,
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kartentransaktionen
CREATE TABLE IF NOT EXISTS public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_card_id UUID REFERENCES public.company_cards(id),
  transaction_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  description TEXT,
  is_matched BOOLEAN DEFAULT false,
  matched_expense_id UUID,
  requires_review BOOLEAN DEFAULT false,
  review_reason TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erweitere die bestehende business_trip_expenses Tabelle
ALTER TABLE public.business_trip_expenses 
ADD COLUMN IF NOT EXISTS expense_category_id UUID REFERENCES public.expense_categories(id),
ADD COLUMN IF NOT EXISTS per_diem_applicable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mileage_km NUMERIC,
ADD COLUMN IF NOT EXISTS mileage_rate_id UUID REFERENCES public.mileage_rates(id),
ADD COLUMN IF NOT EXISTS card_transaction_id UUID REFERENCES public.card_transactions(id),
ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS approval_workflow_id UUID,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at_level_1 TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at_level_2 TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS requires_finance_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS policy_violations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ocr_data JSONB,
ADD COLUMN IF NOT EXISTS gps_coordinates JSONB;

-- Expense Workflows
CREATE TABLE IF NOT EXISTS public.expense_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  steps JSONB NOT NULL, -- Array of workflow steps
  conditions JSONB DEFAULT '{}',
  sla_hours INTEGER DEFAULT 48,
  escalation_rules JSONB DEFAULT '{}',
  company_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Integration für erweiterte Dokumente
CREATE TABLE IF NOT EXISTS public.document_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id),
  workflow_type TEXT NOT NULL, -- 'approval', 'review', 'signature'
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  workflow_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  due_date TIMESTAMP WITH TIME ZONE,
  escalation_level INTEGER DEFAULT 0,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Processing (OCR, Auto-tagging)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS auto_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS document_source TEXT DEFAULT 'manual', -- 'manual', 'email', 'api', 'qr_scan'
ADD COLUMN IF NOT EXISTS ai_classification TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS duplicate_check_hash TEXT,
ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
ADD COLUMN IF NOT EXISTS retention_date DATE,
ADD COLUMN IF NOT EXISTS compliance_flags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS integration_refs JSONB DEFAULT '{}'; -- Referenzen zu DATEV, SevDesk etc.

-- RLS Policies für neue Tabellen
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.per_diem_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;

-- Standard RLS Policies
CREATE POLICY "Company users can view expense categories" ON public.expense_categories FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL);

CREATE POLICY "Company users can view per diem rates" ON public.per_diem_rates FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL);

CREATE POLICY "Company users can view mileage rates" ON public.mileage_rates FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL);

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin')));

CREATE POLICY "Users can view their company cards" ON public.company_cards FOR SELECT
  USING (assigned_to = auth.uid() OR company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can view their card transactions" ON public.card_transactions FOR SELECT
  USING (company_card_id IN (SELECT id FROM public.company_cards WHERE assigned_to = auth.uid()));

CREATE POLICY "Company users can view document workflows" ON public.document_workflows FOR SELECT
  USING (document_id IN (SELECT id FROM documents WHERE created_by = auth.uid()) OR 
         assigned_to = auth.uid() OR
         EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr')));

-- Insert some default data
INSERT INTO public.expense_categories (name, description, requires_receipt, vat_rules, per_diem_applicable) VALUES
('Verpflegung', 'Mahlzeiten und Getränke', false, '{"standard_rate": 19, "reduced_rate": 7}', true),
('Übernachtung', 'Hotel und Unterkunft', true, '{"standard_rate": 19}', true),
('Transport', 'Flug, Bahn, Taxi, Mietwagen', true, '{"standard_rate": 19}', false),
('Sonstiges', 'Weitere Reisekosten', true, '{"standard_rate": 19}', false),
('Bewirtung', 'Geschäftsessen und Bewirtung', true, '{"standard_rate": 19, "deductible": 70}', false),
('Telekommunikation', 'Roaming, Telefon, Internet', true, '{"standard_rate": 19}', false);

INSERT INTO public.per_diem_rates (country_code, city, accommodation_rate, meal_rate, incidental_rate, currency, effective_from) VALUES
('DE', NULL, 20.00, 28.00, 5.00, 'EUR', '2024-01-01'),
('DE', 'Berlin', 25.00, 32.00, 7.00, 'EUR', '2024-01-01'),
('DE', 'München', 25.00, 32.00, 7.00, 'EUR', '2024-01-01'),
('DE', 'Hamburg', 25.00, 32.00, 7.00, 'EUR', '2024-01-01'),
('AT', NULL, 22.00, 30.00, 6.00, 'EUR', '2024-01-01'),
('CH', NULL, 35.00, 45.00, 10.00, 'CHF', '2024-01-01');

INSERT INTO public.mileage_rates (vehicle_type, rate_per_km, currency, effective_from) VALUES
('car', 0.30, 'EUR', '2024-01-01'),
('motorcycle', 0.20, 'EUR', '2024-01-01'),
('bicycle', 0.05, 'EUR', '2024-01-01');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_categories_updated_at BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER per_diem_rates_updated_at BEFORE UPDATE ON public.per_diem_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER mileage_rates_updated_at BEFORE UPDATE ON public.mileage_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER company_cards_updated_at BEFORE UPDATE ON public.company_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER expense_workflows_updated_at BEFORE UPDATE ON public.expense_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER document_workflows_updated_at BEFORE UPDATE ON public.document_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();