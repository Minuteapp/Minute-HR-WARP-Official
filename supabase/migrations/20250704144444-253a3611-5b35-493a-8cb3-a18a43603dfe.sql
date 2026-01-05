-- Erweiterte Ausgaben-Verwaltung - Vereinfachte Version
-- Erstelle neue Tabellen für Enterprise Expense Management

-- Kostenstellen-Verwaltung
CREATE TABLE IF NOT EXISTS public.cost_centers (
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
CREATE TABLE IF NOT EXISTS public.expense_categories (
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
CREATE TABLE IF NOT EXISTS public.suppliers (
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

-- Erweiterte Ausgaben-Tabelle
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_number VARCHAR(50) UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  expense_date DATE NOT NULL,
  category_id UUID,
  cost_center_id UUID,
  project_id UUID,
  budget_plan_id UUID,
  supplier_name TEXT,
  supplier_id UUID,
  invoice_number TEXT,
  expense_type TEXT NOT NULL DEFAULT 'operational',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_date DATE,
  due_date DATE,
  vat_amount NUMERIC DEFAULT 0,
  vat_rate NUMERIC DEFAULT 0.19,
  net_amount NUMERIC,
  location TEXT,
  department TEXT,
  employee_id UUID,
  submitted_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_status TEXT DEFAULT 'pending',
  approval_comments TEXT,
  recurring_expense_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  receipt_path TEXT,
  ocr_data JSONB,
  booking_date DATE,
  fiscal_year INTEGER,
  quarter INTEGER,
  month INTEGER,
  week INTEGER,
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Genehmigungs-Workflows
CREATE TABLE IF NOT EXISTS public.expense_approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID,
  amount_threshold_min NUMERIC DEFAULT 0,
  amount_threshold_max NUMERIC,
  approval_steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Genehmigungs-Verlauf
CREATE TABLE IF NOT EXISTS public.expense_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL,
  workflow_id UUID,
  approver_id UUID NOT NULL,
  approval_step INTEGER NOT NULL,
  approval_status TEXT NOT NULL,
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget-Ausgaben-Verknüpfung
CREATE TABLE IF NOT EXISTS public.budget_expense_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL,
  budget_plan_id UUID,
  allocated_amount NUMERIC NOT NULL,
  allocation_percentage NUMERIC DEFAULT 100,
  allocation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wiederkehrende Ausgaben
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  category_id UUID,
  cost_center_id UUID,
  supplier_id UUID,
  frequency TEXT NOT NULL,
  frequency_config JSONB,
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE,
  auto_approve BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ausgaben-Analysen
CREATE TABLE IF NOT EXISTS public.expense_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  cost_center_id UUID,
  category_id UUID,
  analysis_data JSONB NOT NULL,
  insights JSONB,
  recommendations JSONB,
  confidence_score NUMERIC DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ausgaben-Benachrichtigungen
CREATE TABLE IF NOT EXISTS public.expense_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID,
  notification_type TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'medium',
  action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS auf alle Tabellen
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_notifications ENABLE ROW LEVEL SECURITY;

-- Grundlegende RLS Policies
CREATE POLICY "Allow read access" ON public.cost_centers FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Users can view their expenses" ON public.expenses FOR SELECT USING (submitted_by = auth.uid());
CREATE POLICY "Users can create expenses" ON public.expenses FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users can update their expenses" ON public.expenses FOR UPDATE USING (submitted_by = auth.uid());
CREATE POLICY "Users can view their notifications" ON public.expense_notifications FOR SELECT USING (recipient_id = auth.uid());

-- Erstelle Standardkategorien
INSERT INTO public.expense_categories (code, name, category_type, color_code, icon) VALUES
('OPEX', 'Betriebsausgaben', 'opex', '#3B82F6', 'Building'),
('PERSONNEL', 'Personalkosten', 'personnel', '#10B981', 'Users'),
('TRAVEL', 'Reisekosten', 'travel', '#F59E0B', 'Plane'),
('MARKETING', 'Marketing & Vertrieb', 'marketing', '#EF4444', 'Megaphone'),
('RD', 'Forschung & Entwicklung', 'rd', '#8B5CF6', 'Lightbulb'),
('PRODUCTION', 'Produktion', 'production', '#F97316', 'Cog'),
('FINANCE', 'Finanzkosten', 'finance', '#06B6D4', 'CreditCard'),
('DEPRECIATION', 'Abschreibungen', 'depreciation', '#6B7280', 'TrendingDown'),
('TAXES', 'Steuern & Abgaben', 'taxes', '#DC2626', 'FileText'),
('COMPLIANCE', 'Compliance & Recht', 'compliance', '#7C3AED', 'Scale'),
('CSR', 'Nachhaltigkeit & CSR', 'csr', '#059669', 'Leaf'),
('IT', 'IT & Software', 'opex', '#1E40AF', 'Monitor'),
('OFFICE', 'Büroausstattung', 'opex', '#92400E', 'Home'),
('UTILITIES', 'Nebenkosten', 'opex', '#374151', 'Zap'),
('INSURANCE', 'Versicherungen', 'opex', '#7C2D12', 'Shield');

-- Erstelle Standard-Kostenstellen
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

-- Sequenz für Ausgaben-Nummern
CREATE SEQUENCE IF NOT EXISTS expense_number_seq START 1000;

-- Funktion für automatische Ausgaben-Nummer
CREATE OR REPLACE FUNCTION generate_expense_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expense_number IS NULL THEN
    NEW.expense_number := 'EXP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('expense_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_expense_number_trigger
BEFORE INSERT ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION generate_expense_number();

-- Trigger für automatische Felder
CREATE OR REPLACE FUNCTION set_expense_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Setze Fiscal Year, Quarter, etc.
  NEW.fiscal_year := EXTRACT(YEAR FROM NEW.expense_date);
  NEW.quarter := EXTRACT(QUARTER FROM NEW.expense_date);
  NEW.month := EXTRACT(MONTH FROM NEW.expense_date);
  NEW.week := EXTRACT(WEEK FROM NEW.expense_date);
  
  -- Berechne Netto-Betrag
  IF NEW.vat_amount IS NOT NULL THEN
    NEW.net_amount := NEW.amount - NEW.vat_amount;
  ELSE
    NEW.net_amount := NEW.amount / (1 + NEW.vat_rate);
    NEW.vat_amount := NEW.amount - NEW.net_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_expense_fields_trigger
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION set_expense_fields();