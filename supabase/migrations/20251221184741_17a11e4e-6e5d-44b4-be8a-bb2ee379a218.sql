-- Tabelle für Belohnungs-Auszahlungen
CREATE TABLE public.reward_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id),
  employee_name TEXT,
  reward_name TEXT NOT NULL,
  reward_value NUMERIC,
  reward_type TEXT CHECK (reward_type IN ('bank_transfer', 'voucher', 'non_financial', 'experience')),
  payout_method TEXT CHECK (payout_method IN ('bank_transfer', 'email', 'hr_system', 'eventbrite', 'manual')),
  requested_at DATE NOT NULL DEFAULT CURRENT_DATE,
  delivered_at DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'failed')),
  error_message TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für archivierte Belohnungen
CREATE TABLE public.reward_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_date DATE NOT NULL,
  employee_id UUID REFERENCES public.profiles(id),
  employee_name TEXT,
  reward_name TEXT NOT NULL,
  reward_description TEXT,
  value_display TEXT NOT NULL,
  value_amount NUMERIC,
  category TEXT NOT NULL,
  department TEXT,
  approved_by TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Belohnungs-Einstellungen
CREATE TABLE public.reward_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) UNIQUE,
  module_name TEXT DEFAULT 'Belohnungen & Goodies',
  module_description TEXT DEFAULT 'Strategisches Incentive- und Anerkennungsmodul',
  is_module_active BOOLEAN DEFAULT true,
  is_peer_recognition_active BOOLEAN DEFAULT true,
  yearly_budget NUMERIC DEFAULT 45000,
  max_reward_per_employee_monthly NUMERIC DEFAULT 1000,
  team_lead_approval_threshold NUMERIC DEFAULT 500,
  budget_warning_enabled BOOLEAN DEFAULT true,
  budget_warning_threshold INTEGER DEFAULT 80,
  auto_sync_enabled BOOLEAN DEFAULT true,
  default_payment_type TEXT DEFAULT 'bonus',
  payout_timing TEXT DEFAULT 'next_payroll',
  tax_optimization_enabled BOOLEAN DEFAULT true,
  email_notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Berechtigungen
CREATE TABLE public.reward_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  role TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, role)
);

-- Tabelle für Verteilungsmethoden
CREATE TABLE public.distribution_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  method_name TEXT NOT NULL,
  method_type TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.reward_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies für reward_payouts
CREATE POLICY "Users can view reward_payouts" ON public.reward_payouts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reward_payouts" ON public.reward_payouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update reward_payouts" ON public.reward_payouts
  FOR UPDATE USING (true);

-- RLS Policies für reward_archive
CREATE POLICY "Users can view reward_archive" ON public.reward_archive
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reward_archive" ON public.reward_archive
  FOR INSERT WITH CHECK (true);

-- RLS Policies für reward_settings
CREATE POLICY "Users can view reward_settings" ON public.reward_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reward_settings" ON public.reward_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update reward_settings" ON public.reward_settings
  FOR UPDATE USING (true);

-- RLS Policies für reward_permissions
CREATE POLICY "Users can view reward_permissions" ON public.reward_permissions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage reward_permissions" ON public.reward_permissions
  FOR ALL USING (true);

-- RLS Policies für distribution_methods
CREATE POLICY "Users can view distribution_methods" ON public.distribution_methods
  FOR SELECT USING (true);

CREATE POLICY "Users can manage distribution_methods" ON public.distribution_methods
  FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_reward_payouts_company ON public.reward_payouts(company_id);
CREATE INDEX idx_reward_payouts_status ON public.reward_payouts(status);
CREATE INDEX idx_reward_archive_company ON public.reward_archive(company_id);
CREATE INDEX idx_reward_archive_date ON public.reward_archive(archive_date);

-- Trigger für updated_at
CREATE TRIGGER update_reward_payouts_updated_at
  BEFORE UPDATE ON public.reward_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_settings_updated_at
  BEFORE UPDATE ON public.reward_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_permissions_updated_at
  BEFORE UPDATE ON public.reward_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();