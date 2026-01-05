-- HR Helpdesk Module - Complete Database Schema

-- Ticket Categories
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  sla_hours INTEGER NOT NULL DEFAULT 48,
  auto_assign_department TEXT,
  escalation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_legal_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA Policies
CREATE TABLE public.ticket_sla_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'high', 'critical')),
  response_time_hours INTEGER NOT NULL DEFAULT 24,
  resolution_time_hours INTEGER NOT NULL DEFAULT 48,
  escalation_levels JSONB DEFAULT '[]',
  business_hours_only BOOLEAN DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket Templates
CREATE TABLE public.ticket_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main Tickets Table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_for_user', 'resolved', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'critical')),
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  
  -- User Information
  created_by UUID NOT NULL,
  assigned_to UUID,
  department TEXT,
  employee_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  sla_due_at TIMESTAMP WITH TIME ZONE,
  
  -- AI and Automation
  ai_tags JSONB DEFAULT '[]',
  ai_sentiment_score NUMERIC(3,2) DEFAULT 0,
  ai_urgency_score NUMERIC(3,2) DEFAULT 0,
  ai_suggested_category TEXT,
  auto_responses_count INTEGER DEFAULT 0,
  
  -- Integration References
  related_absence_id UUID,
  related_payroll_id UUID,
  related_document_ids JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  source_channel TEXT DEFAULT 'app' CHECK (source_channel IN ('app', 'web', 'email', 'chat', 'slack', 'teams')),
  language TEXT DEFAULT 'de',
  
  -- SLA Tracking
  sla_breached BOOLEAN DEFAULT false,
  escalation_level INTEGER DEFAULT 0,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID,
  
  -- Privacy and Compliance
  contains_sensitive_data BOOLEAN DEFAULT false,
  requires_legal_review BOOLEAN DEFAULT false,
  legal_reviewed BOOLEAN DEFAULT false,
  legal_reviewed_by UUID,
  legal_reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Ticket Comments/Chat
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment' CHECK (comment_type IN ('comment', 'internal_note', 'ai_suggestion', 'system_message')),
  
  -- Author Information
  created_by UUID,
  author_name TEXT,
  author_role TEXT,
  
  -- AI Related
  is_ai_generated BOOLEAN DEFAULT false,
  ai_confidence_score NUMERIC(3,2),
  ai_approved_by UUID,
  ai_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  attachments JSONB DEFAULT '[]',
  mentioned_users JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket Attachments
CREATE TABLE public.ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  is_screenshot BOOLEAN DEFAULT false,
  is_voice_memo BOOLEAN DEFAULT false,
  transcription TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQ Categories
CREATE TABLE public.faq_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQ Articles
CREATE TABLE public.faq_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  
  -- Related Content
  related_documents JSONB DEFAULT '[]',
  related_tickets JSONB DEFAULT '[]',
  
  -- Status
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Ticket Escalations
CREATE TABLE public.ticket_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL,
  escalated_from UUID,
  escalated_to UUID NOT NULL,
  escalation_reason TEXT NOT NULL,
  escalation_type TEXT NOT NULL CHECK (escalation_type IN ('sla_breach', 'manual', 'auto_priority', 'compliance')),
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket Analytics/Metrics
CREATE TABLE public.ticket_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_response_time_hours NUMERIC(10,2),
  resolution_time_hours NUMERIC(10,2),
  customer_satisfaction_score INTEGER,
  reopened_count INTEGER DEFAULT 0,
  escalation_count INTEGER DEFAULT 0,
  ai_assistance_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge Base Usage Tracking
CREATE TABLE public.kb_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.faq_articles(id) ON DELETE CASCADE,
  user_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'helpful', 'unhelpful', 'share')),
  search_query TEXT,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Training Data
CREATE TABLE public.ai_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  human_response TEXT,
  was_helpful BOOLEAN,
  feedback_notes TEXT,
  training_category TEXT,
  confidence_score NUMERIC(3,2),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS compliance_case_seq START 1;
CREATE SEQUENCE IF NOT EXISTS compliance_incident_seq START 1;

-- Create indexes for performance
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_category ON public.tickets(category_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_sla_due ON public.tickets(sla_due_at);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_faq_articles_category ON public.faq_articles(category_id);
CREATE INDEX idx_faq_articles_published ON public.faq_articles(is_published);

-- Enable Row Level Security
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_data ENABLE ROW LEVEL SECURITY;