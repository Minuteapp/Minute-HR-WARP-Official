-- Benefit-Vorlagen (Templates für HR)
CREATE TABLE public.benefit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('allowance', 'childcare', 'fitness', 'vl', 'discount', 'corporate')),
  category TEXT,
  description TEXT,
  default_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2),
  tax_treatment TEXT CHECK (tax_treatment IN ('tax_free', 'taxable', 'partial')),
  legal_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mitarbeiter-Benefits (individuelle Zuweisungen)
CREATE TABLE public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.benefit_templates(id),
  amount DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  custom_settings JSONB DEFAULT '{}',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VL-Verträge
CREATE TABLE public.employee_vl_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  contract_type TEXT CHECK (contract_type IN ('bausparen', 'fondssparplan', 'banksparplan', 'betriebliche_altersvorsorge')),
  provider TEXT,
  contract_number TEXT,
  monthly_employer DECIMAL(10,2) DEFAULT 0,
  monthly_employee DECIMAL(10,2) DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  contract_duration INTEGER,
  total_accumulated DECIMAL(10,2) DEFAULT 0,
  eligible_for_bonus BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fitness-Mitgliedschaften
CREATE TABLE public.employee_fitness_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  membership_type TEXT,
  membership_id TEXT,
  employer_contribution DECIMAL(10,2) DEFAULT 0,
  employee_contribution DECIMAL(10,2) DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  check_ins_count INTEGER DEFAULT 0,
  last_check_in DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kinderbetreuungs-Zuschüsse
CREATE TABLE public.employee_childcare_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  monthly_allowance DECIMAL(10,2) NOT NULL,
  facility_name TEXT,
  facility_type TEXT CHECK (facility_type IN ('kita', 'tagesmutter', 'hort', 'other')),
  child_name TEXT,
  child_birth_date DATE,
  num_children INTEGER DEFAULT 1,
  approved_since DATE,
  approved_until DATE,
  additional_benefits JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sachbezüge & Zuschüsse
CREATE TABLE public.employee_benefit_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('meal', 'fuel', 'deutschlandticket', 'internet', 'phone', 'other')),
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'monthly', 'yearly', 'one_time')),
  description TEXT,
  valid_from DATE,
  valid_until DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mitarbeiter-Rabatte
CREATE TABLE public.employee_discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  discount_level INTEGER DEFAULT 1,
  year_total DECIMAL(10,2) DEFAULT 0,
  year_savings DECIMAL(10,2) DEFAULT 0,
  last_order_date DATE,
  last_order_number TEXT,
  eligible_family_members INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.benefit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_vl_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_fitness_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_childcare_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefit_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_discount_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies für benefit_templates
CREATE POLICY "benefit_templates_select" ON public.benefit_templates FOR SELECT USING (true);
CREATE POLICY "benefit_templates_insert" ON public.benefit_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "benefit_templates_update" ON public.benefit_templates FOR UPDATE USING (true);
CREATE POLICY "benefit_templates_delete" ON public.benefit_templates FOR DELETE USING (true);

-- RLS Policies für employee_benefits
CREATE POLICY "employee_benefits_select" ON public.employee_benefits FOR SELECT USING (true);
CREATE POLICY "employee_benefits_insert" ON public.employee_benefits FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_benefits_update" ON public.employee_benefits FOR UPDATE USING (true);
CREATE POLICY "employee_benefits_delete" ON public.employee_benefits FOR DELETE USING (true);

-- RLS Policies für employee_vl_contracts
CREATE POLICY "employee_vl_contracts_select" ON public.employee_vl_contracts FOR SELECT USING (true);
CREATE POLICY "employee_vl_contracts_insert" ON public.employee_vl_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_vl_contracts_update" ON public.employee_vl_contracts FOR UPDATE USING (true);
CREATE POLICY "employee_vl_contracts_delete" ON public.employee_vl_contracts FOR DELETE USING (true);

-- RLS Policies für employee_fitness_memberships
CREATE POLICY "employee_fitness_memberships_select" ON public.employee_fitness_memberships FOR SELECT USING (true);
CREATE POLICY "employee_fitness_memberships_insert" ON public.employee_fitness_memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_fitness_memberships_update" ON public.employee_fitness_memberships FOR UPDATE USING (true);
CREATE POLICY "employee_fitness_memberships_delete" ON public.employee_fitness_memberships FOR DELETE USING (true);

