-- Enterprise Workforce Management - Kern-Tabellen

-- Ressourcentypen
CREATE TABLE IF NOT EXISTS public.wfm_resource_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('person', 'asset', 'location', 'equipment')),
  icon TEXT,
  color TEXT,
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Assets/Ressourcen
CREATE TABLE IF NOT EXISTS public.wfm_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  resource_type_id UUID NOT NULL REFERENCES public.wfm_resource_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identifier TEXT,
  location_id UUID,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'reserved', 'unavailable')),
  capacity JSONB,
  attributes JSONB DEFAULT '{}',
  maintenance_schedule JSONB,
  required_skills TEXT[],
  required_licenses TEXT[],
  cost_per_hour DECIMAL(10,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS public.wfm_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Lizenzen
CREATE TABLE IF NOT EXISTS public.wfm_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_authority TEXT,
  validity_period_months INTEGER,
  required_for_resources TEXT[],
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Mitarbeiter-Skills
CREATE TABLE IF NOT EXISTS public.wfm_employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.wfm_skills(id) ON DELETE CASCADE,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  acquired_date DATE,
  verified_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, skill_id)
);

-- Mitarbeiter-Lizenzen
CREATE TABLE IF NOT EXISTS public.wfm_employee_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.wfm_licenses(id) ON DELETE CASCADE,
  license_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  verified_by UUID,
  document_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, license_id, license_number)
);

-- Planungsregeln
CREATE TABLE IF NOT EXISTS public.wfm_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('legal', 'tariff', 'internal', 'safety', 'custom')),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('hard_constraint', 'soft_goal', 'preference')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'location', 'department', 'team', 'role')),
  scope_id UUID,
  country_code TEXT,
  priority INTEGER DEFAULT 50,
  condition JSONB NOT NULL,
  violation_message TEXT,
  violation_severity TEXT CHECK (violation_severity IN ('info', 'warning', 'error', 'critical')),
  can_override BOOLEAN DEFAULT false,
  override_requires_approval BOOLEAN DEFAULT true,
  override_approval_roles TEXT[],
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schichttausch-Anfragen
CREATE TABLE IF NOT EXISTS public.wfm_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  original_shift_id UUID NOT NULL,
  requesting_employee_id UUID NOT NULL REFERENCES public.employees(id),
  target_employee_id UUID REFERENCES public.employees(id),
  target_shift_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  compliance_check_passed BOOLEAN,
  compliance_violations JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schicht-Marktplatz
CREATE TABLE IF NOT EXISTS public.wfm_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL,
  shift_type_id UUID,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_id UUID,
  department TEXT,
  required_skills UUID[],
  required_licenses UUID[],
  min_seniority TEXT,
  base_pay DECIMAL(10,2),
  incentive_pay DECIMAL(10,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'filled', 'cancelled')),
  claimed_by UUID REFERENCES public.employees(id),
  claimed_at TIMESTAMPTZ,
  visible_to_roles TEXT[],
  posted_by UUID NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mitarbeiter-Präferenzen
CREATE TABLE IF NOT EXISTS public.wfm_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  preferred_shift_types TEXT[],
  preferred_days_of_week INTEGER[],
  preferred_time_slots JSONB,
  blackout_dates JSONB,
  max_hours_per_week INTEGER,
  max_consecutive_days INTEGER,
  min_rest_hours INTEGER,
  prefers_fixed_schedule BOOLEAN DEFAULT false,
  willing_to_work_weekends BOOLEAN DEFAULT true,
  willing_to_work_nights BOOLEAN DEFAULT true,
  flexibility_score INTEGER CHECK (flexibility_score >= 1 AND flexibility_score <= 5),
  notes TEXT,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Szenarien
CREATE TABLE IF NOT EXISTS public.wfm_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('what_if', 'crisis', 'forecast', 'optimization')),
  base_date_from DATE NOT NULL,
  base_date_to DATE NOT NULL,
  assumptions JSONB NOT NULL,
  results JSONB,
  cost_impact DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'applied')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_wfm_resources_company ON public.wfm_resources(company_id);
CREATE INDEX IF NOT EXISTS idx_wfm_resources_type ON public.wfm_resources(resource_type_id);
CREATE INDEX IF NOT EXISTS idx_wfm_employee_skills_employee ON public.wfm_employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_wfm_employee_licenses_employee ON public.wfm_employee_licenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_wfm_employee_licenses_expiry ON public.wfm_employee_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_wfm_swap_status ON public.wfm_swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_wfm_marketplace_date ON public.wfm_marketplace(shift_date);
CREATE INDEX IF NOT EXISTS idx_wfm_marketplace_status ON public.wfm_marketplace(status);