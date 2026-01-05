-- Projekte-Modul Datenmodell

-- Projekt-Status Enum
CREATE TYPE project_status AS ENUM ('draft', 'planned', 'active', 'completed', 'cancelled', 'on_hold');

-- Projekt-Priorität Enum  
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Task-Status Enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'blocked', 'done', 'cancelled');

-- Risiko-Status Enum
CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'closed', 'escalated');

-- Haupttabelle: Projekte
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'draft',
    owner_id UUID NOT NULL,
    department_id UUID,
    start_date DATE,
    end_date DATE,
    priority project_priority DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    okr_links JSONB DEFAULT '[]',
    risk_level TEXT DEFAULT 'low',
    health JSONB DEFAULT '{"scope": "green", "budget": "green", "schedule": "green", "people": "green"}',
    template_id UUID,
    company_id UUID,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID DEFAULT auth.uid()
);

-- Tasks/Aufgaben
CREATE TABLE public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.project_tasks(id),
    title TEXT NOT NULL,
    description TEXT,
    assignees UUID[] DEFAULT '{}',
    due_date DATE,
    start_date DATE,
    estimate_hours NUMERIC DEFAULT 0,
    spent_hours NUMERIC DEFAULT 0,
    status task_status DEFAULT 'todo',
    priority project_priority DEFAULT 'medium',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    dependencies UUID[] DEFAULT '{}',
    labels TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    location TEXT,
    skill_requirements TEXT[] DEFAULT '{}',
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID DEFAULT auth.uid()
);

-- Timeline Meilensteine
CREATE TABLE public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_completed BOOLEAN DEFAULT false,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ressourcenplanung
CREATE TABLE public.project_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT,
    capacity_hours_per_week NUMERIC DEFAULT 40,
    allocation_hours_per_week NUMERIC DEFAULT 0,
    cost_rate NUMERIC DEFAULT 0,
    start_date DATE,
    end_date DATE,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget
CREATE TABLE public.project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'EUR',
    capex NUMERIC DEFAULT 0,
    opex NUMERIC DEFAULT 0,
    forecast NUMERIC DEFAULT 0,
    actuals NUMERIC DEFAULT 0,
    variance NUMERIC GENERATED ALWAYS AS (actuals - (capex + opex)) STORED,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Risiken
CREATE TABLE public.project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER CHECK (impact >= 1 AND impact <= 5),
    owner_id UUID,
    mitigation TEXT,
    status risk_status DEFAULT 'open',
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dokument-Links
CREATE TABLE public.project_document_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
    reference_id UUID NOT NULL,
    reference_type TEXT NOT NULL, -- 'document', 'calendar', 'helpdesk', 'goal', 'shift', 'esg', 'expense'
    metadata JSONB DEFAULT '{}',
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit Log
CREATE TABLE public.project_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    before_data JSONB,
    after_data JSONB,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projekt-Templates
CREATE TABLE public.project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_start_offset_days INTEGER DEFAULT 0,
    roles TEXT[] DEFAULT '{}',
    project_config JSONB DEFAULT '{}',
    milestones JSONB DEFAULT '[]',
    tasks JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event Bus Topics
CREATE TABLE public.project_event_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    module TEXT NOT NULL,
    entity TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event Subscriptions
CREATE TABLE public.project_event_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_module TEXT NOT NULL,
    topic TEXT NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard Data Sources
