-- Create country_regulations table
CREATE TABLE IF NOT EXISTS public.country_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  name TEXT NOT NULL,
  max_daily_hours NUMERIC NOT NULL DEFAULT 8,
  max_daily_hours_extended NUMERIC,
  max_weekly_hours NUMERIC NOT NULL DEFAULT 48,
  min_break_after_6h INTEGER DEFAULT 30,
  min_break_after_9h INTEGER DEFAULT 45,
  min_daily_rest_hours NUMERIC DEFAULT 11,
  min_weekly_rest_hours NUMERIC DEFAULT 24,
  night_work_start TIME,
  night_work_end TIME,
  night_work_bonus_percent NUMERIC,
  sunday_work_allowed BOOLEAN DEFAULT false,
  overtime_compensation TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (country_code, effective_from)
);

ALTER TABLE public.country_regulations ENABLE ROW LEVEL SECURITY;

-- Policies for country_regulations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'country_regulations' AND policyname = 'country_regulations_select_all'
  ) THEN
    CREATE POLICY "country_regulations_select_all"
    ON public.country_regulations
    FOR SELECT
    USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'country_regulations' AND policyname = 'country_regulations_manage_admins'
  ) THEN
    CREATE POLICY "country_regulations_manage_admins"
    ON public.country_regulations
    FOR ALL
    USING (is_admin_safe(auth.uid()) OR is_superadmin_safe(auth.uid()))
    WITH CHECK (is_admin_safe(auth.uid()) OR is_superadmin_safe(auth.uid()));
  END IF;
END $$;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_country_regulations_updated_at'
  ) THEN
    CREATE TRIGGER trg_country_regulations_updated_at
    BEFORE UPDATE ON public.country_regulations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Seed base country regulations (idempotent)
INSERT INTO public.country_regulations (country_code, name, max_daily_hours, max_daily_hours_extended, max_weekly_hours, min_break_after_6h, min_break_after_9h, min_daily_rest_hours, min_weekly_rest_hours, night_work_start, night_work_end, sunday_work_allowed, overtime_compensation, parameters)
VALUES
  ('DE', 'Germany', 8, 10, 48, 30, 45, 11, 24, '22:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('AT', 'Austria', 8, 10, 48, 30, 45, 11, 24, '22:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('CH', 'Switzerland', 8, 10, 45, 30, 45, 11, 24, '23:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('FR', 'France', 8, 10, 48, 20, 45, 11, 24, '21:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('NL', 'Netherlands', 8, 10, 48, 30, 45, 11, 24, '22:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('ES', 'Spain', 8, 10, 48, 15, 30, 12, 36, '22:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('IT', 'Italy', 8, 10, 48, 10, 30, 11, 24, '22:00', '06:00', false, 'time_off', '{}'::jsonb),
  ('PL', 'Poland', 8, 10, 48, 15, 30, 11, 35, '21:00', '07:00', false, 'time_off', '{}'::jsonb),
  ('UK', 'United Kingdom', 8, 10, 48, 20, 30, 11, 24, '23:00', '06:00', false, 'time_off', '{}'::jsonb)
ON CONFLICT (country_code, effective_from) DO NOTHING;

-- Company-level time settings
CREATE TABLE IF NOT EXISTS public.company_time_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  default_country_code TEXT NOT NULL,
  apply_to_modules TEXT[] NOT NULL DEFAULT ARRAY['time_tracking','absence','shift_planning','reporting','business_travel'],
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_company_time_settings_active ON public.company_time_settings(company_id) WHERE is_active;

ALTER TABLE public.company_time_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_time_settings' AND policyname='company_time_settings_select_same_company_or_admin'
  ) THEN
    CREATE POLICY "company_time_settings_select_same_company_or_admin"
    ON public.company_time_settings
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
          AND (ur.company_id = company_time_settings.company_id OR ur.role IN ('admin','superadmin','hr'))
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_time_settings' AND policyname='company_time_settings_manage_admins'
  ) THEN
    CREATE POLICY "company_time_settings_manage_admins"
    ON public.company_time_settings
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin')));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_company_time_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_company_time_settings_updated_at
    BEFORE UPDATE ON public.company_time_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Regulation exceptions for finer scoping
CREATE TABLE IF NOT EXISTS public.regulation_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('company','department','team','employee')),
  scope_ref TEXT,
  user_id UUID,
  country_code TEXT,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.regulation_exceptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='regulation_exceptions' AND policyname='regulation_exceptions_select_same_company'
  ) THEN
    CREATE POLICY "regulation_exceptions_select_same_company"
    ON public.regulation_exceptions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
          AND (ur.company_id = regulation_exceptions.company_id OR ur.role IN ('admin','superadmin','hr'))
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='regulation_exceptions' AND policyname='regulation_exceptions_modify_admin_hr'
  ) THEN
    CREATE POLICY "regulation_exceptions_modify_admin_hr"
    ON public.regulation_exceptions
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin','hr')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin','hr')));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_regulation_exceptions_updated_at'
  ) THEN
    CREATE TRIGGER trg_regulation_exceptions_updated_at
    BEFORE UPDATE ON public.regulation_exceptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Business travel policies overriding country during travel
