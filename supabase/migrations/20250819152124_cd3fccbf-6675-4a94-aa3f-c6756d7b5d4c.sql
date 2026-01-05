-- Erweitere Expense-Tabelle für umfassende Spesenabrechnung
ALTER TABLE business_trip_expenses 
ADD COLUMN IF NOT EXISTS receipt_upload_path TEXT,
ADD COLUMN IF NOT EXISTS receipt_ocr_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mileage_km NUMERIC,
ADD COLUMN IF NOT EXISTS mileage_rate_per_km NUMERIC DEFAULT 0.30,
ADD COLUMN IF NOT EXISTS per_diem_country TEXT,
ADD COLUMN IF NOT EXISTS per_diem_city TEXT,
ADD COLUMN IF NOT EXISTS per_diem_rate NUMERIC,
ADD COLUMN IF NOT EXISTS per_diem_days INTEGER,
ADD COLUMN IF NOT EXISTS gps_tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gps_start_location JSONB,
ADD COLUMN IF NOT EXISTS gps_end_location JSONB,
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS amount_original_currency NUMERIC,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'paid')),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewer_id UUID,
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Tabelle für Tagespauschalen nach Land/Stadt (BMF-Tabellen)
CREATE TABLE IF NOT EXISTS per_diem_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  city_name TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  full_day_rate NUMERIC NOT NULL,
  half_day_rate NUMERIC NOT NULL,
  accommodation_max NUMERIC,
  meal_deduction_breakfast NUMERIC DEFAULT 0,
  meal_deduction_lunch NUMERIC DEFAULT 0,
  meal_deduction_dinner NUMERIC DEFAULT 0,
  effective_from DATE NOT NULL,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  UNIQUE(country_code, city_name, effective_from)
);

-- RLS für per_diem_rates
ALTER TABLE per_diem_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view per diem rates" ON per_diem_rates FOR SELECT USING (true);
CREATE POLICY "Admins can manage per diem rates" ON per_diem_rates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Tabelle für Kilometerpauschalen
CREATE TABLE IF NOT EXISTS mileage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle', 'bicycle')),
  rate_per_km NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  effective_from DATE NOT NULL,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  UNIQUE(country_code, vehicle_type, effective_from)
);

-- RLS für mileage_rates
ALTER TABLE mileage_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mileage rates" ON mileage_rates FOR SELECT USING (true);
CREATE POLICY "Admins can manage mileage rates" ON mileage_rates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Tabelle für Expense-Genehmigungsworkflow
CREATE TABLE IF NOT EXISTS expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES business_trip_expenses(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  approver_name TEXT,
  approval_step INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expense_id, approval_step)
);

-- RLS für expense_approvals
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expense approvals" ON expense_approvals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_trip_expenses bte 
    WHERE bte.id = expense_approvals.expense_id 
    AND (bte.user_id = auth.uid() OR expense_approvals.approver_id = auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Approvers can manage expense approvals" ON expense_approvals FOR ALL USING (
  approver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Tabelle für Spesenberichte und Audit-Log
CREATE TABLE IF NOT EXISTS expense_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES business_trip_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für expense_audit_log
ALTER TABLE expense_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and users can view expense audit log" ON expense_audit_log FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Füge Standard-Tagespauschalen für Deutschland, Österreich und Schweiz hinzu
INSERT INTO per_diem_rates (country_code, city_name, currency, full_day_rate, half_day_rate, accommodation_max, effective_from, created_by) VALUES
-- Deutschland (BMF 2024)
('DE', NULL, 'EUR', 28.00, 14.00, 150.00, '2024-01-01', auth.uid()),
('DE', 'München', 'EUR', 32.00, 16.00, 180.00, '2024-01-01', auth.uid()),
('DE', 'Hamburg', 'EUR', 30.00, 15.00, 170.00, '2024-01-01', auth.uid()),
('DE', 'Berlin', 'EUR', 30.00, 15.00, 170.00, '2024-01-01', auth.uid()),
('DE', 'Frankfurt am Main', 'EUR', 32.00, 16.00, 180.00, '2024-01-01', auth.uid()),
-- Österreich
('AT', NULL, 'EUR', 26.40, 13.20, 120.00, '2024-01-01', auth.uid()),
('AT', 'Wien', 'EUR', 30.00, 15.00, 150.00, '2024-01-01', auth.uid()),
('AT', 'Salzburg', 'EUR', 28.00, 14.00, 140.00, '2024-01-01', auth.uid()),
-- Schweiz
('CH', NULL, 'CHF', 65.00, 32.50, 220.00, '2024-01-01', auth.uid()),
('CH', 'Zürich', 'CHF', 80.00, 40.00, 280.00, '2024-01-01', auth.uid()),
('CH', 'Genf', 'CHF', 78.00, 39.00, 270.00, '2024-01-01', auth.uid())
ON CONFLICT (country_code, city_name, effective_from) DO NOTHING;

-- Füge Standard-Kilometerpauschalen hinzu
INSERT INTO mileage_rates (country_code, vehicle_type, rate_per_km, currency, effective_from, created_by) VALUES
-- Deutschland
('DE', 'car', 0.30, 'EUR', '2024-01-01', auth.uid()),
('DE', 'motorcycle', 0.20, 'EUR', '2024-01-01', auth.uid()),
('DE', 'bicycle', 0.05, 'EUR', '2024-01-01', auth.uid()),
-- Österreich
('AT', 'car', 0.42, 'EUR', '2024-01-01', auth.uid()),
('AT', 'motorcycle', 0.24, 'EUR', '2024-01-01', auth.uid()),
('AT', 'bicycle', 0.05, 'EUR', '2024-01-01', auth.uid()),
-- Schweiz
('CH', 'car', 0.70, 'CHF', '2024-01-01', auth.uid()),
('CH', 'motorcycle', 0.35, 'CHF', '2024-01-01', auth.uid()),
('CH', 'bicycle', 0.10, 'CHF', '2024-01-01', auth.uid())
ON CONFLICT (country_code, vehicle_type, effective_from) DO NOTHING;

-- Trigger für Audit-Log bei Expense-Änderungen
CREATE OR REPLACE FUNCTION log_expense_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO expense_audit_log (expense_id, user_id, action, old_values, new_values)
    VALUES (NEW.id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO expense_audit_log (expense_id, user_id, action, new_values)
    VALUES (NEW.id, auth.uid(), 'INSERT', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO expense_audit_log (expense_id, user_id, action, old_values)
    VALUES (OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER expense_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON business_trip_expenses
  FOR EACH ROW EXECUTE FUNCTION log_expense_changes();