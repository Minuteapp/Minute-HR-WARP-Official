-- Erstelle nur die Tabellen zuerst
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
  data_retention_days integer DEFAULT 2555,
  privacy_level text DEFAULT 'gdpr',
  audit_logging boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

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