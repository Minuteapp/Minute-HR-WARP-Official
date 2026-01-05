-- API & Integrationen Tabellen (Teil 1)
CREATE TABLE IF NOT EXISTS public.api_global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  api_enabled BOOLEAN DEFAULT true,
  default_access_level TEXT DEFAULT 'read-only',
  auth_methods JSONB DEFAULT '["api_key"]',
  token_rotation_days INTEGER DEFAULT 90,
  ip_whitelist TEXT[] DEFAULT ARRAY[]::TEXT[],
  rate_limit_per_minute INTEGER DEFAULT 100,
  throttling_enabled BOOLEAN DEFAULT true,
  payload_limit_mb INTEGER DEFAULT 10,
  encryption_in_transit BOOLEAN DEFAULT true,
  encryption_at_rest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

CREATE TABLE IF NOT EXISTS public.api_module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  allowed_actions TEXT[] DEFAULT ARRAY['read']::TEXT[],
  data_scope TEXT DEFAULT 'own',
  allowed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  rate_limit_override INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, module_name)
);

CREATE TABLE IF NOT EXISTS public.external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT DEFAULT 'inactive',
  auth_type TEXT NOT NULL,
  credentials JSONB,
  data_direction TEXT DEFAULT 'bidirectional',
  sync_interval_minutes INTEGER DEFAULT 60,
  error_behavior TEXT DEFAULT 'retry',
  retry_count INTEGER DEFAULT 3,
  cost_limit_monthly DECIMAL(10,2),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  auth_type TEXT DEFAULT 'none',
  auth_value TEXT,
  payload_format TEXT DEFAULT 'json',
  retry_strategy JSONB DEFAULT '{"max_retries": 3, "delay_seconds": 60}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ipaas_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  connection_name TEXT,
  allowed_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  data_masking_enabled BOOLEAN DEFAULT true,
  masked_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  environment TEXT DEFAULT 'sandbox',
  api_key TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT,
  model TEXT,
  modules_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  monthly_token_limit INTEGER,
  monthly_cost_limit DECIMAL(10,2),
  current_month_usage INTEGER DEFAULT 0,
  current_month_cost DECIMAL(10,2) DEFAULT 0,
  explainability_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, provider)
);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_id UUID,
  webhook_id UUID,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  user_id UUID,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE public.api_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipaas_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "api_global_settings_select" ON public.api_global_settings FOR SELECT USING (true);
CREATE POLICY "api_global_settings_all" ON public.api_global_settings FOR ALL USING (true);
CREATE POLICY "api_module_settings_select" ON public.api_module_settings FOR SELECT USING (true);
CREATE POLICY "api_module_settings_all" ON public.api_module_settings FOR ALL USING (true);
CREATE POLICY "external_integrations_select" ON public.external_integrations FOR SELECT USING (true);
CREATE POLICY "external_integrations_all" ON public.external_integrations FOR ALL USING (true);
CREATE POLICY "webhooks_select" ON public.webhooks FOR SELECT USING (true);
CREATE POLICY "webhooks_all" ON public.webhooks FOR ALL USING (true);
CREATE POLICY "ipaas_connections_select" ON public.ipaas_connections FOR SELECT USING (true);
CREATE POLICY "ipaas_connections_all" ON public.ipaas_connections FOR ALL USING (true);
CREATE POLICY "ai_provider_settings_select" ON public.ai_provider_settings FOR SELECT USING (true);
CREATE POLICY "ai_provider_settings_all" ON public.ai_provider_settings FOR ALL USING (true);
CREATE POLICY "api_usage_logs_select" ON public.api_usage_logs FOR SELECT USING (true);
CREATE POLICY "api_usage_logs_insert" ON public.api_usage_logs FOR INSERT WITH CHECK (true);