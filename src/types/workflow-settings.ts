// Workflow Settings Types

export interface WorkflowGlobalSettings {
  id: string;
  company_id: string | null;
  // Grundlagen
  workflows_enabled: boolean;
  enabled_modules: string[];
  manual_workflows_allowed: boolean;
  sandbox_mode: boolean;
  sandbox_notify_only: boolean;
  // Zeit & Eskalation
  default_timeout_hours: number;
  reminder_before_hours: number[];
  escalation_levels: number;
  escalation_interval_hours: number;
  auto_cancel_after_days: number | null;
  auto_complete_after_days: number | null;
  // Genehmigungsketten
  allow_parallel_approvals: boolean;
  allow_delegation: boolean;
  require_deputy_for_absence: boolean;
  skip_absent_approvers: boolean;
  // KI
  ai_approver_suggestion: boolean;
  ai_risk_detection: boolean;
  ai_decision_recommendation: boolean;
  ai_explain_decisions: boolean;
  // Versionierung
  enable_versioning: boolean;
  max_versions_kept: number;
  enable_simulation: boolean;
  allow_rollback: boolean;
  require_approval_for_changes: boolean;
  // Monitoring
  enable_analytics: boolean;
  track_bottlenecks: boolean;
  alert_on_delays: boolean;
  delay_threshold_hours: number;
  // Audit
  created_at: string;
  updated_at: string;
}

