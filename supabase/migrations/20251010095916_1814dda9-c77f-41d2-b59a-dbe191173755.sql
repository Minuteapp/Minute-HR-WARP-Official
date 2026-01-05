-- ============================================================
-- MODUL: ABWESENHEIT - Phase 1: Datenmodell & Infrastruktur
-- ============================================================

-- 1. KONTINGENT-MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  absence_type TEXT NOT NULL CHECK (absence_type IN ('vacation', 'sick_leave', 'sick_leave_with_certificate', 'special_leave', 'parental_leave', 'educational_leave', 'care_leave', 'unpaid_leave', 'compensatory_time')),
  quota_year INTEGER NOT NULL,
  total_days DECIMAL(5,2) NOT NULL CHECK (total_days >= 0),
  used_days DECIMAL(5,2) DEFAULT 0 CHECK (used_days >= 0),
  planned_days DECIMAL(5,2) DEFAULT 0 CHECK (planned_days >= 0),
  remaining_days DECIMAL(5,2) GENERATED ALWAYS AS (total_days - used_days - planned_days) STORED,
  carryover_days DECIMAL(5,2) DEFAULT 0 CHECK (carryover_days >= 0),
  carryover_valid_until DATE,
  pro_rata_calculation JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, absence_type, quota_year),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_absence_quotas_user ON absence_quotas(user_id);
CREATE INDEX idx_absence_quotas_company ON absence_quotas(company_id);
CREATE INDEX idx_absence_quotas_year ON absence_quotas(quota_year);

-- 2. SPERRZEITEN / BLACKOUT-DATES
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_blackout_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department TEXT,
  team TEXT,
  location_id UUID,
  absence_type TEXT CHECK (absence_type IN ('vacation', 'sick_leave', 'sick_leave_with_certificate', 'special_leave', 'parental_leave', 'educational_leave', 'care_leave', 'unpaid_leave', 'compensatory_time') OR absence_type IS NULL),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  reason TEXT NOT NULL,
  max_concurrent_absences INTEGER CHECK (max_concurrent_absences > 0),
  applies_to_roles TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_blackout_periods_company ON absence_blackout_periods(company_id);
CREATE INDEX idx_blackout_periods_dates ON absence_blackout_periods(start_date, end_date);

-- 3. VERTRETUNGSREGELN
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_substitute_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  substitute_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  absence_types TEXT[],
  valid_from DATE,
  valid_until DATE,
  priority INTEGER DEFAULT 1 CHECK (priority > 0),
  auto_assign BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id != substitute_user_id),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_substitute_rules_user ON absence_substitute_rules(user_id);
CREATE INDEX idx_substitute_rules_substitute ON absence_substitute_rules(substitute_user_id);

-- 4. PAYROLL-INTEGRATION
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_payroll_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  absence_type TEXT NOT NULL CHECK (absence_type IN ('vacation', 'sick_leave', 'sick_leave_with_certificate', 'special_leave', 'parental_leave', 'educational_leave', 'care_leave', 'unpaid_leave', 'compensatory_time')),
  absence_subtype TEXT,
  payroll_code TEXT NOT NULL,
  calculation_rule TEXT NOT NULL CHECK (calculation_rule IN ('full_pay', 'partial_pay', 'no_pay', 'statutory')),
  payment_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (payment_percentage >= 0 AND payment_percentage <= 100),
  apply_social_insurance BOOLEAN DEFAULT true,
  export_format TEXT CHECK (export_format IN ('datev', 'sevdesk', 'sap', 'custom')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, absence_type, absence_subtype),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_payroll_mappings_company ON absence_payroll_mappings(company_id);

-- 5. EINSTELLUNGEN-HIERARCHIE
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_settings_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'company', 'location', 'department', 'role')),
  scope_id UUID,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  inherits_from UUID REFERENCES absence_settings_hierarchy(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_settings_hierarchy_company ON absence_settings_hierarchy(company_id);
CREATE INDEX idx_settings_hierarchy_scope ON absence_settings_hierarchy(scope_type, scope_id);
CREATE INDEX idx_settings_hierarchy_key ON absence_settings_hierarchy(setting_key);

-- 6. AUDIT-TRAIL
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_request_id UUID REFERENCES absence_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'cancelled', 'quota_adjusted', 'substitute_assigned', 'document_uploaded', 'calendar_synced', 'payroll_exported')),
  performed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_trail_request ON absence_audit_trail(absence_request_id);