CREATE TABLE IF NOT EXISTS public.business_travel_time_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  destination_country_code TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','completed','cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bt_time_policies_user_dates ON public.business_travel_time_policies(user_id, start_date, end_date);

ALTER TABLE public.business_travel_time_policies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_travel_time_policies' AND policyname='bt_time_policies_select_self_or_admin_hr'
  ) THEN
    CREATE POLICY "bt_time_policies_select_self_or_admin_hr"
    ON public.business_travel_time_policies
    FOR SELECT
    USING (
      (user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin','hr'))
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_travel_time_policies' AND policyname='bt_time_policies_modify_self_or_admin_hr'
  ) THEN
    CREATE POLICY "bt_time_policies_modify_self_or_admin_hr"
    ON public.business_travel_time_policies
    FOR ALL
    USING (
      (user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin','hr'))
    )
    WITH CHECK (
      (user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','superadmin','hr'))
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bt_time_policies_updated_at'
  ) THEN
    CREATE TRIGGER trg_bt_time_policies_updated_at
    BEFORE UPDATE ON public.business_travel_time_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Public holidays per country/region
CREATE TABLE IF NOT EXISTS public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  region_code TEXT,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_holidays_country_date ON public.public_holidays(country_code, date);

ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='public_holidays' AND policyname='public_holidays_select_all'
  ) THEN
    CREATE POLICY "public_holidays_select_all"
    ON public.public_holidays
    FOR SELECT
    USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='public_holidays' AND policyname='public_holidays_manage_admins'
  ) THEN
    CREATE POLICY "public_holidays_manage_admins"
    ON public.public_holidays
    FOR ALL
    USING (is_admin_safe(auth.uid()) OR is_superadmin_safe(auth.uid()))
    WITH CHECK (is_admin_safe(auth.uid()) OR is_superadmin_safe(auth.uid()));
  END IF;
END $$;

-- Function to compute effective rules per user and date
CREATE OR REPLACE FUNCTION public.get_effective_time_rules(p_user_id uuid, p_date date DEFAULT now()::date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company uuid;
  v_dept text;
  v_team text;
  v_country text;
  v_rules jsonb := '{}'::jsonb;
  v_company_overrides jsonb := '{}'::jsonb;
  v_travel_params jsonb := '{}'::jsonb;
  v_sources text[] := ARRAY[]::text[];
  cr RECORD;
  rec RECORD;
BEGIN
  -- Identify employee and company
  SELECT company_id, department, team INTO v_company, v_dept, v_team
  FROM public.employees WHERE id = p_user_id LIMIT 1;
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'Kein Mitarbeiter mit ID % gefunden', p_user_id;
  END IF;

  -- Authorization: same user, same company, or admin/hr/superadmin
  IF NOT (
    auth.uid() = p_user_id
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin','hr','superadmin'))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.company_id = v_company)
  ) THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;

  -- Company default settings
  SELECT default_country_code, overrides
  INTO v_country, v_company_overrides
  FROM public.company_time_settings cts
  WHERE cts.company_id = v_company
    AND cts.is_active = true
    AND cts.effective_from <= p_date
    AND (cts.effective_to IS NULL OR cts.effective_to >= p_date)
  ORDER BY cts.effective_from DESC
  LIMIT 1;

  IF v_country IS NULL THEN
    v_country := 'DE';
  END IF;

  -- Base country regulations
  SELECT * INTO cr
  FROM public.country_regulations
  WHERE country_code = v_country
    AND is_active = true
    AND effective_from <= p_date
    AND (effective_to IS NULL OR effective_to >= p_date)
  ORDER BY effective_from DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Keine Regeln für Land % gefunden', v_country;
  END IF;

  v_rules := coalesce(cr.parameters,'{}'::jsonb) ||
    jsonb_build_object(
      'max_daily_hours', cr.max_daily_hours,
      'max_daily_hours_extended', cr.max_daily_hours_extended,
      'max_weekly_hours', cr.max_weekly_hours,
      'min_break_after_6h', cr.min_break_after_6h,
      'min_break_after_9h', cr.min_break_after_9h,
      'min_daily_rest_hours', cr.min_daily_rest_hours,
      'min_weekly_rest_hours', cr.min_weekly_rest_hours,
      'night_work_start', to_char(cr.night_work_start, 'HH24:MI'),
      'night_work_end', to_char(cr.night_work_end, 'HH24:MI'),
      'night_work_bonus_percent', cr.night_work_bonus_percent,
      'sunday_work_allowed', cr.sunday_work_allowed,
      'overtime_compensation', cr.overtime_compensation
    );
  v_sources := v_sources || 'country_regulations';

  -- Company overrides
  IF v_company_overrides IS NOT NULL AND v_company_overrides <> '{}'::jsonb THEN
    v_rules := v_rules || v_company_overrides;
    v_sources := v_sources || 'company_overrides';
  END IF;

  -- Company exceptions
  FOR rec IN
    SELECT parameters FROM public.regulation_exceptions
    WHERE company_id = v_company AND is_active = true
      AND scope = 'company'
      AND effective_from <= p_date
      AND (effective_to IS NULL OR effective_to >= p_date)
    ORDER BY effective_from
  LOOP
    v_rules := v_rules || rec.parameters;
    v_sources := v_sources || 'exception_company';
  END LOOP;

  -- Department exceptions
  IF v_dept IS NOT NULL THEN
    FOR rec IN
      SELECT parameters FROM public.regulation_exceptions
      WHERE company_id = v_company AND is_active = true
        AND scope = 'department' AND scope_ref = v_dept
        AND effective_from <= p_date
        AND (effective_to IS NULL OR effective_to >= p_date)
      ORDER BY effective_from
    LOOP
      v_rules := v_rules || rec.parameters;
      v_sources := v_sources || 'exception_department';
    END LOOP;
  END IF;

  -- Team exceptions
  IF v_team IS NOT NULL THEN
    FOR rec IN
      SELECT parameters FROM public.regulation_exceptions
      WHERE company_id = v_company AND is_active = true
        AND scope = 'team' AND scope_ref = v_team
        AND effective_from <= p_date
        AND (effective_to IS NULL OR effective_to >= p_date)
      ORDER BY effective_from
    LOOP
      v_rules := v_rules || rec.parameters;
      v_sources := v_sources || 'exception_team';
    END LOOP;
  END IF;

  -- Employee exceptions
  FOR rec IN
    SELECT parameters FROM public.regulation_exceptions
    WHERE company_id = v_company AND is_active = true
      AND scope = 'employee' AND user_id = p_user_id
      AND effective_from <= p_date
      AND (effective_to IS NULL OR effective_to >= p_date)
    ORDER BY effective_from
  LOOP
    v_rules := v_rules || rec.parameters;
    v_sources := v_sources || 'exception_employee';
  END LOOP;

  -- Business travel overrides
  SELECT parameters INTO v_travel_params
  FROM public.business_travel_time_policies
  WHERE user_id = p_user_id
    AND status IN ('planned','active')
    AND start_date <= p_date AND end_date >= p_date
  ORDER BY start_date DESC
  LIMIT 1;

  IF FOUND THEN
    v_rules := v_rules || coalesce(v_travel_params, '{}'::jsonb);
    v_sources := v_sources || 'business_travel';
  END IF;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'date', p_date,
    'country_code', v_country,
    'rules', v_rules,
    'sources', v_sources
  );
END;
$$;