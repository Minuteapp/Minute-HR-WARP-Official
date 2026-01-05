-- Erweiterte Workflow & Automation Tabellen für Genehmigungsprozesse

-- Workflow Templates Tabelle
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('absence_approval', 'overtime_approval', 'expense_approval', 'time_off_approval', 'general_approval')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  
  -- Workflow Konfiguration
  approval_steps JSONB DEFAULT '[]'::jsonb, -- Array von Genehmigungsschritten
  conditions JSONB DEFAULT '{}'::jsonb, -- Bedingungen für den Workflow
  escalation_rules JSONB DEFAULT '{}'::jsonb, -- Eskalationsregeln
  auto_approval_rules JSONB DEFAULT '{}'::jsonb, -- Automatische Genehmigungsregeln
  notification_settings JSONB DEFAULT '{}'::jsonb, -- Benachrichtigungseinstellungen
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Workflow Instances Tabelle
CREATE TABLE public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL, -- ID des zu genehmigenden Objekts (z.B. absence_request)
  reference_type TEXT NOT NULL, -- Typ des Objekts (z.B. 'absence_request')
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'cancelled')),
  
  -- Workflow Data
  workflow_data JSONB DEFAULT '{}'::jsonb, -- Daten des Workflows
  approval_history JSONB DEFAULT '[]'::jsonb, -- Verlauf der Genehmigungen
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Users
  initiated_by UUID REFERENCES auth.users(id),
  current_approver UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id)
);

-- Workflow Steps Tabelle  
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('approval', 'notification', 'escalation', 'automatic')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped', 'escalated')),
  
  -- Step Configuration
  approver_id UUID REFERENCES auth.users(id),
  approver_role TEXT, -- Rolle des Genehmigers
  department TEXT, -- Abteilung
  conditions JSONB DEFAULT '{}'::jsonb, -- Bedingungen für diesen Schritt
  
  -- Step Data
  decision TEXT, -- Entscheidung (approved/rejected/etc.)
  comments TEXT, -- Kommentare
  decision_date TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(workflow_instance_id, step_number)
);

-- Notification Queue Tabelle
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'in_app', 'sms', 'slack')),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status and Timing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Escalation Rules Tabelle
CREATE TABLE public.escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  
  -- Escalation Configuration
  escalation_type TEXT NOT NULL CHECK (escalation_type IN ('time_based', 'user_based', 'role_based', 'department_based')),
  escalation_delay_hours INTEGER DEFAULT 24,
  escalation_to_user_id UUID REFERENCES auth.users(id),
  escalation_to_role TEXT,
  escalation_to_department TEXT,
  
  -- Conditions
  conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Auto Approval Rules Tabelle
CREATE TABLE public.auto_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  -- Rule Configuration
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('amount_based', 'user_based', 'department_based', 'time_based', 'history_based')),
  conditions JSONB NOT NULL, -- Bedingungen für automatische Genehmigung
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100, -- Niedrigere Zahlen = höhere Priorität
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Workflow Audit Log
CREATE TABLE public.workflow_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  
  -- Audit Details
  action TEXT NOT NULL, -- z.B. 'step_approved', 'workflow_escalated', etc.
  performed_by UUID REFERENCES auth.users(id),
  previous_state JSONB,
  new_state JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Company Isolation
CREATE POLICY "workflow_templates_company_isolation" ON workflow_templates
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "workflow_instances_company_isolation" ON workflow_instances
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

CREATE POLICY "workflow_steps_access" ON workflow_steps
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workflow_instances wi 
    WHERE wi.id = workflow_instance_id 
    AND (
      CASE 
        WHEN is_in_tenant_context() THEN wi.company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE wi.company_id = get_user_company_id(auth.uid()) OR wi.company_id IS NULL
      END
    )
  )
);

CREATE POLICY "notification_queue_access" ON notification_queue
FOR ALL USING (
  recipient_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM workflow_instances wi 
    WHERE wi.id = workflow_instance_id 
    AND (
      CASE 
        WHEN is_in_tenant_context() THEN wi.company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE wi.company_id = get_user_company_id(auth.uid()) OR wi.company_id IS NULL
      END
    )
  )
);

