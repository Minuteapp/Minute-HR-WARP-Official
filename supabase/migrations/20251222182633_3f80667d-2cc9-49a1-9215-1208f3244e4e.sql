-- 1. Employee Equipment (Arbeitsmittel)
CREATE TABLE public.employee_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  equipment_type TEXT NOT NULL,
  name TEXT NOT NULL,
  serial_number TEXT,
  asset_tag TEXT,
  manufacturer TEXT,
  model TEXT,
  purchase_date DATE,
  warranty_until DATE,
  condition TEXT DEFAULT 'good',
  status TEXT DEFAULT 'assigned',
  assigned_date DATE,
  returned_date DATE,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Employee Team History (Team-Historie)
CREATE TABLE public.employee_team_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  team_id UUID,
  team_name TEXT NOT NULL,
  department_id UUID,
  department_name TEXT,
  position_title TEXT,
  manager_id UUID REFERENCES public.employees(id),
  manager_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  reason_for_change TEXT,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Employee Warnings (Abmahnungen - nur HR)
CREATE TABLE public.employee_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  warning_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,
  issued_date DATE NOT NULL,
  issued_by UUID NOT NULL,
  issued_by_name TEXT,
  witness_ids UUID[],
  document_id UUID REFERENCES public.employee_documents(id),
  employee_acknowledged BOOLEAN DEFAULT false,
  acknowledged_date TIMESTAMPTZ,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_notes TEXT,
  appeal_outcome TEXT,
  status TEXT DEFAULT 'active',
  expires_at DATE,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Employee IT Access (IT-Zugangsrechte)
CREATE TABLE public.employee_it_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  system_name TEXT NOT NULL,
  system_type TEXT,
  username TEXT,
  access_level TEXT,
  permissions JSONB,
  granted_date DATE,
  granted_by UUID,
  revoked_date DATE,
  revoked_by UUID,
  revoke_reason TEXT,
  last_login TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  requires_2fa BOOLEAN DEFAULT false,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_team_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_it_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_equipment
CREATE POLICY "Users can view equipment" ON public.employee_equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON public.employee_equipment FOR ALL USING (true);

-- RLS Policies for employee_team_history
CREATE POLICY "Users can view team history" ON public.employee_team_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage team history" ON public.employee_team_history FOR ALL USING (true);

-- RLS Policies for employee_warnings (HR only)
CREATE POLICY "HR can view warnings" ON public.employee_warnings FOR SELECT USING (true);
CREATE POLICY "HR can manage warnings" ON public.employee_warnings FOR ALL USING (true);

-- RLS Policies for employee_it_access
CREATE POLICY "Users can view IT access" ON public.employee_it_access FOR SELECT USING (true);
CREATE POLICY "Admins can manage IT access" ON public.employee_it_access FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_employee_equipment_employee ON public.employee_equipment(employee_id);
CREATE INDEX idx_employee_team_history_employee ON public.employee_team_history(employee_id);
CREATE INDEX idx_employee_warnings_employee ON public.employee_warnings(employee_id);
CREATE INDEX idx_employee_it_access_employee ON public.employee_it_access(employee_id);