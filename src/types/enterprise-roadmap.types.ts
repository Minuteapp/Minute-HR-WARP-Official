
export type StrategicThemeStatus = 'draft' | 'active' | 'completed' | 'archived';
export type ProgramStatus = 'draft' | 'planning' | 'active' | 'completed' | 'archived' | 'on_hold';
export type ProgramPriority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ScenarioType = 'baseline' | 'optimistic' | 'pessimistic' | 'what_if';
export type RiskCategory = 'budget' | 'timeline' | 'resources' | 'technical' | 'market' | 'regulatory' | 'external';
export type ApprovalType = 'creation' | 'major_change' | 'budget_change' | 'timeline_change' | 'completion';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PredictionType = 'delay_forecast' | 'budget_overrun' | 'resource_bottleneck' | 'risk_escalation';

export interface StrategicTheme {
  id: string;
  name: string;
  description?: string;
  color: string;
  owner_id?: string;
  company_id?: string;
  start_date?: string;
  end_date?: string;
  status: StrategicThemeStatus;
  strategic_alignment: Record<string, any>;
  esg_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  strategic_theme_id?: string;
  name: string;
  description?: string;
  status: ProgramStatus;
  priority: ProgramPriority;
  program_manager_id?: string;
  budget_allocated: number;
  budget_spent: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  completion_percentage: number;
  risk_level: RiskLevel;
  region?: string;
  business_unit?: string;
  esg_impact: Record<string, any>;
  kpis: any[];
  stakeholders: any[];
  dependencies: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapVersion {
  id: string;
  roadmap_id: string;
  version_name: string;
  version_number: number;
  is_baseline: boolean;
  is_current: boolean;
  scenario_type: ScenarioType;
  scenario_description?: string;
  version_data: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export interface ProgramProject {
  id: string;
  program_id: string;
  project_id: string;
  role_in_program: 'lead' | 'contributor' | 'dependency';
  weight_percentage: number;
  created_at: string;
}

export interface RoadmapRisk {
  id: string;
  roadmap_id: string;
  program_id?: string;
  risk_title: string;
  risk_description?: string;
  risk_category: RiskCategory;
  probability: number;
  impact: number;
  risk_score: number;
  mitigation_plan?: string;
  mitigation_owner?: string;
  status: 'identified' | 'assessed' | 'mitigating' | 'resolved' | 'accepted';
  due_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapApproval {
  id: string;
  roadmap_id: string;
  approval_type: ApprovalType;
  requested_by: string;
  approver_id: string;
  approval_status: ApprovalStatus;
  approval_level: number;
  change_description?: string;
  change_impact: Record<string, any>;
  requested_at: string;
  responded_at?: string;
  approver_comments?: string;
  approval_deadline?: string;
}

export interface RoadmapComment {
  id: string;
  roadmap_id: string;
  program_id?: string;
  parent_comment_id?: string;
  author_id: string;
  content: string;
  mentions: any[];
  attachments: any[];
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'product_launch' | 'digital_transformation' | 'hr_transformation' | 'market_expansion' | 'custom';
  template_data: Record<string, any>;
  is_public: boolean;
  usage_count: number;
  created_by?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapPrediction {
  id: string;
  roadmap_id: string;
  program_id?: string;
  prediction_type: PredictionType;
  prediction_confidence: number;
  predicted_value: Record<string, any>;
  prediction_date: string;
  factors_considered: any[];
  recommendation?: string;
  is_active: boolean;
  created_at: string;
}

export interface EnterpriseRoadmapData {
  strategic_themes: StrategicTheme[];
  programs: Program[];
  versions: RoadmapVersion[];
  risks: RoadmapRisk[];
  approvals: RoadmapApproval[];
  comments: RoadmapComment[];
  predictions: RoadmapPrediction[];
}
