-- Erweitere bestehende Ausgaben-Struktur für Enterprise-Features
-- Kostenstellen-Verwaltung
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_cost_center_id UUID,
  department TEXT,
  responsible_person_id UUID,
  budget_limit NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Ausgaben-Kategorien (erweitert)
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_type TEXT NOT NULL DEFAULT 'other',
  parent_category_id UUID,
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold NUMERIC DEFAULT 0,
  default_tax_rate NUMERIC DEFAULT 0.19,
  is_active BOOLEAN DEFAULT true,
  color_code TEXT DEFAULT '#3B82F6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Lieferanten/Vendor-Verwaltung
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_number VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  vat_id TEXT,
  address JSONB,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  payment_terms TEXT,
  default_payment_method TEXT,
  currency VARCHAR(3) DEFAULT 'EUR',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  risk_rating TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Budget-Ausgaben-Verknüpfung (für Ist-Soll-Vergleiche)
CREATE TABLE public.budget_expense_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  budget_plan_id UUID REFERENCES public.budget_plans(id),
  allocated_amount NUMERIC NOT NULL,
  allocation_percentage NUMERIC DEFAULT 100,
  allocation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ausgaben-Analysen für KI-Insights
CREATE TABLE public.expense_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL, -- 'spending_pattern', 'budget_variance', 'forecast_accuracy', 'anomaly_detection'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  cost_center_id UUID REFERENCES public.cost_centers(id),
  category_id UUID REFERENCES public.expense_categories(id),
  analysis_data JSONB NOT NULL,
  insights JSONB,
  recommendations JSONB,
  confidence_score NUMERIC DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Standard-Kategorien einfügen
INSERT INTO public.expense_categories (code, name, category_type, color_code, icon) VALUES
('OPEX', 'Betriebsausgaben', 'opex', '#3B82F6', 'Building'),
('PERSONNEL', 'Personalkosten', 'personnel', '#10B981', 'Users'),
('TRAVEL', 'Reisekosten', 'travel', '#F59E0B', 'Plane'),
('MARKETING', 'Marketing & Vertrieb', 'marketing', '#EF4444', 'Megaphone'),
('RD', 'Forschung & Entwicklung', 'rd', '#8B5CF6', 'Lightbulb'),
('PRODUCTION', 'Produktion', 'production', '#F97316', 'Cog'),
('FINANCE', 'Finanzkosten', 'finance', '#06B6D4', 'CreditCard'),
('TAXES', 'Steuern & Abgaben', 'taxes', '#DC2626', 'FileText'),
('IT', 'IT & Software', 'opex', '#1E40AF', 'Monitor'),
('OFFICE', 'Büroausstattung', 'opex', '#92400E', 'Home'),
('UTILITIES', 'Nebenkosten', 'opex', '#374151', 'Zap'),
('INSURANCE', 'Versicherungen', 'opex', '#7C2D12', 'Shield'),
('COMPLIANCE', 'Compliance & Recht', 'compliance', '#7C3AED', 'Scale'),
('CSR', 'Nachhaltigkeit & CSR', 'csr', '#059669', 'Leaf'),
('DEPRECIATION', 'Abschreibungen', 'depreciation', '#6B7280', 'TrendingDown');

-- Standard-Kostenstellen einfügen
INSERT INTO public.cost_centers (code, name, description, department) VALUES
('CC001', 'Geschäftsführung', 'Zentrale Geschäftsführung', 'Management'),
('CC002', 'Vertrieb', 'Vertrieb und Sales', 'Sales'),
('CC003', 'Marketing', 'Marketing und Werbung', 'Marketing'),
('CC004', 'IT', 'IT-Abteilung', 'IT'),
('CC005', 'HR', 'Personalwesen', 'HR'),
('CC006', 'Finanzen', 'Finanz- und Rechnungswesen', 'Finance'),
('CC007', 'Produktion', 'Produktionsbereich', 'Production'),
('CC008', 'F&E', 'Forschung und Entwicklung', 'R&D'),
('CC009', 'Einkauf', 'Einkauf und Beschaffung', 'Procurement'),
('CC010', 'Facility', 'Gebäude und Infrastruktur', 'Facility');

-- Erweitere bestehende expenses Tabelle um neue Spalten
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.expense_categories(id),
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id),
ADD COLUMN IF NOT EXISTS project_id UUID,
ADD COLUMN IF NOT EXISTS budget_plan_id UUID REFERENCES public.budget_plans(id),
ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'operational',
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 0.19,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year INTEGER,
ADD COLUMN IF NOT EXISTS quarter INTEGER,
ADD COLUMN IF NOT EXISTS month INTEGER,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS ocr_data JSONB;

-- Enable RLS auf neue Tabellen
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_analytics ENABLE ROW LEVEL SECURITY;

-- Vereinfachte RLS Policies
CREATE POLICY "cost_centers_read" ON public.cost_centers FOR SELECT USING (true);
CREATE POLICY "expense_categories_read" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "suppliers_read" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "budget_allocations_read" ON public.budget_expense_allocations FOR SELECT USING (true);
CREATE POLICY "analytics_read" ON public.expense_analytics FOR SELECT USING (true);

-- Trigger für automatische Felder
CREATE OR REPLACE FUNCTION set_expense_fiscal_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Setze Fiscal Year, Quarter, etc.
  NEW.fiscal_year := EXTRACT(YEAR FROM NEW.date);
  NEW.quarter := EXTRACT(QUARTER FROM NEW.date);
  NEW.month := EXTRACT(MONTH FROM NEW.date);
  
  -- Berechne Netto-Betrag wenn VAT-Rate gegeben
  IF NEW.vat_rate IS NOT NULL AND NEW.vat_rate > 0 THEN
    NEW.net_amount := NEW.amount / (1 + NEW.vat_rate);
    NEW.vat_amount := NEW.amount - NEW.net_amount;
  ELSE
    NEW.net_amount := NEW.amount;
    NEW.vat_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_expense_fiscal_fields_trigger
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION set_expense_fiscal_fields();