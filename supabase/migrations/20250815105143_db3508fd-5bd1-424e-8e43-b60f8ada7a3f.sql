-- Erweitere workflow_instances für bessere Integration
ALTER TABLE workflow_instances 
ADD COLUMN IF NOT EXISTS reference_type text DEFAULT 'absence_request',
ADD COLUMN IF NOT EXISTS requester_email text,
ADD COLUMN IF NOT EXISTS requester_name text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS escalation_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false;

-- Erstelle Trigger für automatische Workflow-Erstellung bei Abwesenheitsanträgen
CREATE OR REPLACE FUNCTION create_workflow_for_absence_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template_id uuid;
  v_employee_info record;
  v_workflow_data jsonb;
BEGIN
  -- Hole Employee-Informationen
  SELECT e.name, e.email, e.department 
  INTO v_employee_info
  FROM employees e 
  WHERE e.id = NEW.user_id
  LIMIT 1;
  
  -- Bestimme Template basierend auf Abwesenheitstyp
  SELECT id INTO v_template_id
  FROM workflow_templates 
  WHERE template_key = CASE 
    WHEN NEW.absence_type IN ('vacation', 'holiday') THEN 'vacation_approval'
    WHEN NEW.absence_type = 'sick_leave' THEN 'sick_leave_approval'
    ELSE 'general_approval'
  END
  AND is_active = true
  LIMIT 1;
  
  -- Erstelle Workflow-Daten
  v_workflow_data := jsonb_build_object(
    'absence_type', NEW.absence_type,
    'start_date', NEW.start_date,
    'end_date', NEW.end_date,
    'duration_days', NEW.end_date - NEW.start_date + 1,
    'reason', COALESCE(NEW.reason, ''),
    'half_day', COALESCE(NEW.half_day, false)
  );
  
  -- Starte Workflow falls Template gefunden
  IF v_template_id IS NOT NULL THEN
    UPDATE workflow_instances 
    SET reference_id = NEW.id,
        reference_type = 'absence_request',
        requester_email = v_employee_info.email,
        requester_name = v_employee_info.name,
        department = v_employee_info.department,
        workflow_data = v_workflow_data
    WHERE id = start_workflow(
      v_template_id, 
      NEW.id, 
      'absence_request', 
      v_workflow_data
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aktiviere Trigger für Abwesenheitsanträge
DROP TRIGGER IF EXISTS trigger_create_workflow_absence ON absence_requests;
CREATE TRIGGER trigger_create_workflow_absence
  AFTER INSERT ON absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_workflow_for_absence_request();

-- Erweitere notification_queue für bessere E-Mail-Integration
ALTER TABLE notification_queue 
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_error text,
ADD COLUMN IF NOT EXISTS template_name text DEFAULT 'workflow_notification',
ADD COLUMN IF NOT EXISTS email_data jsonb DEFAULT '{}';

-- Erstelle Auto-Approval Regeln Tabelle
CREATE TABLE IF NOT EXISTS auto_approval_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id uuid REFERENCES workflow_templates(id) ON DELETE CASCADE,
  condition_name text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}',
  max_amount numeric,
  max_days integer,
  department_rules jsonb DEFAULT '{}',
  role_exceptions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS für auto_approval_conditions
ALTER TABLE auto_approval_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage auto approval conditions" ON auto_approval_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Erstelle Eskalations-Regeln Tabelle
CREATE TABLE IF NOT EXISTS escalation_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id uuid REFERENCES workflow_templates(id) ON DELETE CASCADE,
  escalation_level integer NOT NULL DEFAULT 1,
  hours_delay integer NOT NULL DEFAULT 24,
  escalate_to_role text,
  escalate_to_user_id uuid,
  notification_message text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS für escalation_policies
ALTER TABLE escalation_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage escalation policies" ON escalation_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr', 'superadmin')
    )
  );

-- Erweiterte Workflow-Funktionen für Auto-Genehmigung
CREATE OR REPLACE FUNCTION check_auto_approval(p_workflow_instance_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instance record;
  v_condition record;
  v_should_auto_approve boolean := false;
BEGIN
  -- Hole Workflow Instance
  SELECT * INTO v_instance 
  FROM workflow_instances 
  WHERE id = p_workflow_instance_id;
  
  -- Prüfe Auto-Approval Bedingungen
  FOR v_condition IN 
    SELECT * FROM auto_approval_conditions 
    WHERE workflow_template_id = v_instance.workflow_template_id 
    AND is_active = true
  LOOP
    v_should_auto_approve := true;
    
    -- Prüfe Betragsgrenze (falls definiert)
    IF v_condition.max_amount IS NOT NULL THEN
      IF (v_instance.workflow_data->>'amount')::numeric > v_condition.max_amount THEN
        v_should_auto_approve := false;
        CONTINUE;
      END IF;
    END IF;
    
    -- Prüfe Tage-Limit (falls definiert)
    IF v_condition.max_days IS NOT NULL THEN
      IF (v_instance.workflow_data->>'duration_days')::integer > v_condition.max_days THEN
        v_should_auto_approve := false;
        CONTINUE;
      END IF;
    END IF;
    
    -- Wenn alle Bedingungen erfüllt, genehmige automatisch
    IF v_should_auto_approve THEN
      UPDATE workflow_instances 
      SET status = 'approved',
          completed_at = now(),
          auto_approved = true
      WHERE id = p_workflow_instance_id;
      
      -- Aktualisiere auch den ursprünglichen Antrag
      IF v_instance.reference_type = 'absence_request' THEN
        UPDATE absence_requests 
        SET status = 'approved',
            approved_at = now(),
            approved_by = auth.uid()
        WHERE id = v_instance.reference_id;
      END IF;
      
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;

-- Trigger für Auto-Genehmigung beim Workflow-Start
CREATE OR REPLACE FUNCTION trigger_auto_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prüfe Auto-Genehmigung nur bei neuen Workflows
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    PERFORM check_auto_approval(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_workflow_auto_approval ON workflow_instances;
CREATE TRIGGER trigger_workflow_auto_approval
  AFTER INSERT ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_approval();

-- Erstelle Standard-Templates falls noch nicht vorhanden
INSERT INTO workflow_templates (template_key, name, description, approval_steps, is_active, created_by)
VALUES 
  ('vacation_approval', 'Urlaubsantrag Genehmigung', 'Standard Genehmigungsprozess für Urlaubsanträge', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, auth.uid()),
  ('sick_leave_approval', 'Krankmeldung Genehmigung', 'Genehmigungsprozess für Krankmeldungen', 
   '[{"type": "approval", "approver_role": "hr", "conditions": {}}]'::jsonb, true, auth.uid()),
  ('overtime_approval', 'Überstunden Genehmigung', 'Genehmigungsprozess für Überstunden', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {}}]'::jsonb, true, auth.uid()),
  ('expense_approval', 'Kostenerstattung', 'Genehmigungsprozess für Kostenerstattungen', 
   '[{"type": "approval", "approver_role": "manager", "conditions": {"max_amount": 500}}, {"type": "approval", "approver_role": "admin", "conditions": {"min_amount": 500}}]'::jsonb, true, auth.uid())
ON CONFLICT (template_key) DO NOTHING;

-- Erstelle Standard Auto-Approval Regeln
INSERT INTO auto_approval_conditions (workflow_template_id, condition_name, max_days, conditions)
SELECT id, 'Auto-Genehmigung für kurze Urlaube', 2, '{"department_exceptions": ["management"]}'::jsonb
FROM workflow_templates 
WHERE template_key = 'vacation_approval'
ON CONFLICT DO NOTHING;