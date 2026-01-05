
export interface ComplianceCase {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  case_type: 'gdpr_request' | 'policy_violation' | 'audit' | 'incident' | 'risk_assessment';
  status: 'open' | 'in_progress' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk_score?: number;
  assigned_to?: string;
  reported_by?: string;
  department?: string;
  location?: string;
  due_date?: string;
  closed_at?: string;
  resolution_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CompliancePolicy {
  id: string;
  title: string;
  description?: string;
  policy_type: 'code_of_conduct' | 'data_protection' | 'it_security' | 'hr_policy';
  content: string;
  version: string;
  language: string;
  requires_acknowledgment: boolean;
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  file_path?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PolicyAcknowledgment {
  id: string;
  policy_id: string;
  user_id: string;
  acknowledged_at: string;
  ip_address?: string;
  user_agent?: string;
  digital_signature?: string;
  reminder_sent_count: number;
  last_reminder_sent?: string;
}

export interface ComplianceAudit {
  id: string;
  audit_name: string;
  audit_type: 'internal' | 'external' | 'regulatory';
  scope?: string;
  auditor_name?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  findings_count: number;
  critical_findings: number;
  overall_rating?: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  report_file_path?: string;
  created_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  finding_title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  responsible_person?: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'completed' | 'overdue';
  corrective_action?: string;
  completion_date?: string;
  evidence_file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceIncident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  incident_type: 'data_breach' | 'policy_violation' | 'regulatory_breach' | 'whistleblower';
  severity: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  location?: string;
  incident_date: string;
  reported_by?: string;
  is_anonymous: boolean;
  investigation_status: 'reported' | 'investigating' | 'resolved' | 'escalated';
  assigned_investigator?: string;
  resolution?: string;
  corrective_actions?: any[];
  notification_authorities: boolean;
  notification_date?: string;
  closed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WhistleblowerReport {
  id: string;
  report_token: string;
  title: string;
  description: string;
  category: 'corruption' | 'harassment' | 'safety' | 'discrimination' | 'other';
  anonymity_level: 'anonymous' | 'confidential' | 'identified';
  status: 'submitted' | 'under_review' | 'investigating' | 'resolved' | 'closed';
  severity_assessment?: 'low' | 'medium' | 'high' | 'critical';
  department_affected?: string;
  location_affected?: string;
  assigned_to?: string;
  communication_log?: any[];
  encrypted_details?: string;
  ip_hash?: string;
  resolved_at?: string;
  resolution_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  description?: string;
  deadline_type: 'policy_review' | 'audit_due' | 'certification_renewal' | 'report_submission';
  due_date: string;
  responsible_person?: string;
  department?: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed' | 'cancelled';
  reminder_days?: number[];
  last_reminder_sent?: string;
  completion_date?: string;
  completion_notes?: string;
  recurring_pattern?: string;
  next_occurrence?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRisk {
  id: string;
  risk_title: string;
  description: string;
  risk_category: 'legal' | 'operational' | 'financial' | 'reputational' | 'strategic';
  likelihood: number;
  impact: number;
  risk_score: number;
  current_controls?: string;
  mitigation_plan?: string;
  risk_owner?: string;
  department?: string;
  status: 'identified' | 'assessed' | 'mitigating' | 'monitoring' | 'closed';
  review_date?: string;
  last_reviewed?: string;
  next_review_date?: string;
  residual_likelihood?: number;
  residual_impact?: number;
  residual_risk_score?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReport {
  id: string;
  report_name: string;
  report_type: 'audit_summary' | 'risk_dashboard' | 'policy_compliance' | 'incident_analysis';
  report_period_start?: string;
  report_period_end?: string;
  generated_by?: string;
  generated_at: string;
  file_path?: string;
  file_size?: number;
  parameters?: Record<string, any>;
  recipients?: any[];
  status: 'generated' | 'sent' | 'archived';
  metadata?: Record<string, any>;
}

export interface ComplianceMetric {
  id: string;
  metric_name: string;
  metric_type: 'kpi' | 'trend' | 'benchmark';
  metric_value: number;
  unit?: string;
  calculation_date: string;
  department?: string;
  location?: string;
  category?: string;
  target_value?: number;
  threshold_red?: number;
  threshold_yellow?: number;
  threshold_green?: number;
  trend_direction?: 'up' | 'down' | 'stable';
  metadata?: Record<string, any>;
  created_at: string;
}