CREATE TABLE public.project_dashboard_data_sources (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    query_config JSONB NOT NULL,
    cache_ttl_seconds INTEGER DEFAULT 300,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard Layouts
CREATE TABLE public.project_dashboard_layouts (
    id TEXT PRIMARY KEY,
    device TEXT NOT NULL,
    grid_config JSONB NOT NULL,
    widgets JSONB NOT NULL,
    visibility JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indizes für Performance
CREATE INDEX idx_projects_owner_status ON public.projects(owner_id, status);
CREATE INDEX idx_projects_company_status ON public.projects(company_id, status);
CREATE INDEX idx_project_tasks_project_assignees ON public.project_tasks(project_id, assignees);
CREATE INDEX idx_project_tasks_due_date ON public.project_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_project_tasks_dependencies ON public.project_tasks USING GIN(dependencies);
CREATE INDEX idx_project_milestones_project_date ON public.project_milestones(project_id, date);
CREATE INDEX idx_project_audit_logs_target ON public.project_audit_logs(target_type, target_id, created_at);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at 
    BEFORE UPDATE ON public.project_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at 
    BEFORE UPDATE ON public.project_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_resources_updated_at 
    BEFORE UPDATE ON public.project_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_budgets_updated_at 
    BEFORE UPDATE ON public.project_budgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at 
    BEFORE UPDATE ON public.project_risks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Projects RLS
CREATE POLICY "projects_company_isolation" ON public.projects
    FOR ALL USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN company_id IS NULL THEN false
            ELSE company_id = get_user_company_id(auth.uid())
        END
    );

CREATE POLICY "projects_role_access" ON public.projects
    FOR SELECT USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'pmo')) THEN true
            WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manager') 
                AND department_id IN (SELECT department FROM employees WHERE id = auth.uid()) THEN true
            WHEN owner_id = auth.uid() THEN true
            WHEN auth.uid() = ANY(
                SELECT unnest(assignees) FROM project_tasks WHERE project_id = projects.id
            ) THEN true
            ELSE false
        END
    );

-- Tasks RLS  
CREATE POLICY "project_tasks_company_isolation" ON public.project_tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_tasks.project_id AND company_id = get_user_company_id(auth.uid()))
    );

CREATE POLICY "project_tasks_role_access" ON public.project_tasks
    FOR SELECT USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'pmo')) THEN true
            WHEN auth.uid() = ANY(assignees) THEN true
            WHEN EXISTS (
                SELECT 1 FROM projects p 
                WHERE p.id = project_tasks.project_id 
                AND (p.owner_id = auth.uid() OR 
                     (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manager') 
                      AND p.department_id IN (SELECT department FROM employees WHERE id = auth.uid())))
            ) THEN true
            ELSE false
        END
    );

-- Ähnliche Policies für andere Tabellen
CREATE POLICY "project_milestones_access" ON public.project_milestones
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_milestones.project_id AND company_id = get_user_company_id(auth.uid()))
    );

CREATE POLICY "project_resources_access" ON public.project_resources
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_resources.project_id AND company_id = get_user_company_id(auth.uid()))
    );

CREATE POLICY "project_budgets_finance_access" ON public.project_budgets
    FOR SELECT USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'finance', 'controlling')) THEN true
            WHEN EXISTS (
                SELECT 1 FROM projects p 
                WHERE p.id = project_budgets.project_id 
                AND (p.owner_id = auth.uid() OR 
                     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'pmo'))
            ) THEN true
            ELSE false
        END
    );

CREATE POLICY "project_risks_access" ON public.project_risks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_risks.project_id AND company_id = get_user_company_id(auth.uid()))
    );

CREATE POLICY "project_audit_logs_admin_access" ON public.project_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'auditor', 'superadmin'))
    );

CREATE POLICY "project_templates_access" ON public.project_templates
    FOR SELECT USING (
        CASE 
            WHEN is_superadmin_safe(auth.uid()) THEN true
            WHEN company_id IS NULL THEN is_active = true  -- Global templates
            ELSE company_id = get_user_company_id(auth.uid()) AND is_active = true
        END
    );

-- Auto-assign company_id trigger
CREATE OR REPLACE FUNCTION auto_assign_company_projects()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.company_id IS NULL AND TG_OP = 'INSERT' THEN
        NEW.company_id := get_user_company_id(auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_assign_company_projects_trigger
    BEFORE INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();

CREATE TRIGGER auto_assign_company_project_tasks_trigger
    BEFORE INSERT ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();

CREATE TRIGGER auto_assign_company_project_milestones_trigger
    BEFORE INSERT ON public.project_milestones
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();

CREATE TRIGGER auto_assign_company_project_resources_trigger
    BEFORE INSERT ON public.project_resources
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();

CREATE TRIGGER auto_assign_company_project_budgets_trigger
    BEFORE INSERT ON public.project_budgets
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();

CREATE TRIGGER auto_assign_company_project_risks_trigger
    BEFORE INSERT ON public.project_risks
    FOR EACH ROW EXECUTE FUNCTION auto_assign_company_projects();