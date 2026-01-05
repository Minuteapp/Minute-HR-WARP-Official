
-- Create HR Helpdesk tables with comprehensive enterprise features

-- Core helpdesk tickets table
CREATE TABLE public.helpdesk_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE DEFAULT 'HD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 10000))::text, 4, '0'),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'waiting_for_response', 'resolved', 'closed', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  subcategory TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- User management
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_team TEXT,
  requester_email TEXT,
  requester_name TEXT,
  
  -- SLA and timing
  sla_due_date TIMESTAMP WITH TIME ZONE,
  first_response_due TIMESTAMP WITH TIME ZONE,
  resolution_due TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Business impact
  business_impact TEXT DEFAULT 'low' CHECK (business_impact IN ('low', 'medium', 'high', 'critical')),
  cost_impact NUMERIC DEFAULT 0,
  affected_employees INTEGER DEFAULT 1,
  
  -- Multi-tenant and language
  tenant_id UUID,
  language TEXT DEFAULT 'de' CHECK (language IN ('de', 'en', 'fr', 'es')),
  
  -- AI and automation
  ai_suggested_responses JSONB DEFAULT '[]'::jsonb,
  similar_tickets JSONB DEFAULT '[]'::jsonb,
  auto_classification_confidence NUMERIC DEFAULT 0,
  escalation_level INTEGER DEFAULT 0,
  
  -- Integration data
  related_module TEXT,
  related_record_id UUID,
  integration_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket comments and responses
CREATE TABLE public.helpdesk_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_email TEXT,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'internal_note', 'solution', 'escalation')),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket attachments
CREATE TABLE public.helpdesk_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.helpdesk_comments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  is_sensitive BOOLEAN DEFAULT false,
  dsgvo_classification TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA configurations
CREATE TABLE public.helpdesk_sla_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  first_response_hours INTEGER NOT NULL DEFAULT 24,
  resolution_hours INTEGER NOT NULL DEFAULT 72,
  escalation_hours INTEGER NOT NULL DEFAULT 48,
  business_hours_only BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE public.helpdesk_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'de',
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  tenant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket templates
CREATE TABLE public.helpdesk_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('ticket', 'response', 'workflow')),
  category TEXT NOT NULL,
  title_template TEXT,
  content_template TEXT NOT NULL,
  default_priority TEXT DEFAULT 'medium',
  default_tags JSONB DEFAULT '[]'::jsonb,
  auto_assign_rules JSONB DEFAULT '{}'::jsonb,
  language TEXT DEFAULT 'de',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  tenant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Escalation rules
CREATE TABLE public.helpdesk_escalation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_condition JSONB NOT NULL, -- JSON conditions for escalation
  escalation_actions JSONB NOT NULL, -- JSON actions to take
  is_active BOOLEAN DEFAULT true,
  execution_order INTEGER DEFAULT 0,
  tenant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team and agent management
CREATE TABLE public.helpdesk_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  specialties JSONB DEFAULT '[]'::jsonb, -- Areas of expertise
  members JSONB DEFAULT '[]'::jsonb, -- User IDs of team members
  team_lead UUID REFERENCES auth.users(id),
  auto_assignment_enabled BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket audit log
CREATE TABLE public.helpdesk_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Satisfaction surveys
CREATE TABLE public.helpdesk_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  survey_data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automation workflows
CREATE TABLE public.helpdesk_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('ticket_created', 'status_changed', 'sla_breach', 'keyword_match')),
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  tenant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_helpdesk_tickets_status ON public.helpdesk_tickets(status);
CREATE INDEX idx_helpdesk_tickets_priority ON public.helpdesk_tickets(priority);
CREATE INDEX idx_helpdesk_tickets_category ON public.helpdesk_tickets(category);
CREATE INDEX idx_helpdesk_tickets_assigned_to ON public.helpdesk_tickets(assigned_to);
CREATE INDEX idx_helpdesk_tickets_created_by ON public.helpdesk_tickets(created_by);
CREATE INDEX idx_helpdesk_tickets_tenant_id ON public.helpdesk_tickets(tenant_id);
CREATE INDEX idx_helpdesk_tickets_sla_due_date ON public.helpdesk_tickets(sla_due_date);
CREATE INDEX idx_helpdesk_comments_ticket_id ON public.helpdesk_comments(ticket_id);
CREATE INDEX idx_helpdesk_audit_log_ticket_id ON public.helpdesk_audit_log(ticket_id);

-- Enable Row Level Security
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets (employees can see their own tickets, admins can see all)
CREATE POLICY "Users can view their own tickets" ON public.helpdesk_tickets
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tickets" ON public.helpdesk_tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Assigned users can update tickets" ON public.helpdesk_tickets
  FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible tickets" ON public.helpdesk_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.helpdesk_tickets 
      WHERE id = ticket_id AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can add comments to accessible tickets" ON public.helpdesk_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.helpdesk_tickets 
      WHERE id = ticket_id AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
  );

-- Insert default SLA configurations
INSERT INTO public.helpdesk_sla_configs (name, category, priority, first_response_hours, resolution_hours, escalation_hours) VALUES
('Standard - Low Priority', 'general', 'low', 48, 120, 96),
('Standard - Medium Priority', 'general', 'medium', 24, 72, 48),
('Standard - High Priority', 'general', 'high', 8, 24, 16),
('Standard - Urgent', 'general', 'urgent', 2, 8, 4),
('Payroll - High Priority', 'payroll', 'high', 4, 12, 8),
('Payroll - Urgent', 'payroll', 'urgent', 1, 4, 2),
('Compliance - All Priorities', 'compliance', 'medium', 12, 24, 18);

-- Insert default knowledge base articles
INSERT INTO public.helpdesk_knowledge_base (title, content, category, is_public, language) VALUES
('How to submit a helpdesk ticket', 'To submit a helpdesk ticket, follow these steps...', 'general', true, 'de'),
('Payroll inquiry process', 'For payroll related questions, please provide...', 'payroll', true, 'de'),
('DSGVO data requests', 'For GDPR/DSGVO related requests...', 'compliance', false, 'de');

-- Insert default templates
INSERT INTO public.helpdesk_templates (name, template_type, category, title_template, content_template, default_priority) VALUES
('Payroll Issue', 'ticket', 'payroll', 'Payroll Issue: {issue_type}', 'Please describe your payroll issue in detail...', 'high'),
('General Inquiry', 'ticket', 'general', 'General HR Inquiry', 'Please describe your inquiry...', 'medium'),
('Auto Response', 'response', 'general', '', 'Thank you for contacting HR support. We have received your ticket and will respond within our SLA timeframe.', 'medium');
