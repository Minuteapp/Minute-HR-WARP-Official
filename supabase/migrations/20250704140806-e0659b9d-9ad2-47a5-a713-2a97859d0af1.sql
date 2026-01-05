-- Ziele-Modul (Objectives/Key Results/KPIs) für Enterprise HR-System

-- Basis-Tabelle für Ziele
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  objective_type TEXT DEFAULT 'okr' CHECK (objective_type IN ('okr', 'kpi', 'strategic')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  owner_id UUID NOT NULL,
  team_id UUID,
  company_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'on_hold')),
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  risk_score NUMERIC DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  auto_update_progress BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  linked_projects JSONB DEFAULT '[]',
  linked_budgets JSONB DEFAULT '[]',
  escalation_rules JSONB DEFAULT '{}'
);

-- Key Results für Ziele
CREATE TABLE public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'automatic', 'integration')),
  update_frequency TEXT DEFAULT 'weekly' CHECK (update_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Audit Trail für Ziele
CREATE TABLE public.objective_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'approved', 'rejected', 'completed', 'cancelled')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  user_id UUID NOT NULL,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- KI-gestützte Vorschläge
CREATE TABLE public.objective_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('title', 'key_result', 'risk_assessment', 'target_value')),
  suggested_title TEXT,
  suggested_metrics JSONB DEFAULT '[]',
  confidence_score NUMERIC DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  based_on_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Genehmigungsworkflows
CREATE TABLE public.objective_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  approval_step INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ziel-Templates
CREATE TABLE public.objective_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ziel-Kommentare
CREATE TABLE public.objective_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_system_comment BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Indizes für Performance
CREATE INDEX idx_objectives_owner ON public.objectives(owner_id);
CREATE INDEX idx_objectives_team ON public.objectives(team_id);
CREATE INDEX idx_objectives_status ON public.objectives(status);
CREATE INDEX idx_objectives_period ON public.objectives(period_start, period_end);
CREATE INDEX idx_key_results_objective ON public.key_results(objective_id);
CREATE INDEX idx_objective_audit_objective ON public.objective_audit_trail(objective_id);
CREATE INDEX idx_objective_suggestions_user ON public.objective_suggestions(user_id);

