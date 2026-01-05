-- AI Gateway Konfiguration pro Tenant
CREATE TABLE public.ai_gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- OpenRouter Einstellungen
    openrouter_api_key TEXT,
    default_model TEXT DEFAULT 'openai/gpt-4o-mini',
    fallback_model TEXT DEFAULT 'openai/gpt-3.5-turbo',
    
    -- KI-Modi: disabled, readonly, suggesting
    ai_mode TEXT DEFAULT 'disabled' CHECK (ai_mode IN ('disabled', 'readonly', 'suggesting')),
    
    -- Budget & Limits
    monthly_budget_cents INTEGER DEFAULT 10000,
    current_month_usage_cents INTEGER DEFAULT 0,
    max_tokens_per_request INTEGER DEFAULT 4000,
    budget_warning_threshold INTEGER DEFAULT 80,
    
    -- Modul-Steuerung
    enabled_modules TEXT[] DEFAULT '{}',
    
    -- Governance
    require_user_confirmation BOOLEAN DEFAULT true,
    allow_data_storage BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(company_id)
);

-- AI Gateway Audit Log
CREATE TABLE public.ai_gateway_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    module TEXT NOT NULL,
    action_type TEXT NOT NULL,
    prompt_summary TEXT,
    
    model_used TEXT,
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost_cents INTEGER,
    
    data_sources JSONB,
    response_summary TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'rejected')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    response_at TIMESTAMPTZ
);

-- AI Usage Monthly Tracking
CREATE TABLE public.ai_usage_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL,
    
    total_requests INTEGER DEFAULT 0,
    total_tokens_input INTEGER DEFAULT 0,
    total_tokens_output INTEGER DEFAULT 0,
    total_cost_cents INTEGER DEFAULT 0,
    
    requests_by_module JSONB DEFAULT '{}',
    requests_by_user JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(company_id, year_month)
);

-- RLS Policies
ALTER TABLE public.ai_gateway_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_gateway_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_monthly ENABLE ROW LEVEL SECURITY;

-- Admins können Config lesen/schreiben
CREATE POLICY "Admins can manage AI config" ON public.ai_gateway_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Alle authentifizierten User können Audit-Log für ihre Company lesen
CREATE POLICY "Users can view audit log" ON public.ai_gateway_audit_log
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.employees WHERE user_id = auth.uid()
        )
    );

-- Service Role kann alles (für Edge Function)
CREATE POLICY "Service can insert audit log" ON public.ai_gateway_audit_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view usage" ON public.ai_usage_monthly
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Indexes
CREATE INDEX idx_ai_audit_company_created ON public.ai_gateway_audit_log(company_id, created_at DESC);
CREATE INDEX idx_ai_audit_user ON public.ai_gateway_audit_log(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_company_month ON public.ai_usage_monthly(company_id, year_month);

-- Trigger für updated_at
CREATE TRIGGER update_ai_gateway_config_updated_at
    BEFORE UPDATE ON public.ai_gateway_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_usage_monthly_updated_at
    BEFORE UPDATE ON public.ai_usage_monthly
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();