CREATE INDEX idx_audit_trail_date ON absence_audit_trail(created_at);
CREATE INDEX idx_audit_trail_user ON absence_audit_trail(performed_by);

-- 7. FEIERTAGE-KALENDER
-- ============================================================
CREATE TABLE IF NOT EXISTS absence_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_code TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  name TEXT NOT NULL,
  is_public_holiday BOOLEAN DEFAULT true,
  affects_absences BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, location_code, holiday_date),
  CONSTRAINT valid_company_id CHECK (company_id = get_effective_company_id() OR current_setting('role', true) IN ('postgres', 'service_role'))
);

CREATE INDEX idx_holidays_company ON absence_holidays(company_id);
CREATE INDEX idx_holidays_date ON absence_holidays(holiday_date);

-- 8. ERWEITERE absence_requests TABELLE
-- ============================================================
ALTER TABLE absence_requests
  ADD COLUMN IF NOT EXISTS quota_id UUID REFERENCES absence_quotas(id),
  ADD COLUMN IF NOT EXISTS workflow_instance_id UUID REFERENCES workflow_instances(id),
  ADD COLUMN IF NOT EXISTS substitute_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS substitute_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS substitute_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blackout_override_reason TEXT,
  ADD COLUMN IF NOT EXISTS blackout_override_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS payroll_exported BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payroll_export_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payroll_reference TEXT,
  ADD COLUMN IF NOT EXISTS calendar_event_ids JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conflicts_resolved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_partial_day BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS partial_start_time TIME,
  ADD COLUMN IF NOT EXISTS partial_end_time TIME;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- absence_quotas
ALTER TABLE absence_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own quotas"
  ON absence_quotas FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

CREATE POLICY "HR manages quotas"
  ON absence_quotas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_blackout_periods
ALTER TABLE absence_blackout_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view blackout periods"
  ON absence_blackout_periods FOR SELECT
  USING (company_id = get_effective_company_id());

CREATE POLICY "HR manages blackout periods"
  ON absence_blackout_periods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_substitute_rules
ALTER TABLE absence_substitute_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own substitute rules"
  ON absence_substitute_rules FOR ALL
  USING (
    user_id = auth.uid() 
    OR substitute_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_payroll_mappings
ALTER TABLE absence_payroll_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR views payroll mappings"
  ON absence_payroll_mappings FOR SELECT
  USING (
    company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

CREATE POLICY "HR manages payroll mappings"
  ON absence_payroll_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_settings_hierarchy
ALTER TABLE absence_settings_hierarchy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view settings"
  ON absence_settings_hierarchy FOR SELECT
  USING (company_id = get_effective_company_id());

CREATE POLICY "Admin manages settings"
  ON absence_settings_hierarchy FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_audit_trail
ALTER TABLE absence_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit trail"
  ON absence_audit_trail FOR SELECT
  USING (
    performed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM absence_requests ar
      WHERE ar.id = absence_request_id
        AND ar.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- absence_holidays
ALTER TABLE absence_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view holidays"
  ON absence_holidays FOR SELECT
  USING (company_id = get_effective_company_id());

CREATE POLICY "HR manages holidays"
  ON absence_holidays FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'hr', 'superadmin')
        AND ur.company_id = get_effective_company_id()
    )
  );

-- ============================================================
-- TRIGGER & FUNCTIONS
-- ============================================================

-- 1. Automatische Kontingent-Aktualisierung
CREATE OR REPLACE FUNCTION update_absence_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_days DECIMAL(5,2);
BEGIN
  v_days := EXTRACT(EPOCH FROM (NEW.end_date - NEW.start_date)) / 86400 + 1;
  
  IF NEW.is_partial_day AND NEW.partial_start_time IS NOT NULL AND NEW.partial_end_time IS NOT NULL THEN
    v_days := v_days * 0.5;
  END IF;

  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE absence_quotas
    SET 
      planned_days = GREATEST(0, planned_days - v_days),
      used_days = used_days + v_days,
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    UPDATE absence_quotas
    SET 
      planned_days = planned_days + v_days,
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'pending' THEN
    UPDATE absence_quotas
    SET 
      planned_days = GREATEST(0, planned_days - v_days),
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
      
  ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'approved' THEN
    UPDATE absence_quotas
    SET 
      used_days = GREATEST(0, used_days - v_days),
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND absence_type = NEW.type
      AND quota_year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_quota_on_status_change ON absence_requests;
