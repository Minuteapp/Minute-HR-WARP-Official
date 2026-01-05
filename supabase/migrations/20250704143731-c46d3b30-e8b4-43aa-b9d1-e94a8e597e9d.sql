-- Erweiterte Ausgaben-Verwaltung für Enterprise-Suite
-- Erst bestehende Tabellen erweitern oder neue erstellen

-- Kostenstellen-Verwaltung
CREATE TABLE IF NOT EXISTS public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_cost_center_id UUID REFERENCES public.cost_centers(id),
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
  category_type TEXT NOT NULL, -- 'opex', 'personnel', 'travel', 'marketing', 'rd', 'production', 'finance', 'depreciation', 'taxes', 'compliance', 'csr', 'other'
  parent_category_id UUID REFERENCES public.expense_categories(id),
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

-- Erweiterte Ausgaben-Tabelle
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_number VARCHAR(50) UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  expense_date DATE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  project_id UUID,
  budget_plan_id UUID REFERENCES public.budget_plans(id),
  supplier_name TEXT,
  supplier_id UUID,
  invoice_number TEXT,
  expense_type TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'capital', 'extraordinary'
  payment_method TEXT, -- 'corporate_card', 'cash', 'bank_transfer', 'invoice'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
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
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_review'
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
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected', 'paid', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Genehmigungs-Workflows
CREATE TABLE IF NOT EXISTS public.expense_approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.expense_categories(id),
  amount_threshold_min NUMERIC DEFAULT 0,
  amount_threshold_max NUMERIC,
  approval_steps JSONB NOT NULL, -- Array of approval steps with approver_roles, conditions, etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Genehmigungs-Verlauf
CREATE TABLE IF NOT EXISTS public.expense_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.expense_approval_workflows(id),
  approver_id UUID NOT NULL,
  approval_step INTEGER NOT NULL,
  approval_status TEXT NOT NULL, -- 'pending', 'approved', 'rejected', 'delegated'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget-Ausgaben-Verknüpfung (für Ist-Soll-Vergleiche)
CREATE TABLE IF NOT EXISTS public.budget_expense_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  budget_plan_id UUID REFERENCES public.budget_plans(id),
  allocated_amount NUMERIC NOT NULL,
  allocation_percentage NUMERIC DEFAULT 100,
  allocation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
  risk_rating TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Wiederkehrende Ausgaben
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  category_id UUID REFERENCES public.expense_categories(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly', 'custom'
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

-- Ausgaben-Analysen und KI-Insights
CREATE TABLE IF NOT EXISTS public.expense_analytics (
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

-- Ausgaben-Benachrichtigungen
CREATE TABLE IF NOT EXISTS public.expense_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id),
  notification_type TEXT NOT NULL, -- 'approval_required', 'budget_exceeded', 'due_date_approaching', 'payment_overdue'
  recipient_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
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

-- RLS Policies
-- Cost Centers
CREATE POLICY "Users can view cost centers" ON public.cost_centers FOR SELECT USING (true);
CREATE POLICY "Admins can manage cost centers" ON public.cost_centers FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Expense Categories
CREATE POLICY "Users can view expense categories" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage expense categories" ON public.expense_categories FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Expenses
CREATE POLICY "Users can view accessible expenses" ON public.expenses FOR SELECT USING (
  submitted_by = auth.uid() OR 
  employee_id = auth.uid() OR 
  is_admin(auth.uid()) OR 
  is_superadmin(auth.uid())
);
CREATE POLICY "Users can create expenses" ON public.expenses FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (
  submitted_by = auth.uid() OR 
  is_admin(auth.uid()) OR 
  is_superadmin(auth.uid())
);

-- Suppliers
CREATE POLICY "Users can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Notifications
CREATE POLICY "Users can view their notifications" ON public.expense_notifications FOR SELECT USING (recipient_id = auth.uid());

-- Triggers für updated_at
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON public.cost_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON public.expense_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON public.recurring_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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