
-- Erweiterte Roadmap-Tabellen für Enterprise-Level

-- Strategic Themes (Strategische Themen)
CREATE TABLE IF NOT EXISTS public.strategic_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  owner_id UUID REFERENCES auth.users,
  company_id UUID,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  strategic_alignment JSONB DEFAULT '{}',
  esg_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Programs (Programme)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategic_theme_id UUID REFERENCES public.strategic_themes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'active', 'completed', 'archived', 'on_hold')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  program_manager_id UUID REFERENCES auth.users,
  budget_allocated DECIMAL(15,2) DEFAULT 0,
  budget_spent DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  start_date DATE,
  end_date DATE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  region TEXT,
  business_unit TEXT,
  esg_impact JSONB DEFAULT '{}',
  kpis JSONB DEFAULT '[]',
  stakeholders JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roadmap Versions (für Versionierung und What-If Szenarien)
CREATE TABLE IF NOT EXISTS public.roadmap_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  is_baseline BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,
  scenario_type TEXT DEFAULT 'baseline' CHECK (scenario_type IN ('baseline', 'optimistic', 'pessimistic', 'what_if')),
  scenario_description TEXT,
  version_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Program-Project Links (Verknüpfung zwischen Programmen und Projekten)
CREATE TABLE IF NOT EXISTS public.program_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  role_in_program TEXT DEFAULT 'contributor' CHECK (role_in_program IN ('lead', 'contributor', 'dependency')),
  weight_percentage DECIMAL(5,2) DEFAULT 0 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(program_id, project_id)
);

-- Roadmap Risks (Risikomanagement)
CREATE TABLE IF NOT EXISTS public.roadmap_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  risk_title TEXT NOT NULL,
  risk_description TEXT,
  risk_category TEXT CHECK (risk_category IN ('budget', 'timeline', 'resources', 'technical', 'market', 'regulatory', 'external')),
  probability INTEGER CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  mitigation_plan TEXT,
  mitigation_owner UUID REFERENCES auth.users,
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigating', 'resolved', 'accepted')),
  due_date DATE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roadmap Approvals (Approval-Workflows)
CREATE TABLE IF NOT EXISTS public.roadmap_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('creation', 'major_change', 'budget_change', 'timeline_change', 'completion')),
  requested_by UUID REFERENCES auth.users NOT NULL,
  approver_id UUID REFERENCES auth.users NOT NULL,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'expired')),
  approval_level INTEGER DEFAULT 1,
  change_description TEXT,
  change_impact JSONB DEFAULT '{}',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  approver_comments TEXT,
  approval_deadline TIMESTAMP WITH TIME ZONE
);

-- Roadmap Comments & Collaboration
CREATE TABLE IF NOT EXISTS public.roadmap_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.roadmap_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roadmap Audit Trail
CREATE TABLE IF NOT EXISTS public.roadmap_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'approve', 'reject', 'comment', 'status_change')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('roadmap', 'program', 'milestone', 'risk', 'comment', 'approval')),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  change_summary TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roadmap Templates
CREATE TABLE IF NOT EXISTS public.roadmap_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('product_launch', 'digital_transformation', 'hr_transformation', 'market_expansion', 'custom')),
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Predictive Analytics Data
CREATE TABLE IF NOT EXISTS public.roadmap_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmap_planning(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  prediction_type TEXT CHECK (prediction_type IN ('delay_forecast', 'budget_overrun', 'resource_bottleneck', 'risk_escalation')),
  prediction_confidence DECIMAL(5,2) CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
  predicted_value JSONB NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  factors_considered JSONB DEFAULT '[]',
  recommendation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security Policies
ALTER TABLE public.strategic_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_predictions ENABLE ROW LEVEL SECURITY;

-- Policies für Strategic Themes
CREATE POLICY "Users can view strategic themes in their company" ON public.strategic_themes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create strategic themes" ON public.strategic_themes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their strategic themes" ON public.strategic_themes
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policies für Programs
CREATE POLICY "Users can view programs" ON public.programs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Program managers can update their programs" ON public.programs
  FOR UPDATE USING (auth.uid() = program_manager_id OR auth.uid() = created_by);

CREATE POLICY "Users can create programs" ON public.programs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policies für andere Tabellen (vereinfacht)
CREATE POLICY "Users can view roadmap versions" ON public.roadmap_versions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create roadmap versions" ON public.roadmap_versions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view program projects" ON public.program_projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage program projects" ON public.program_projects
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Weitere Policies für Risks, Approvals, Comments, etc.
CREATE POLICY "Users can view roadmap risks" ON public.roadmap_risks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage roadmap risks" ON public.roadmap_risks
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view roadmap approvals" ON public.roadmap_approvals
  FOR SELECT USING (auth.uid() = requested_by OR auth.uid() = approver_id);

CREATE POLICY "Users can create approval requests" ON public.roadmap_approvals
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Approvers can update approvals" ON public.roadmap_approvals
  FOR UPDATE USING (auth.uid() = approver_id);

CREATE POLICY "Users can view roadmap comments" ON public.roadmap_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments" ON public.roadmap_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments" ON public.roadmap_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can view audit logs" ON public.roadmap_audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can create audit logs" ON public.roadmap_audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view roadmap templates" ON public.roadmap_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON public.roadmap_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view predictions" ON public.roadmap_predictions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_strategic_themes_company ON public.strategic_themes(company_id);
CREATE INDEX IF NOT EXISTS idx_programs_theme ON public.programs(strategic_theme_id);
CREATE INDEX IF NOT EXISTS idx_programs_manager ON public.programs(program_manager_id);
CREATE INDEX IF NOT EXISTS idx_program_projects_program ON public.program_projects(program_id);
CREATE INDEX IF NOT EXISTS idx_program_projects_project ON public.program_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_risks_roadmap ON public.roadmap_risks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_risks_program ON public.roadmap_risks(program_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_approvals_roadmap ON public.roadmap_approvals(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_approvals_approver ON public.roadmap_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_comments_roadmap ON public.roadmap_comments(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_audit_roadmap ON public.roadmap_audit_log(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_predictions_roadmap ON public.roadmap_predictions(roadmap_id);

-- Trigger für automatische Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_strategic_themes_updated_at BEFORE UPDATE ON public.strategic_themes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_risks_updated_at BEFORE UPDATE ON public.roadmap_risks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_comments_updated_at BEFORE UPDATE ON public.roadmap_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_templates_updated_at BEFORE UPDATE ON public.roadmap_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
