// Innovation Hub Settings Types

export interface InnovationIdeaStatus {
  key: string;
  label: string;
  color: string;
  order: number;
}

export interface InnovationHubSettings {
  id: string;
  company_id: string | null;
  // Aktivierung
  hub_enabled: boolean;
  scope: 'company' | 'subsidiaries' | 'locations';
  scope_entities: string[];
  // Innovationsarten
  enabled_idea_types: string[];
  // Lifecycle & Status
  status_model: InnovationIdeaStatus[];
  require_status_order: boolean;
  min_days_per_status: number;
  auto_transitions: Record<string, string>;
  // Einreichungsregeln
  submission_roles: string[];
  required_fields: string[];
  allow_anonymous: boolean;
  allow_team_submissions: boolean;
  allow_attachments: boolean;
  max_attachments: number;
  max_attachment_size_mb: number;
  // Bewertung
  evaluation_model: 'points' | 'voting' | 'expert' | 'ai' | 'combined';
  allowed_evaluator_roles: string[];
  min_evaluators: number;
  min_score_for_approval: number;
  voting_duration_days: number;
  ai_pre_evaluation: boolean;
  // Umsetzung
  auto_create_project: boolean;
  auto_create_tasks: boolean;
  auto_create_roadmap_item: boolean;
  require_budget_approval: boolean;
  budget_approval_threshold: number;
  auto_assign_responsible: boolean;
  // KI
  ai_clustering: boolean;
  ai_duplicate_detection: boolean;
  ai_impact_prediction: boolean;
  ai_suggestions: boolean;
  ai_summaries: boolean;
  // Reporting
  show_statistics_to_all: boolean;
  anonymize_reports: boolean;
  // Audit
  created_at: string;
  updated_at: string;
}

export interface InnovationChallenge {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  goal: string | null;
  start_date: string;
  end_date: string;
  target_roles: string[];
  target_teams: string[];
  target_locations: string[];
  categories: string[];
  reward_type: 'monetary' | 'recognition' | 'time_off' | 'custom' | null;
  reward_value: number | null;
  reward_description: string | null;
  allow_multiple_submissions: boolean;
  max_submissions_per_person: number | null;
  allow_team_challenges: boolean;
  min_team_size: number;
  max_team_size: number;
  evaluation_criteria: string[];
  status: 'draft' | 'scheduled' | 'active' | 'voting' | 'completed' | 'archived';
  winner_idea_ids: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InnovationEvaluationCriterion {
  id: string;
  company_id: string | null;
  name: string;
  key: string;
  description: string | null;
  weight: number;
  scale_min: number;
  scale_max: number;
  scale_labels: Record<string, string>;
  is_required: boolean;
  is_active: boolean;
  applies_to_types: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InnovationPermission {
  id: string;
  company_id: string | null;
  role_type: string;
  can_submit: boolean;
  can_view_all: boolean;
  can_comment: boolean;
  can_vote: boolean;
  can_evaluate: boolean;
  can_decide: boolean;
  can_manage_challenges: boolean;
  can_configure: boolean;
  can_export: boolean;
  can_audit: boolean;
  created_at: string;
}

// Default values
export const defaultInnovationHubSettings: Partial<InnovationHubSettings> = {
  hub_enabled: true,
  scope: 'company',
  scope_entities: [],
  enabled_idea_types: ['open_ideas', 'strategic', 'process', 'product', 'esg'],
  status_model: [
    { key: 'submitted', label: 'Eingereicht', color: '#3B82F6', order: 1 },
    { key: 'in_review', label: 'In Prüfung', color: '#F59E0B', order: 2 },
    { key: 'in_evaluation', label: 'In Bewertung', color: '#8B5CF6', order: 3 },
    { key: 'approved', label: 'Genehmigt', color: '#10B981', order: 4 },
    { key: 'rejected', label: 'Abgelehnt', color: '#EF4444', order: 5 },
    { key: 'in_implementation', label: 'In Umsetzung', color: '#06B6D4', order: 6 },
    { key: 'completed', label: 'Abgeschlossen', color: '#22C55E', order: 7 },
    { key: 'archived', label: 'Archiviert', color: '#6B7280', order: 8 },
  ],
  require_status_order: true,
  min_days_per_status: 0,
  auto_transitions: {},
  submission_roles: ['all'],
  required_fields: ['title', 'description', 'category'],
  allow_anonymous: false,
  allow_team_submissions: true,
  allow_attachments: true,
  max_attachments: 5,
  max_attachment_size_mb: 10,
  evaluation_model: 'points',
  allowed_evaluator_roles: ['peer', 'team_lead', 'innovation_board', 'management'],
  min_evaluators: 3,
  min_score_for_approval: 70,
  voting_duration_days: 7,
  ai_pre_evaluation: false,
  auto_create_project: false,
  auto_create_tasks: false,
  auto_create_roadmap_item: false,
  require_budget_approval: true,
  budget_approval_threshold: 0,
  auto_assign_responsible: false,
  ai_clustering: false,
  ai_duplicate_detection: true,
  ai_impact_prediction: false,
  ai_suggestions: false,
  ai_summaries: false,
  show_statistics_to_all: false,
  anonymize_reports: true,
};

export const ideaTypeLabels: Record<string, string> = {
  open_ideas: 'Offene Ideen',
  strategic: 'Strategische Initiativen',
  process: 'Prozessverbesserungen',
  product: 'Produkt-/Service-Ideen',
  esg: 'ESG- & Nachhaltigkeitsideen',
};

export const evaluationModelLabels: Record<string, string> = {
  points: 'Punktebewertung',
  voting: 'Voting (Likes/Stimmen)',
  expert: 'Expertenbewertung',
  ai: 'KI-Bewertung',
  combined: 'Kombiniert',
};

export const evaluatorRoleLabels: Record<string, string> = {
  peer: 'Peers',
  team_lead: 'Teamleiter',
  innovation_board: 'Innovation Board',
  management: 'Management',
};

export const innovationRoleLabels: Record<string, string> = {
  employee: 'Mitarbeiter',
  team_lead: 'Teamleiter',
  innovation_board: 'Innovation Board',
  hr: 'HR',
  management: 'Management',
  admin: 'Admin',
  superadmin: 'Superadmin',
};
