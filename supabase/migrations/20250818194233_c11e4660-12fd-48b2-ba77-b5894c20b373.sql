-- Erweitere companies Tabelle für Unternehmensinformationen
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3B82F6';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E40AF';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_font TEXT DEFAULT 'Inter';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS legal_form TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS founding_date DATE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_register_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry_code TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry_description TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS headquarters_location TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS communication_channels JSONB DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at_trigger ON public.companies;
CREATE TRIGGER update_companies_updated_at_trigger
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- Tabelle für Standorte
CREATE TABLE IF NOT EXISTS public.company_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'office',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_province TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
    phone TEXT,
    email TEXT,
    contact_person TEXT,
    contact_person_phone TEXT,
    contact_person_email TEXT,
    is_headquarters BOOLEAN DEFAULT FALSE,
    employee_count INTEGER DEFAULT 0,
    opening_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für company_locations
ALTER TABLE public.company_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company locations company isolation" ON public.company_locations
FOR ALL USING (
    CASE
        WHEN is_in_tenant_context() THEN (company_id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (company_id = get_user_company_id(auth.uid()))
    END
);

-- Tabelle für rechtliche Dokumente
CREATE TABLE IF NOT EXISTS public.company_legal_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    version TEXT DEFAULT '1.0',
    is_current_version BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    reminder_days_before INTEGER DEFAULT 90,
    compliance_category TEXT,
    approval_status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für company_legal_documents
ALTER TABLE public.company_legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company legal documents company isolation" ON public.company_legal_documents
FOR ALL USING (
    CASE
        WHEN is_in_tenant_context() THEN (company_id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (company_id = get_user_company_id(auth.uid()))
    END
);

CREATE POLICY "Company legal documents admin only" ON public.company_legal_documents
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'hr', 'superadmin')
    )
);

-- Tabelle für Organigramm-Strukturen
CREATE TABLE IF NOT EXISTS public.company_org_structure (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    structure_type TEXT NOT NULL DEFAULT 'department',
    parent_id UUID REFERENCES public.company_org_structure(id),
    manager_id UUID REFERENCES auth.users(id),
    description TEXT,
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    budget_center TEXT,
    cost_center TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für company_org_structure
ALTER TABLE public.company_org_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company org structure company isolation" ON public.company_org_structure
FOR ALL USING (
    CASE
        WHEN is_in_tenant_context() THEN (company_id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (company_id = get_user_company_id(auth.uid()))
    END
);

-- Tabelle für Compliance-Vorgaben
CREATE TABLE IF NOT EXISTS public.company_compliance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    compliance_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    regulation_reference TEXT,
    certification_body TEXT,
    certificate_number TEXT,
    valid_from DATE,
    valid_until DATE,
    reminder_days_before INTEGER DEFAULT 90,
    status TEXT DEFAULT 'active',
    risk_level TEXT DEFAULT 'medium',
    responsible_person_id UUID REFERENCES auth.users(id),
    audit_frequency TEXT DEFAULT 'annual',
    last_audit_date DATE,
    next_audit_date DATE,
    compliance_score INTEGER DEFAULT 0,
    action_items JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für company_compliance
ALTER TABLE public.company_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company compliance company isolation" ON public.company_compliance
FOR ALL USING (
    CASE
        WHEN is_in_tenant_context() THEN (company_id = get_tenant_company_id_safe())
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE (company_id = get_user_company_id(auth.uid()))
    END
);

-- Tabelle für Feiertagskalender pro Standort
CREATE TABLE IF NOT EXISTS public.location_holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES public.company_locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    is_public_holiday BOOLEAN DEFAULT TRUE,
    is_company_holiday BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT TRUE,
    category TEXT DEFAULT 'public',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, date, name)
);

-- RLS für location_holidays
ALTER TABLE public.location_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location holidays access" ON public.location_holidays
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM company_locations cl
        WHERE cl.id = location_holidays.location_id
        AND (
            CASE
                WHEN is_in_tenant_context() THEN (cl.company_id = get_tenant_company_id_safe())
                WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
                ELSE (cl.company_id = get_user_company_id(auth.uid()))
            END
        )
    )
);

-- Update Trigger für alle neuen Tabellen
CREATE TRIGGER update_company_locations_updated_at
    BEFORE UPDATE ON public.company_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_legal_documents_updated_at
    BEFORE UPDATE ON public.company_legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_org_structure_updated_at
    BEFORE UPDATE ON public.company_org_structure
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_compliance_updated_at
    BEFORE UPDATE ON public.company_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_company_locations_company_id ON public.company_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_legal_documents_company_id ON public.company_legal_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_org_structure_company_id ON public.company_org_structure(company_id);
CREATE INDEX IF NOT EXISTS idx_company_compliance_company_id ON public.company_compliance(company_id);
CREATE INDEX IF NOT EXISTS idx_location_holidays_location_id ON public.location_holidays(location_id);
CREATE INDEX IF NOT EXISTS idx_location_holidays_date ON public.location_holidays(date);