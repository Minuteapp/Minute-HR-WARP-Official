-- Enterprise Expense Management - Nur Tabellen erstellen
-- Kostenstellen
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

-- Ausgaben-Kategorien
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

-- Lieferanten
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

-- Ausgaben
CREATE TABLE public.expenses (
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
('OFFICE', 'Büroausstattung', 'opex', '#92400E', 'Home');

-- Standard-Kostenstellen einfügen
INSERT INTO public.cost_centers (code, name, description, department) VALUES
('CC001', 'Geschäftsführung', 'Zentrale Geschäftsführung', 'Management'),
('CC002', 'Vertrieb', 'Vertrieb und Sales', 'Sales'),
('CC003', 'Marketing', 'Marketing und Werbung', 'Marketing'),
('CC004', 'IT', 'IT-Abteilung', 'IT'),
('CC005', 'HR', 'Personalwesen', 'HR'),
('CC006', 'Finanzen', 'Finanz- und Rechnungswesen', 'Finance');

-- Enable RLS
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Vereinfachte RLS Policies
CREATE POLICY "cost_centers_read" ON public.cost_centers FOR SELECT USING (true);
CREATE POLICY "expense_categories_read" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "suppliers_read" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "expenses_read" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE USING (true);