export interface WorkflowTrigger {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  module: string;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  linked_workflow_template_id: string | null;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCondition {
  id: string;
  workflow_template_id: string | null;
  workflow_step_id: string | null;
  condition_group: number;
  condition_type: string;
  field_path: string | null;
  operator: string;
  value: any;
  logic_operator: 'AND' | 'OR';
  sort_order: number;
  created_at: string;
}

export interface WorkflowAction {
  id: string;
  workflow_template_id: string | null;
  workflow_step_id: string | null;
  action_type: string;
  action_name: string;
  action_config: Record<string, any>;
  execute_on: 'approval' | 'rejection' | 'timeout' | 'escalation' | 'always' | 'condition_met';
  execute_condition: Record<string, any> | null;
  delay_minutes: number;
  retry_on_failure: boolean;
  max_retries: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowApproverRule {
  id: string;
  workflow_template_id: string | null;
  workflow_step_id: string | null;
  rule_name: string;
  approver_type: string;
  approver_role: string | null;
  approver_user_id: string | null;
  approver_group_id: string | null;
  dynamic_rule: Record<string, any> | null;
  step_number: number;
  approval_mode: 'sequential' | 'parallel' | 'any_one' | 'all_required' | 'majority';
  required_approvals: number;
  can_delegate: boolean;
  can_reassign: boolean;
  auto_approve_conditions: Record<string, any> | null;
  timeout_action: 'escalate' | 'auto_approve' | 'auto_reject' | 'remind';
  is_optional: boolean;
  skip_conditions: Record<string, any> | null;
  created_at: string;
}

export interface WorkflowPermission {
  id: string;
  company_id: string | null;
  role_type: string;
  can_trigger: boolean;
  can_view_own: boolean;
  can_view_team: boolean;
  can_view_all: boolean;
  can_approve: boolean;
  can_reject: boolean;
  can_delegate: boolean;
  can_escalate: boolean;
  can_cancel: boolean;
  can_configure: boolean;
  can_create_templates: boolean;
  can_override: boolean;
  can_simulate: boolean;
  can_audit: boolean;
  created_at: string;
}

// Default values
export const defaultWorkflowGlobalSettings: Partial<WorkflowGlobalSettings> = {
  workflows_enabled: true,
  enabled_modules: ['all'],
  manual_workflows_allowed: true,
  sandbox_mode: false,
  sandbox_notify_only: true,
  default_timeout_hours: 48,
  reminder_before_hours: [24, 48],
  escalation_levels: 3,
  escalation_interval_hours: 24,
  auto_cancel_after_days: null,
  auto_complete_after_days: null,
  allow_parallel_approvals: true,
  allow_delegation: true,
  require_deputy_for_absence: true,
  skip_absent_approvers: false,
  ai_approver_suggestion: false,
  ai_risk_detection: false,
  ai_decision_recommendation: false,
  ai_explain_decisions: false,
  enable_versioning: true,
  max_versions_kept: 10,
  enable_simulation: true,
  allow_rollback: true,
  require_approval_for_changes: true,
  enable_analytics: true,
  track_bottlenecks: true,
  alert_on_delays: true,
  delay_threshold_hours: 72,
};

export const workflowModuleLabels: Record<string, string> = {
  all: 'Alle Module',
  absence: 'Abwesenheit',
  expense: 'Spesen',
  project: 'Projekte',
  onboarding: 'Onboarding',
  offboarding: 'Offboarding',
  innovation: 'Innovation',
  document: 'Dokumente',
  asset: 'Assets',
  time_tracking: 'Zeiterfassung',
};

export const triggerEventLabels: Record<string, string> = {
  created: 'Erstellt',
  updated: 'Aktualisiert',
  status_changed: 'Status geändert',
  deadline_passed: 'Frist überschritten',
  employee_started: 'Mitarbeiter gestartet',
  employee_ended: 'Mitarbeiter beendet',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
  amount_exceeded: 'Betrag überschritten',
};

export const conditionTypeLabels: Record<string, string> = {
  role: 'Rolle',
  location: 'Standort',
  department: 'Abteilung',
  amount: 'Betrag',
  duration: 'Dauer',
  risk_score: 'Risiko-Score',
  absence_type: 'Abwesenheitstyp',
  project_type: 'Projektart',
  custom_field: 'Benutzerdefiniertes Feld',
};

export const operatorLabels: Record<string, string> = {
  equals: 'Gleich',
  not_equals: 'Ungleich',
  greater_than: 'Größer als',
  less_than: 'Kleiner als',
  greater_equal: 'Größer oder gleich',
  less_equal: 'Kleiner oder gleich',
  contains: 'Enthält',
  not_contains: 'Enthält nicht',
  in: 'In Liste',
  not_in: 'Nicht in Liste',
  is_empty: 'Ist leer',
  is_not_empty: 'Ist nicht leer',
};

export const actionTypeLabels: Record<string, string> = {
  change_status: 'Status ändern',
  create_task: 'Aufgabe erstellen',
  send_notification: 'Benachrichtigung senden',
  send_email: 'E-Mail senden',
  create_project: 'Projekt anlegen',
  generate_document: 'Dokument erzeugen',
  call_webhook: 'Webhook aufrufen',
  call_api: 'API aufrufen',
  start_ai_analysis: 'KI-Analyse starten',
  assign_asset: 'Asset zuweisen',
  create_calendar_event: 'Kalendereintrag erstellen',
  update_field: 'Feld aktualisieren',
  custom: 'Benutzerdefiniert',
};

export const approverTypeLabels: Record<string, string> = {
  direct_manager: 'Direkter Vorgesetzter',
  skip_level_manager: 'Übergeordneter Vorgesetzter',
  role_based: 'Rollenbasiert',
  department_head: 'Abteilungsleiter',
  location_manager: 'Standortleiter',
  custom_user: 'Bestimmter Benutzer',
  dynamic: 'Dynamisch',
  group: 'Gruppe',
};

export const approvalModeLabels: Record<string, string> = {
  sequential: 'Sequenziell',
  parallel: 'Parallel',
  any_one: 'Einer genügt',
  all_required: 'Alle erforderlich',
  majority: 'Mehrheit',
};

export const workflowRoleLabels: Record<string, string> = {
  employee: 'Mitarbeiter',
  team_lead: 'Teamleiter',
  hr: 'HR',
  finance: 'Finance',
  admin: 'Admin',
  superadmin: 'Superadmin',
};