CREATE TRIGGER update_quota_on_status_change
  AFTER INSERT OR UPDATE OF status ON absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_absence_quota();

-- 2. Audit-Trail automatisch erfassen
CREATE OR REPLACE FUNCTION log_absence_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO absence_audit_trail (
    absence_request_id, 
    action, 
    performed_by, 
    old_values, 
    new_values,
    ip_address
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'cancelled'
    END,
    auth.uid(),
    to_jsonb(OLD),
    to_jsonb(NEW),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_absence_changes ON absence_requests;
CREATE TRIGGER audit_absence_changes
  AFTER INSERT OR UPDATE OR DELETE ON absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_absence_changes();

-- 3. Blackout-Period-Validierung
CREATE OR REPLACE FUNCTION check_blackout_periods()
RETURNS TRIGGER AS $$
DECLARE
  v_conflict RECORD;
  v_user_role TEXT;
  v_department TEXT;
BEGIN
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = NEW.user_id
    AND company_id = get_effective_company_id()
  LIMIT 1;
  
  SELECT * INTO v_conflict
  FROM absence_blackout_periods bp
  WHERE bp.is_active = true
    AND bp.company_id = get_effective_company_id()
    AND NEW.start_date <= bp.end_date
    AND NEW.end_date >= bp.start_date
    AND (bp.absence_type IS NULL OR bp.absence_type = NEW.type)
    AND (bp.department IS NULL OR bp.department = v_department)
    AND (bp.applies_to_roles IS NULL OR v_user_role = ANY(bp.applies_to_roles))
  LIMIT 1;
  
  IF FOUND AND NEW.blackout_override_reason IS NULL THEN
    RAISE EXCEPTION 'Abwesenheit liegt in Sperrzeit (% bis %): %. Bitte Administrator kontaktieren.', 
      v_conflict.start_date, v_conflict.end_date, v_conflict.reason;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_blackout_periods ON absence_requests;
CREATE TRIGGER validate_blackout_periods
  BEFORE INSERT OR UPDATE ON absence_requests
  FOR EACH ROW
  WHEN (NEW.status IN ('pending', 'approved'))
  EXECUTE FUNCTION check_blackout_periods();

-- 4. Updated-At Trigger
DROP TRIGGER IF EXISTS update_absence_quotas_updated_at ON absence_quotas;
CREATE TRIGGER update_absence_quotas_updated_at
  BEFORE UPDATE ON absence_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_hierarchy_updated_at ON absence_settings_hierarchy;
CREATE TRIGGER update_settings_hierarchy_updated_at
  BEFORE UPDATE ON absence_settings_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INITIALE DATEN
-- ============================================================

INSERT INTO absence_settings_hierarchy (company_id, scope_type, setting_key, setting_value, priority)
SELECT 
  c.id,
  'company',
  'absence_types',
  jsonb_build_object(
    'vacation', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', true, 'color', 'blue'),
    'sick_leave', jsonb_build_object('enabled', true, 'requires_approval', false, 'affects_quota', false, 'color', 'red'),
    'sick_leave_with_certificate', jsonb_build_object('enabled', true, 'requires_approval', false, 'affects_quota', false, 'color', 'orange'),
    'special_leave', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', true, 'color', 'purple'),
    'parental_leave', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', false, 'color', 'pink'),
    'educational_leave', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', true, 'color', 'indigo'),
    'care_leave', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', false, 'color', 'green'),
    'unpaid_leave', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', false, 'color', 'yellow'),
    'compensatory_time', jsonb_build_object('enabled', true, 'requires_approval', true, 'affects_quota', true, 'color', 'blue')
  ),
  100
FROM companies c
ON CONFLICT DO NOTHING;

INSERT INTO absence_settings_hierarchy (company_id, scope_type, setting_key, setting_value, priority)
SELECT 
  c.id,
  'company',
  'approval_workflow',
  jsonb_build_object(
    'stages', jsonb_build_array(
      jsonb_build_object('step', 1, 'approver_role', 'manager', 'sla_hours', 48, 'auto_escalate', true),
      jsonb_build_object('step', 2, 'approver_role', 'hr', 'sla_hours', 24, 'required_if', 'duration > 10')
    ),
    'substitute_required', false,
    'requires_documents', jsonb_build_object('sick_leave_with_certificate', true),
    'auto_approve_conditions', jsonb_build_array('duration < 1', 'type = compensatory_time')
  ),
  100
FROM companies c
ON CONFLICT DO NOTHING;