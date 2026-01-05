-- Erstelle die Ausgaben-Tabelle mit umfassenden Enterprise-Features
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basis-Informationen
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  exchange_rate DECIMAL(10,6),
  amount_local DECIMAL(12,2), -- Betrag in lokaler Währung
  
  -- Kategorisierung
  category TEXT NOT NULL,
  subcategory TEXT,
  tax_classification TEXT DEFAULT 'business',
  
  -- Steuer-Informationen
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  
  -- Datums-Informationen
  date DATE NOT NULL,
  fiscal_year INTEGER,
  quarter INTEGER,
  month INTEGER,
  
  -- Zahlungs-Informationen
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  
  -- Organisatorische Zuordnung
  cost_center TEXT,
  project_id TEXT,
  department TEXT,
  business_trip_id TEXT,
  
  -- Status und Workflow
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID NOT NULL,
  
  -- Genehmigung
  approval_required BOOLEAN DEFAULT true,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejection_reason TEXT,
  
  -- Erstattung
  is_reimbursable BOOLEAN DEFAULT true,
  is_reimbursed BOOLEAN DEFAULT false,
  reimbursement_date DATE,
  reimbursement_amount DECIMAL(12,2),
  
  -- Wiederkehrende Ausgaben
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  recurring_until DATE,
  parent_expense_id UUID,
  
  -- Belege und Dokumentation
  receipt_required BOOLEAN DEFAULT true,
  receipt_submitted BOOLEAN DEFAULT false,
  receipt_url TEXT,
  
  -- Compliance und Richtlinien
  policy_compliance_checked BOOLEAN DEFAULT false,
  policy_violations JSONB DEFAULT '[]',
  compliance_notes TEXT,
  
  -- Zusätzliche Informationen
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- Audit-Informationen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  version INTEGER DEFAULT 1,
  
  -- Löschung (Soft Delete)
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  
  CONSTRAINT valid_currency CHECK (currency IN ('EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CNY')),
  CONSTRAINT valid_category CHECK (category IN ('travel', 'accommodation', 'meals', 'training', 'equipment', 'office_supplies', 'software', 'telecommunications', 'transport', 'entertainment', 'events', 'marketing', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'paid', 'cancelled')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('company_card', 'personal_card', 'cash', 'bank_transfer', 'company_account', 'other')),
  CONSTRAINT valid_tax_classification CHECK (tax_classification IN ('taxable', 'tax_free', 'private', 'business')),
  CONSTRAINT parent_expense_check CHECK (parent_expense_id != id)
);

-- Erstelle die Anhänge-Tabelle
CREATE TABLE public.expense_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  
  -- Metadaten
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL,
  
  -- Dokumentenklassifikation
  document_type TEXT DEFAULT 'receipt',
  ocr_processed BOOLEAN DEFAULT false,
  ocr_data JSONB,
  
  -- Validierung
  is_valid BOOLEAN DEFAULT true,
  validation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_document_type CHECK (document_type IN ('receipt', 'invoice', 'contract', 'report', 'photo', 'other'))
);

-- Erstelle die Kommentare-Tabelle
CREATE TABLE public.expense_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  
  -- Kommentar-Typ
  comment_type TEXT DEFAULT 'general',
  is_internal BOOLEAN DEFAULT false,
  
  -- Antworten
  parent_comment_id UUID REFERENCES public.expense_comments(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_comment_type CHECK (comment_type IN ('general', 'approval', 'rejection', 'clarification', 'audit'))
);

-- Erstelle die Audit-Logs-Tabelle
CREATE TABLE public.expense_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  
  user_id UUID,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Änderungsdetails
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  details JSONB DEFAULT '{}',
  
  -- Session-Informationen
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  CONSTRAINT valid_action CHECK (action IN ('created', 'updated', 'submitted', 'approved', 'rejected', 'deleted', 'restored', 'attachment_added', 'attachment_removed', 'comment_added'))
);

-- Erstelle die Genehmigungsworkflow-Tabelle
CREATE TABLE public.expense_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  
  -- Workflow-Informationen
  approval_step INTEGER NOT NULL DEFAULT 1,
  approver_role TEXT NOT NULL,
  approver_id UUID,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  
  -- Kommentare und Begründung
  comment TEXT,
  conditions TEXT,
  
  -- Eskalation
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID,
  escalation_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'skipped'))
);