-- RLS Policies für employee_childcare_benefits
CREATE POLICY "employee_childcare_benefits_select" ON public.employee_childcare_benefits FOR SELECT USING (true);
CREATE POLICY "employee_childcare_benefits_insert" ON public.employee_childcare_benefits FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_childcare_benefits_update" ON public.employee_childcare_benefits FOR UPDATE USING (true);
CREATE POLICY "employee_childcare_benefits_delete" ON public.employee_childcare_benefits FOR DELETE USING (true);

-- RLS Policies für employee_benefit_allowances
CREATE POLICY "employee_benefit_allowances_select" ON public.employee_benefit_allowances FOR SELECT USING (true);
CREATE POLICY "employee_benefit_allowances_insert" ON public.employee_benefit_allowances FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_benefit_allowances_update" ON public.employee_benefit_allowances FOR UPDATE USING (true);
CREATE POLICY "employee_benefit_allowances_delete" ON public.employee_benefit_allowances FOR DELETE USING (true);

-- RLS Policies für employee_discount_usage
CREATE POLICY "employee_discount_usage_select" ON public.employee_discount_usage FOR SELECT USING (true);
CREATE POLICY "employee_discount_usage_insert" ON public.employee_discount_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "employee_discount_usage_update" ON public.employee_discount_usage FOR UPDATE USING (true);
CREATE POLICY "employee_discount_usage_delete" ON public.employee_discount_usage FOR DELETE USING (true);

-- Seed-Daten: Benefit-Vorlagen
INSERT INTO public.benefit_templates (name, type, category, description, default_amount, max_amount, tax_treatment, legal_reference, is_active) VALUES
('Essensgutscheine', 'allowance', 'meal', 'Monatliche Essenszuschüsse in Form von Gutscheinen oder digitalen Karten', 50.00, 50.00, 'tax_free', '§ 8 Abs. 2 EStG - Sachbezugsfreigrenze', true),
('Deutschlandticket', 'allowance', 'deutschlandticket', 'Zuschuss zum Deutschlandticket für ÖPNV', 49.00, 49.00, 'tax_free', '§ 3 Nr. 15 EStG - Jobticket', true),
('Internetpauschale', 'allowance', 'internet', 'Monatlicher Zuschuss für private Internetnutzung im Homeoffice', 50.00, 50.00, 'partial', '§ 3 Nr. 45 EStG', true),
('Tankgutschein', 'allowance', 'fuel', 'Monatlicher Tankgutschein als Sachbezug', 50.00, 50.00, 'tax_free', '§ 8 Abs. 2 EStG - Sachbezugsfreigrenze', true),
('EGYM Wellpass', 'fitness', 'gym', 'Zugang zu Fitnessstudios und Sportangeboten deutschlandweit', 30.00, 50.00, 'taxable', 'Geldwerter Vorteil § 8 EStG', true),
('Urban Sports Club', 'fitness', 'gym', 'Flexible Sport-Flatrate für verschiedene Sportarten', 35.00, 60.00, 'taxable', 'Geldwerter Vorteil § 8 EStG', true),
('VL-Zuschuss Standard', 'vl', 'vermoegenswirksam', 'Vermögenswirksame Leistungen nach Tarifvertrag', 40.00, 40.00, 'tax_free', '5. VermBG', true),
('VL-Zuschuss Premium', 'vl', 'vermoegenswirksam', 'Erhöhte vermögenswirksame Leistungen für Führungskräfte', 80.00, 80.00, 'tax_free', '5. VermBG', true),
('Kinderbetreuung Basis', 'childcare', 'kita', 'Zuschuss zur Kinderbetreuung (Kita, Tagesmutter)', 300.00, 600.00, 'tax_free', '§ 3 Nr. 33 EStG', true),
('Kinderbetreuung Premium', 'childcare', 'kita', 'Erhöhter Zuschuss zur Kinderbetreuung', 600.00, 1000.00, 'tax_free', '§ 3 Nr. 33 EStG', true),
('Corporate Benefits Portal', 'corporate', 'discount', 'Zugang zum Corporate Benefits Mitarbeiterrabatt-Portal', 0.00, NULL, 'tax_free', 'Rabatte bis 44€/Monat steuerfrei', true),
('Mitarbeiterrabatt Produkte', 'discount', 'employee_discount', 'Rabatt auf Unternehmensprodukte', 0.00, 1080.00, 'partial', '§ 8 Abs. 3 EStG - Rabattfreibetrag 1.080€/Jahr', true);