CREATE POLICY "escalation_rules_company_isolation" ON escalation_rules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workflow_templates wt 
    WHERE wt.id = workflow_template_id 
    AND (
      CASE 
        WHEN is_in_tenant_context() THEN wt.company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE wt.company_id = get_user_company_id(auth.uid()) OR wt.company_id IS NULL
      END
    )
  )
);

CREATE POLICY "auto_approval_rules_company_isolation" ON auto_approval_rules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workflow_templates wt 
    WHERE wt.id = workflow_template_id 
    AND (
      CASE 
        WHEN is_in_tenant_context() THEN wt.company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE wt.company_id = get_user_company_id(auth.uid()) OR wt.company_id IS NULL
      END
    )
  )
);

CREATE POLICY "workflow_audit_logs_access" ON workflow_audit_logs
FOR ALL USING (
  performed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM workflow_instances wi 
    WHERE wi.id = workflow_instance_id 
    AND (
      CASE 
        WHEN is_in_tenant_context() THEN wi.company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
        ELSE wi.company_id = get_user_company_id(auth.uid()) OR wi.company_id IS NULL
      END
    )
  )
);

-- Indexes für Performance
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_current_approver ON workflow_instances(current_approver);
CREATE INDEX idx_workflow_instances_reference ON workflow_instances(reference_id, reference_type);
CREATE INDEX idx_workflow_steps_workflow_instance ON workflow_steps(workflow_instance_id);
CREATE INDEX idx_workflow_steps_approver ON workflow_steps(approver_id);
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_id);

-- Triggers für updated_at
CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard Workflow Templates einfügen
INSERT INTO workflow_templates (name, description, workflow_type, approval_steps, conditions, auto_approval_rules, notification_settings) VALUES
('Standard Urlaubsantrag', 'Standard Workflow für Urlaubsanträge', 'absence_approval', 
'[
  {"step": 1, "type": "approval", "approver_role": "manager", "description": "Vorgesetzter Genehmigung"},
  {"step": 2, "type": "approval", "approver_role": "hr", "description": "HR Genehmigung", "conditions": {"days_requested": {"gt": 5}}}
]'::jsonb,
'{"max_days": 30, "advance_notice_days": 14}'::jsonb,
'[
  {"type": "amount_based", "condition": "days_requested <= 2", "auto_approve": true},
  {"type": "history_based", "condition": "no_rejections_last_year", "auto_approve": true}
]'::jsonb,
'{"send_confirmation": true, "send_reminders": true, "reminder_hours": [24, 72]}'::jsonb),

('Überstunden Genehmigung', 'Workflow für Überstunden-Genehmigungen', 'overtime_approval',
'[
  {"step": 1, "type": "approval", "approver_role": "manager", "description": "Direkter Vorgesetzter"},
  {"step": 2, "type": "approval", "approver_role": "admin", "description": "Geschäftsführung", "conditions": {"hours": {"gt": 20}}}
]'::jsonb,
'{"max_hours_per_week": 20, "max_hours_per_month": 40}'::jsonb,
'[
  {"type": "amount_based", "condition": "hours <= 5", "auto_approve": true}
]'::jsonb,
'{"send_confirmation": true, "escalate_after_hours": 48}'::jsonb);

-- Funktionen für Workflow-Management

