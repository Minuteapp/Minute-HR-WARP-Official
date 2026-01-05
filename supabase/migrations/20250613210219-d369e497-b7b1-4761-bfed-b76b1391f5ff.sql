
-- Erstelle Tabelle für Überstundenregeln
CREATE TABLE public.overtime_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id),
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('automatic', 'manual', 'threshold')),
  department text,
  position text,
  employee_type text CHECK (employee_type IN ('full_time', 'part_time', 'temporary', 'freelance', 'intern')),
  max_daily_hours numeric DEFAULT 8,
  max_weekly_hours numeric DEFAULT 40,
  max_monthly_hours numeric DEFAULT 160,
  compensation_type text NOT NULL DEFAULT 'payout' CHECK (compensation_type IN ('payout', 'time_off', 'both')),
  payout_multiplier numeric DEFAULT 1.5,
  time_off_multiplier numeric DEFAULT 1.0,
  auto_approval_threshold numeric DEFAULT 2.0,
  requires_approval boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Erstelle Tabelle für Überstunden-Schwellenwerte
CREATE TABLE public.overtime_thresholds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  overtime_rule_id uuid REFERENCES public.overtime_rules(id) ON DELETE CASCADE,
  threshold_hours numeric NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('notify', 'auto_approve', 'auto_deny', 'escalate')),
  notification_recipients jsonb DEFAULT '[]'::jsonb,
  escalation_level integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Erstelle Tabelle für Überstunden-Auszahlungen
CREATE TABLE public.overtime_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id),
  overtime_hours numeric NOT NULL,
  hourly_rate numeric NOT NULL,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  payout_type text NOT NULL CHECK (payout_type IN ('salary', 'bonus', 'separate')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_by uuid,
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  payroll_run_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Erstelle Tabelle für Freizeitausgleich-Anfragen
CREATE TABLE public.time_off_in_lieu_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id),
  overtime_hours numeric NOT NULL,
  requested_time_off_hours numeric NOT NULL,
  requested_start_date date NOT NULL,
  requested_end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  used_at timestamp with time zone,
  expiry_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Erstelle Tabelle für Überstunden-Einträge
CREATE TABLE public.overtime_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id),
  time_entry_id uuid REFERENCES public.time_entries(id),
  overtime_hours numeric NOT NULL,
  overtime_type text NOT NULL CHECK (overtime_type IN ('daily', 'weekly', 'holiday', 'emergency')),
  compensation_method text CHECK (compensation_method IN ('payout', 'time_off', 'both')),
  hourly_rate numeric,
  multiplier_applied numeric DEFAULT 1.5,
  calculated_amount numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  approved_by uuid,
  approved_at timestamp with time zone,
  processed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Erstelle Tabelle für Überstunden-Konfiguration pro Standort
CREATE TABLE public.location_overtime_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name text NOT NULL,
  country text NOT NULL,
  legal_max_daily_hours numeric DEFAULT 10,
  legal_max_weekly_hours numeric DEFAULT 48,
  legal_max_monthly_hours numeric DEFAULT 200,
  minimum_rest_hours numeric DEFAULT 11,
  weekend_overtime_multiplier numeric DEFAULT 2.0,
  holiday_overtime_multiplier numeric DEFAULT 2.5,
  night_shift_overtime_multiplier numeric DEFAULT 1.25,
  regulations jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS Policies aktivieren
ALTER TABLE public.overtime_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_in_lieu_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_overtime_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies erstellen
CREATE POLICY "Users can view overtime rules" ON public.overtime_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage overtime rules" ON public.overtime_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view overtime thresholds" ON public.overtime_thresholds FOR SELECT USING (true);
CREATE POLICY "Admins can manage overtime thresholds" ON public.overtime_thresholds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view their overtime payouts" ON public.overtime_payouts FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view their time off requests" ON public.time_off_in_lieu_requests FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can create their time off requests" ON public.time_off_in_lieu_requests FOR INSERT WITH CHECK (
  employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

CREATE POLICY "Users can view their overtime entries" ON public.overtime_entries FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view location settings" ON public.location_overtime_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage location settings" ON public.location_overtime_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_overtime_rules_updated_at BEFORE UPDATE ON public.overtime_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_payouts_updated_at BEFORE UPDATE ON public.overtime_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at BEFORE UPDATE ON public.time_off_in_lieu_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_entries_updated_at BEFORE UPDATE ON public.overtime_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_settings_updated_at BEFORE UPDATE ON public.location_overtime_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard-Daten einfügen
INSERT INTO public.location_overtime_settings (
  location_name, country, legal_max_daily_hours, legal_max_weekly_hours, 
  legal_max_monthly_hours, minimum_rest_hours, weekend_overtime_multiplier,
  holiday_overtime_multiplier, night_shift_overtime_multiplier,
  regulations
) VALUES 
(
  'Deutschland', 'DE', 10, 48, 200, 11, 2.0, 2.5, 1.25,
  '{"arbeitszeit_gesetz": true, "max_overtime_per_day": 2, "documentation_required": true}'::jsonb
),
(
  'Österreich', 'AT', 12, 50, 220, 11, 2.0, 2.5, 1.25,
  '{"arbeitszeit_gesetz": true, "max_overtime_per_day": 4, "documentation_required": true}'::jsonb
),
(
  'Schweiz', 'CH', 9, 45, 180, 11, 1.25, 2.0, 1.25,
  '{"arbeitszeit_gesetz": true, "max_overtime_per_week": 2, "annual_limit": 170}'::jsonb
);