-- Trigger für automatische Fortschrittsberechnung
CREATE OR REPLACE FUNCTION calculate_objective_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.objectives 
  SET 
    progress = (
      SELECT COALESCE(AVG(
        CASE 
          WHEN target_value = 0 THEN 0
          ELSE LEAST(100, (current_value / target_value) * 100)
        END
      ), 0)
      FROM public.key_results 
      WHERE objective_id = COALESCE(NEW.objective_id, OLD.objective_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.objective_id, OLD.objective_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_objective_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.key_results
  FOR EACH ROW EXECUTE FUNCTION calculate_objective_progress();

-- Trigger für Audit Trail
CREATE OR REPLACE FUNCTION log_objective_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.objective_audit_trail (
      objective_id, action, user_id, user_email, new_value
    ) VALUES (
      NEW.id, 'created', NEW.created_by, 
      (SELECT email FROM auth.users WHERE id = NEW.created_by),
      jsonb_build_object('title', NEW.title, 'status', NEW.status)::text
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log alle relevanten Änderungen
    IF OLD.title != NEW.title THEN
      INSERT INTO public.objective_audit_trail (
        objective_id, action, field_name, old_value, new_value, user_id, user_email
      ) VALUES (
        NEW.id, 'updated', 'title', OLD.title, NEW.title, auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    END IF;
    
    IF OLD.status != NEW.status THEN
      INSERT INTO public.objective_audit_trail (
        objective_id, action, field_name, old_value, new_value, user_id, user_email
      ) VALUES (
        NEW.id, 'updated', 'status', OLD.status, NEW.status, auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_objective_changes_trigger
  AFTER INSERT OR UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION log_objective_changes();

-- RLS Policies
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_comments ENABLE ROW LEVEL SECURITY;

-- Objectives Policies
CREATE POLICY "Users can view objectives they own or are team members"
  ON public.objectives FOR SELECT
  USING (
    owner_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM public.employees WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create objectives"
  ON public.objectives FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    (owner_id = auth.uid() OR 
     EXISTS (
       SELECT 1 FROM public.user_roles 
       WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
     ))
  );

CREATE POLICY "Users can update their own objectives"
  ON public.objectives FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Key Results Policies
CREATE POLICY "Users can view key results for accessible objectives"
  ON public.key_results FOR SELECT
  USING (
    objective_id IN (
      SELECT id FROM public.objectives
      WHERE owner_id = auth.uid() OR
            team_id IN (
              SELECT team_id FROM public.employees WHERE id = auth.uid()
            ) OR
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
            )
    )
  );

CREATE POLICY "Users can manage key results for their objectives"
  ON public.key_results FOR ALL
  USING (
    objective_id IN (
      SELECT id FROM public.objectives
      WHERE owner_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
            )
    )
  );

-- Audit Trail Policies
CREATE POLICY "Users can view audit trail for accessible objectives"
  ON public.objective_audit_trail FOR SELECT
  USING (
    objective_id IN (
      SELECT id FROM public.objectives
      WHERE owner_id = auth.uid() OR
            team_id IN (
              SELECT team_id FROM public.employees WHERE id = auth.uid()
            ) OR
            EXISTS (
              SELECT 1 FROM public.user_roles 
              WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
            )
    )
  );

-- Suggestions Policies
CREATE POLICY "Users can view their own suggestions"
  ON public.objective_suggestions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create suggestions"
  ON public.objective_suggestions FOR INSERT
  WITH CHECK (true);

-- Approvals Policies
CREATE POLICY "Users can view approvals for their objectives or where they are approvers"
  ON public.objective_approvals FOR SELECT
  USING (
    approver_id = auth.uid() OR
    objective_id IN (
      SELECT id FROM public.objectives WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage their approvals"
  ON public.objective_approvals FOR ALL
  USING (approver_id = auth.uid());

-- Templates Policies
CREATE POLICY "Users can view active templates"
  ON public.objective_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.objective_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Comments Policies
CREATE POLICY "Users can view comments for accessible objectives"
  ON public.objective_comments FOR SELECT
  USING (
    objective_id IN (
      SELECT id FROM public.objectives
      WHERE owner_id = auth.uid() OR
            team_id IN (
              SELECT team_id FROM public.employees WHERE id = auth.uid()
            )
    )
  );

CREATE POLICY "Users can create comments on accessible objectives"
  ON public.objective_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    objective_id IN (
      SELECT id FROM public.objectives
      WHERE owner_id = auth.uid() OR
            team_id IN (
              SELECT team_id FROM public.employees WHERE id = auth.uid()
            )
    )
  );

-- Objectives Modul zu permission_modules hinzufügen
INSERT INTO permission_modules (name, module_key, description, is_active) VALUES
  ('Ziele', 'objectives', 'Ziele und Key Results Management', true)
ON CONFLICT (module_key) DO NOTHING;

-- Standard-Berechtigungen für Objectives-Modul
WITH objectives_module AS (
  SELECT id FROM permission_modules WHERE module_key = 'objectives'
)
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  role_data.role,
  objectives_module.id,
  action_data.action::permission_action,
  scope_data.scope::permission_scope,
  permission_data.is_granted
FROM objectives_module
CROSS JOIN (
  VALUES 
    ('employee', 'own', true),
    ('admin', 'global', true),
    ('superadmin', 'global', true)
) AS role_data(role, default_scope, default_granted)
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('delete'), ('approve')
) AS action_data(action)
CROSS JOIN (
  VALUES 
    ('own', CASE WHEN role_data.role = 'employee' THEN true ELSE false END),
    ('team', CASE WHEN role_data.role IN ('admin', 'superadmin') THEN true ELSE false END),
    ('global', CASE WHEN role_data.role IN ('admin', 'superadmin') THEN true ELSE false END)
) AS scope_data(scope, scope_allowed)
CROSS JOIN (
  VALUES (
    CASE 
      WHEN role_data.role = 'employee' AND scope_data.scope = 'own' AND action_data.action IN ('view', 'create', 'edit') THEN true
      WHEN role_data.role IN ('admin', 'superadmin') THEN true
      ELSE false
    END
  )
) AS permission_data(is_granted)
WHERE scope_data.scope_allowed = true
ON CONFLICT (role, module_id, action, scope) DO NOTHING;