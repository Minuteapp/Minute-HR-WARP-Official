-- Advanced Time Tracking System Migration (Korrigiert)

-- Time Entries Haupttabelle für alle Zeiterfassungen
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_minutes INTEGER DEFAULT 0,
  total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - COALESCE(break_minutes, 0) / 60.0
      ELSE NULL 
    END
  ) STORED,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  location_checkin JSONB DEFAULT '{}',
  location_checkout JSONB DEFAULT '{}',
  project_id UUID,
  task_description TEXT,
  notes TEXT,
  is_remote BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Break Times für detailliertes Pausenmanagement
CREATE TABLE IF NOT EXISTS public.break_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id UUID NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_type TEXT NOT NULL DEFAULT 'lunch' CHECK (break_type IN ('lunch', 'coffee', 'personal', 'sick', 'other')),
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
      ELSE NULL 
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Overtime Rules für verschiedene Überstunden-Regelungen
CREATE TABLE IF NOT EXISTS public.overtime_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  name TEXT NOT NULL,
  daily_threshold_hours NUMERIC(5,2) DEFAULT 8,
  weekly_threshold_hours NUMERIC(5,2) DEFAULT 40,
  overtime_multiplier NUMERIC(3,2) DEFAULT 1.5,
  weekend_multiplier NUMERIC(3,2) DEFAULT 2.0,
  holiday_multiplier NUMERIC(3,2) DEFAULT 2.5,
  night_shift_bonus NUMERIC(3,2) DEFAULT 0.25,
  night_start_time TIME DEFAULT '22:00',
  night_end_time TIME DEFAULT '06:00',
  auto_approve_threshold_hours NUMERIC(3,1) DEFAULT 2,
  max_daily_overtime NUMERIC(5,2) DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time Tracking Settings pro Mitarbeiter
CREATE TABLE IF NOT EXISTS public.time_tracking_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  auto_break_deduction BOOLEAN DEFAULT false,
  default_break_minutes INTEGER DEFAULT 30,
  require_location BOOLEAN DEFAULT false,
  allow_manual_time_entry BOOLEAN DEFAULT true,
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '17:00',
  timezone TEXT DEFAULT 'Europe/Berlin',
  overtime_rule_id UUID REFERENCES public.overtime_rules(id),
  notifications_enabled BOOLEAN DEFAULT true,
  reminder_check_out BOOLEAN DEFAULT true,
  reminder_break BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time Reports für Berichte und Analytics
CREATE TABLE IF NOT EXISTS public.time_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_work_hours NUMERIC(8,2) DEFAULT 0,
  total_break_hours NUMERIC(6,2) DEFAULT 0,
  total_overtime_hours NUMERIC(6,2) DEFAULT 0,
  expected_work_hours NUMERIC(8,2) DEFAULT 0,
  efficiency_score NUMERIC(3,2) DEFAULT 1.0,
  punctuality_score NUMERIC(3,2) DEFAULT 1.0,
  attendance_days INTEGER DEFAULT 0,
  late_arrivals INTEGER DEFAULT 0,
  early_departures INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id)
);

-- Indexes für bessere Performance (korrigiert)
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, date(start_time));
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);
CREATE INDEX IF NOT EXISTS idx_break_entries_time_entry ON public.break_entries(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_reports_user_period ON public.time_reports(user_id, report_period_start, report_period_end);

-- RLS Policies
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_reports ENABLE ROW LEVEL SECURITY;

-- Time Entries Policies
CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all time entries" ON public.time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Break Entries Policies
CREATE POLICY "Users can manage own break entries" ON public.break_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.time_entries te 
      WHERE te.id = break_entries.time_entry_id 
      AND te.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all break entries" ON public.break_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Overtime Rules Policies
CREATE POLICY "Everyone can view active overtime rules" ON public.overtime_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage overtime rules" ON public.overtime_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Time Tracking Settings Policies
CREATE POLICY "Users can manage own time tracking settings" ON public.time_tracking_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all time tracking settings" ON public.time_tracking_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Time Reports Policies
CREATE POLICY "Users can view own time reports" ON public.time_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all time reports" ON public.time_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

CREATE POLICY "Admins can create time reports" ON public.time_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Trigger für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION public.update_time_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_time_tracking_updated_at();

CREATE TRIGGER update_overtime_rules_updated_at
  BEFORE UPDATE ON public.overtime_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_time_tracking_updated_at();

CREATE TRIGGER update_time_tracking_settings_updated_at
  BEFORE UPDATE ON public.time_tracking_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_time_tracking_updated_at();

-- Standard Überstunden-Regel erstellen
INSERT INTO public.overtime_rules (
  name, 
  daily_threshold_hours, 
  weekly_threshold_hours, 
  overtime_multiplier,
  weekend_multiplier,
  holiday_multiplier,
  night_shift_bonus
) VALUES (
  'Standard Überstunden-Regel',
  8.0,
  40.0,
  1.5,
  2.0,
  2.5,
  0.25
) ON CONFLICT DO NOTHING;