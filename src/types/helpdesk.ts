
export interface HelpdeskTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: 'draft' | 'open' | 'in_progress' | 'waiting_for_response' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subcategory?: string;
  tags: string[];
  created_by: string;
  assigned_to?: string;
  assigned_to_team?: string;
  requester_email?: string;
  requester_name?: string;
  sla_due_date?: string;
  first_response_due?: string;
  resolution_due?: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  cost_impact?: number;
  affected_employees?: number;
  tenant_id?: string;
  language: 'de' | 'en' | 'fr' | 'es';
  ai_suggested_responses: any[];
  similar_tickets: any[];
  auto_classification_confidence?: number;
  escalation_level?: number;
  related_module?: string;
  related_record_id?: string;
  integration_data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HelpdeskComment {
  id: string;
  ticket_id: string;
  user_id?: string;
  author_name: string;
  author_email?: string;
  comment_type: 'comment' | 'internal_note' | 'solution' | 'escalation';
  content: string;
  is_internal: boolean;
  is_ai_generated: boolean;
  attachments: any[];
  time_spent_minutes?: number;
  created_at: string;
}

export interface HelpdeskSLAConfig {
  id: string;
  name: string;
  category: string;
  priority: string;
  first_response_hours: number;
  resolution_hours: number;
  escalation_hours: number;
  business_hours_only: boolean;
  is_active: boolean;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
}

export interface HelpdeskKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_public: boolean;
  language: string;
  view_count: number;
  helpful_votes: number;
  created_by?: string;
  updated_by?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HelpdeskTemplate {
  id: string;
  name: string;
  template_type: 'ticket' | 'response' | 'workflow';
  category: string;
  title_template?: string;
  content_template: string;
  default_priority: string;
  default_tags: string[];
  auto_assign_rules: Record<string, any>;
  language: string;
  is_active: boolean;
  usage_count: number;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
}

export interface HelpdeskTeam {
  id: string;
  name: string;
  description?: string;
  specialties: string[];
  members: string[];
  team_lead?: string;
  auto_assignment_enabled: boolean;
  working_hours: Record<string, any>;
  tenant_id?: string;
  created_at: string;
}

export interface HelpdeskSurvey {
  id: string;
  ticket_id: string;
  rating?: number;
  feedback?: string;
  survey_data: Record<string, any>;
  submitted_at: string;
}