-- Funktion zum Starten eines Workflows
CREATE OR REPLACE FUNCTION start_workflow(
  p_template_id UUID,
  p_reference_id UUID,
  p_reference_type TEXT,
  p_workflow_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instance_id UUID;
  v_template RECORD;
  v_first_step JSONB;
  v_approver_id UUID;
BEGIN
  -- Template holen
  SELECT * INTO v_template FROM workflow_templates WHERE id = p_template_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow template not found or inactive';
  END IF;
  
  -- Workflow Instance erstellen
  INSERT INTO workflow_instances (
    workflow_template_id, reference_id, reference_type, 
    workflow_data, initiated_by, company_id
  ) VALUES (
    p_template_id, p_reference_id, p_reference_type,
    p_workflow_data, auth.uid(), get_user_company_id(auth.uid())
  ) RETURNING id INTO v_instance_id;
  
  -- Ersten Schritt erstellen falls vorhanden
  IF jsonb_array_length(v_template.approval_steps) > 0 THEN
    v_first_step := v_template.approval_steps->0;
    
    -- Genehmiger ermitteln basierend auf Rolle
    IF v_first_step->>'approver_role' IS NOT NULL THEN
      -- Hier könnte eine komplexere Logik zur Ermittlung des Genehmigers stehen
      SELECT ur.user_id INTO v_approver_id 
      FROM user_roles ur 
      WHERE ur.role = (v_first_step->>'approver_role')::user_role 
      AND ur.company_id = get_user_company_id(auth.uid())
      LIMIT 1;
    END IF;
    
    -- Ersten Workflow-Schritt erstellen
    INSERT INTO workflow_steps (
      workflow_instance_id, step_number, step_type,
      approver_id, approver_role, conditions
    ) VALUES (
      v_instance_id, 1, v_first_step->>'type',
      v_approver_id, v_first_step->>'approver_role', 
      COALESCE(v_first_step->'conditions', '{}'::jsonb)
    );
    
    -- Current approver setzen
    UPDATE workflow_instances 
    SET current_approver = v_approver_id 
    WHERE id = v_instance_id;
  END IF;
  
  RETURN v_instance_id;
END;
$$;

-- Funktion für Genehmigungsentscheidung
CREATE OR REPLACE FUNCTION approve_workflow_step(
  p_workflow_instance_id UUID,
  p_step_number INTEGER,
  p_decision TEXT,
  p_comments TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_step RECORD;
  v_instance RECORD;
  v_template RECORD;
  v_next_step JSONB;
  v_next_approver_id UUID;
BEGIN
  -- Schritt und Instance holen
  SELECT ws.*, wi.workflow_template_id, wi.approval_history
  INTO v_step
  FROM workflow_steps ws
  JOIN workflow_instances wi ON wi.id = ws.workflow_instance_id
  WHERE ws.workflow_instance_id = p_workflow_instance_id 
  AND ws.step_number = p_step_number
  AND ws.status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow step not found or not pending';
  END IF;
  
  -- Berechtigung prüfen
  IF v_step.approver_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to approve this step';
  END IF;
  
  -- Schritt aktualisieren
  UPDATE workflow_steps 
  SET status = p_decision, 
      decision = p_decision,
      comments = p_comments,
      decision_date = now()
  WHERE workflow_instance_id = p_workflow_instance_id 
  AND step_number = p_step_number;
  
  -- Template und nächsten Schritt holen
  SELECT * INTO v_template FROM workflow_templates WHERE id = v_step.workflow_template_id;
  
  IF p_decision = 'approved' THEN
    -- Prüfen ob weitere Schritte vorhanden
    IF jsonb_array_length(v_template.approval_steps) > p_step_number THEN
      v_next_step := v_template.approval_steps->(p_step_number);
      
      -- Nächsten Genehmiger ermitteln
      IF v_next_step->>'approver_role' IS NOT NULL THEN
        SELECT ur.user_id INTO v_next_approver_id 
        FROM user_roles ur 
        WHERE ur.role = (v_next_step->>'approver_role')::user_role 
        AND ur.company_id = get_user_company_id(auth.uid())
        LIMIT 1;
      END IF;
      
      -- Nächsten Schritt erstellen
      INSERT INTO workflow_steps (
        workflow_instance_id, step_number, step_type,
        approver_id, approver_role, conditions
      ) VALUES (
        p_workflow_instance_id, p_step_number + 1, v_next_step->>'type',
        v_next_approver_id, v_next_step->>'approver_role',
        COALESCE(v_next_step->'conditions', '{}'::jsonb)
      );
      
      -- Current approver aktualisieren
      UPDATE workflow_instances 
      SET current_approver = v_next_approver_id,
          current_step = p_step_number + 1
      WHERE id = p_workflow_instance_id;
    ELSE
      -- Workflow abschließen
      UPDATE workflow_instances 
      SET status = 'approved',
          completed_at = now(),
          current_approver = NULL
      WHERE id = p_workflow_instance_id;
    END IF;
  ELSE
    -- Workflow ablehnen
    UPDATE workflow_instances 
    SET status = 'rejected',
        completed_at = now(),
        current_approver = NULL
    WHERE id = p_workflow_instance_id;
  END IF;
  
  RETURN true;
END;
$$;