-- Erstelle die Richtlinien-Tabelle
CREATE TABLE public.expense_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Anwendungsbereich
  category TEXT,
  department TEXT,
  role_restrictions TEXT[],
  
  -- Limits
  max_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  
  -- Genehmigungsregeln
  requires_receipt_threshold DECIMAL(12,2) DEFAULT 0,
  requires_approval_threshold DECIMAL(12,2) DEFAULT 0,
  approval_roles TEXT[] DEFAULT '{}',
  
  -- Zeitliche Beschränkungen
  valid_from DATE,
  valid_until DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT valid_policy_currency CHECK (currency IN ('EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CNY'))
);

-- Erstelle die Kostenstellen-Tabelle
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchie
  parent_cost_center_id UUID REFERENCES public.cost_centers(id),
  level INTEGER DEFAULT 1,
  
  -- Verantwortlichkeiten
  manager_id UUID,
  department TEXT,
  
  -- Budget
  annual_budget DECIMAL(15,2),
  current_spent DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Indizes für bessere Performance
CREATE INDEX idx_expenses_submitted_by ON public.expenses(submitted_by);
CREATE INDEX idx_expenses_status ON public.expenses(status);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_cost_center ON public.expenses(cost_center);
CREATE INDEX idx_expenses_amount ON public.expenses(amount);
CREATE INDEX idx_expenses_fiscal_year ON public.expenses(fiscal_year);
CREATE INDEX idx_expenses_deleted_at ON public.expenses(deleted_at);

CREATE INDEX idx_expense_attachments_expense_id ON public.expense_attachments(expense_id);
CREATE INDEX idx_expense_comments_expense_id ON public.expense_comments(expense_id);
CREATE INDEX idx_expense_audit_logs_expense_id ON public.expense_audit_logs(expense_id);
CREATE INDEX idx_expense_approvals_expense_id ON public.expense_approvals(expense_id);

-- Erstelle Trigger für automatische Zeitstempel-Updates
CREATE OR REPLACE FUNCTION public.update_expense_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expense_updated_at();

-- Trigger für Berechnung von Steuer- und Netto-Beträgen
CREATE OR REPLACE FUNCTION public.calculate_expense_amounts()
RETURNS trigger AS $$
BEGIN
  -- Setze Fiscal Year, Quarter, etc.
  NEW.fiscal_year := EXTRACT(YEAR FROM NEW.date);
  NEW.quarter := EXTRACT(QUARTER FROM NEW.date);
  NEW.month := EXTRACT(MONTH FROM NEW.date);
  
  -- Berechne Netto-Betrag wenn VAT-Rate gegeben
  IF NEW.tax_rate IS NOT NULL AND NEW.tax_rate > 0 THEN
    NEW.net_amount := NEW.amount / (1 + NEW.tax_rate / 100);
    NEW.vat_amount := NEW.amount - NEW.net_amount;
    NEW.tax_amount := NEW.vat_amount;
  ELSE
    NEW.net_amount := NEW.amount;
    NEW.vat_amount := 0;
    NEW.tax_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_expense_amounts_trigger
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_expense_amounts();

-- Trigger für Audit-Logging
CREATE OR REPLACE FUNCTION public.log_expense_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.expense_audit_logs (expense_id, action, user_id, details)
    VALUES (NEW.id, 'created', NEW.created_by, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.expense_audit_logs (expense_id, action, user_id, details)
    VALUES (NEW.id, 'updated', NEW.updated_by, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.expense_audit_logs (expense_id, action, user_id, details)
    VALUES (OLD.id, 'deleted', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_expense_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_expense_changes();

-- Row Level Security aktivieren
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies für expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can update their own draft expenses" ON public.expenses
  FOR UPDATE USING (submitted_by = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can view all expenses" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'finance')
    )
  );

CREATE POLICY "Admins can update all expenses" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'finance')
    )
  );

-- RLS Policies für expense_attachments
CREATE POLICY "Users can view attachments of their expenses" ON public.expense_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND submitted_by = auth.uid()
    )
  );

CREATE POLICY "Users can add attachments to their expenses" ON public.expense_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND submitted_by = auth.uid()
    )
  );

-- RLS Policies für expense_comments
CREATE POLICY "Users can view comments on their expenses" ON public.expense_comments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND submitted_by = auth.uid()
    )
  );

CREATE POLICY "Users can add comments to expenses" ON public.expense_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies für andere Tabellen
CREATE POLICY "Users can view relevant audit logs" ON public.expense_audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND submitted_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view cost centers" ON public.cost_centers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view expense policies" ON public.expense_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);