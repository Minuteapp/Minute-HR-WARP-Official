-- Globale Systemeinstellungen
CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  setting_category text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  UNIQUE(company_id, setting_category, setting_key)
);

-- Sprach- und Lokalisierungseinstellungen
CREATE TABLE IF NOT EXISTS public.language_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  default_language text NOT NULL DEFAULT 'de',
  supported_languages text[] DEFAULT ARRAY['de', 'en'],
  role_language_mapping jsonb DEFAULT '{}',
  location_language_mapping jsonb DEFAULT '{}',
  date_format text DEFAULT 'DD.MM.YYYY',
  time_format text DEFAULT '24h',
  timezone_default text DEFAULT 'Europe/Berlin',
  timezone_auto_detect boolean DEFAULT true,
  currency_default text DEFAULT 'EUR',
  supported_currencies text[] DEFAULT ARRAY['EUR', 'USD', 'GBP'],
  calendar_format text DEFAULT 'iso_week',
  number_format jsonb DEFAULT '{"decimal_separator": ",", "thousands_separator": ".", "decimal_places": 2}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Design und Corporate Identity
CREATE TABLE IF NOT EXISTS public.design_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#6B7280',
  accent_color text DEFAULT '#10B981',
  background_color text DEFAULT '#FFFFFF',
  text_color text DEFAULT '#1F2937',
  logo_web_url text,
  logo_mobile_url text,
  logo_favicon_url text,
  font_family text DEFAULT 'Inter',
  font_headings text DEFAULT 'Inter',
  font_body text DEFAULT 'Inter',
  dark_mode_enabled boolean DEFAULT false,
  dark_mode_auto boolean DEFAULT true,
  custom_css text,
  brand_guidelines jsonb DEFAULT '{}',
  layout_template text DEFAULT 'default',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Barrierefreiheitseinstellungen
CREATE TABLE IF NOT EXISTS public.accessibility_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  wcag_compliance_level text DEFAULT 'AA',
  high_contrast_mode boolean DEFAULT false,
  large_text_mode boolean DEFAULT false,
  keyboard_navigation boolean DEFAULT true,
  screen_reader_support boolean DEFAULT true,
  voice_control boolean DEFAULT false,
  motion_reduction boolean DEFAULT false,
  ai_text_simplification boolean DEFAULT false,
  focus_indicators boolean DEFAULT true,
  alt_text_required boolean DEFAULT true,
  font_size_multiplier numeric DEFAULT 1.0,
  line_height_multiplier numeric DEFAULT 1.5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Globale Benachrichtigungseinstellungen
CREATE TABLE IF NOT EXISTS public.global_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  default_channels text[] DEFAULT ARRAY['email', 'in_app'],
  escalation_rules jsonb DEFAULT '{}',
  quiet_hours jsonb DEFAULT '{"start": "20:00", "end": "08:00", "timezone": "Europe/Berlin"}',
  weekend_notifications boolean DEFAULT false,
  holiday_notifications boolean DEFAULT false,
  email_templates jsonb DEFAULT '{}',
  sms_templates jsonb DEFAULT '{}',
  push_templates jsonb DEFAULT '{}',
  multi_language_templates jsonb DEFAULT '{}',
  auto_digest boolean DEFAULT true,
  digest_frequency text DEFAULT 'daily',
  priority_override boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Systemweite Sicherheitseinstellungen
CREATE TABLE IF NOT EXISTS public.security_policy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  session_timeout_minutes integer DEFAULT 60,
  password_min_length integer DEFAULT 8,
  password_require_uppercase boolean DEFAULT true,
  password_require_lowercase boolean DEFAULT true,
  password_require_numbers boolean DEFAULT true,
  password_require_symbols boolean DEFAULT false,
  password_expire_days integer DEFAULT 90,
  password_history_count integer DEFAULT 5,
  two_factor_required boolean DEFAULT false,
  two_factor_methods text[] DEFAULT ARRAY['totp', 'sms'],
  sso_enabled boolean DEFAULT false,
  sso_providers jsonb DEFAULT '{}',
  login_attempt_limit integer DEFAULT 5,
  account_lockout_minutes integer DEFAULT 30,
  ip_restrictions boolean DEFAULT false,
  allowed_ip_ranges text[],
  data_retention_days integer DEFAULT 2555, -- 7 Jahre
  privacy_level text DEFAULT 'gdpr',
  audit_logging boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Benutzer-spezifische Überschreibungen für globale Einstellungen
