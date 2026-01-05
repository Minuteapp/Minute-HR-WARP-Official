-- Zuerst schauen wir uns die workflow_templates Struktur an und fügen fehlende Spalten hinzu
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS template_key text,
ADD COLUMN IF NOT EXISTS workflow_type text DEFAULT 'approval';

-- Erstelle einen eindeutigen Index für template_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_templates_template_key 
ON workflow_templates(template_key) WHERE template_key IS NOT NULL;

-- Erweitere workflow_instances für bessere Integration  
ALTER TABLE workflow_instances 
ADD COLUMN IF NOT EXISTS reference_type text DEFAULT 'absence_request',
ADD COLUMN IF NOT EXISTS requester_email text,
ADD COLUMN IF NOT EXISTS requester_name text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS escalation_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false;

-- Erweitere notification_queue für E-Mail-Integration
ALTER TABLE notification_queue 
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_error text,
ADD COLUMN IF NOT EXISTS template_name text DEFAULT 'workflow_notification',
ADD COLUMN IF NOT EXISTS email_data jsonb DEFAULT '{}';

-- Erstelle Auto-Approval Bedingungen Tabelle
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