CREATE TABLE IF NOT EXISTS public.user_setting_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  setting_category text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  is_allowed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, setting_category, setting_key)
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_global_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_settings_updated_at
  BEFORE UPDATE ON public.global_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

CREATE TRIGGER update_language_settings_updated_at
  BEFORE UPDATE ON public.language_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

CREATE TRIGGER update_design_settings_updated_at
  BEFORE UPDATE ON public.design_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

CREATE TRIGGER update_accessibility_settings_updated_at
  BEFORE UPDATE ON public.accessibility_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

CREATE TRIGGER update_global_notification_settings_updated_at
  BEFORE UPDATE ON public.global_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

CREATE TRIGGER update_security_policy_settings_updated_at
  BEFORE UPDATE ON public.security_policy_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();

-- RLS Policies
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_setting_overrides ENABLE ROW LEVEL SECURITY;

-- Admin und SuperAdmin können alles verwalten
CREATE POLICY "Admins manage global_settings" ON public.global_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage language_settings" ON public.language_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage design_settings" ON public.design_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage accessibility_settings" ON public.accessibility_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage global_notification_settings" ON public.global_notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

CREATE POLICY "Admins manage security_policy_settings" ON public.security_policy_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
      AND (ur.company_id = company_id OR company_id IS NULL)
    )
  );

-- Alle Benutzer können Einstellungen lesen
CREATE POLICY "Users read global_settings" ON public.global_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read language_settings" ON public.language_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read design_settings" ON public.design_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read accessibility_settings" ON public.accessibility_settings
  FOR SELECT USING (true);

CREATE POLICY "Users read global_notification_settings" ON public.global_notification_settings
  FOR SELECT USING (true);

-- Benutzer können ihre eigenen Überschreibungen verwalten
CREATE POLICY "Users manage own overrides" ON public.user_setting_overrides
  FOR ALL USING (user_id = auth.uid());

-- Indizes für Performance
CREATE INDEX idx_global_settings_company_category ON public.global_settings(company_id, setting_category);
CREATE INDEX idx_global_settings_category_key ON public.global_settings(setting_category, setting_key);
CREATE INDEX idx_language_settings_company ON public.language_settings(company_id);
CREATE INDEX idx_design_settings_company ON public.design_settings(company_id);
CREATE INDEX idx_accessibility_settings_company ON public.accessibility_settings(company_id);
CREATE INDEX idx_global_notification_settings_company ON public.global_notification_settings(company_id);
CREATE INDEX idx_security_policy_settings_company ON public.security_policy_settings(company_id);
CREATE INDEX idx_user_setting_overrides_user ON public.user_setting_overrides(user_id);
CREATE INDEX idx_user_setting_overrides_category ON public.user_setting_overrides(setting_category, setting_key);

-- Seed-Daten für Standardeinstellungen
INSERT INTO public.language_settings (
  company_id, default_language, supported_languages, 
  date_format, time_format, timezone_default, currency_default
) 
SELECT 
  id, 'de', ARRAY['de', 'en'], 
  'DD.MM.YYYY', '24h', 'Europe/Berlin', 'EUR'
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.language_settings ls WHERE ls.company_id = companies.id
);

INSERT INTO public.design_settings (
  company_id, primary_color, secondary_color, accent_color
)
SELECT 
  id, '#3B82F6', '#6B7280', '#10B981'
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.design_settings ds WHERE ds.company_id = companies.id
);

INSERT INTO public.accessibility_settings (
  company_id, wcag_compliance_level, screen_reader_support, keyboard_navigation
)
SELECT 
  id, 'AA', true, true
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.accessibility_settings acs WHERE acs.company_id = companies.id
);

INSERT INTO public.global_notification_settings (
  company_id, default_channels, quiet_hours
)
SELECT 
  id, ARRAY['email', 'in_app'], 
  '{"start": "20:00", "end": "08:00", "timezone": "Europe/Berlin"}'::jsonb
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.global_notification_settings gns WHERE gns.company_id = companies.id
);

INSERT INTO public.security_policy_settings (
  company_id, session_timeout_minutes, password_min_length, 
  two_factor_required, privacy_level
)
SELECT 
  id, 60, 8, false, 'gdpr'
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.security_policy_settings sps WHERE sps.company_id = companies.id
);