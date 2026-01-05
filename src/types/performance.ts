
export type PerformanceTemplateType = 'individual' | 'team' | 'goal_based' | 'feedback_360' | 'ad_hoc';
export type PerformanceRatingScale = 'stars_5' | 'percentage' | 'grade' | 'text';
export type PerformanceCycleType = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type PerformanceReviewStatus = 'draft' | 'in_progress' | 'pending_signature' | 'completed' | 'archived';
export type PerformanceNotificationType = 'review_due' | 'feedback_request' | 'review_completed' | 'signature_required';
export type PerformanceTrend = 'improving' | 'declining' | 'stable';

export interface PerformanceEvaluationField {
  name: string;
  label: string;
  type: 'rating' | 'text' | 'number' | 'select';
  required: boolean;
  description?: string;
  options?: string[];
}

export interface PerformanceCriteria {
  name: string;
  weight: number;
  category: string;
}

export interface PerformanceTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: PerformanceTemplateType;
  evaluation_fields: PerformanceEvaluationField[];
  criteria: PerformanceCriteria[];
  rating_scale: PerformanceRatingScale;
  cycle_type: PerformanceCycleType;
  requires_signature: boolean;
  is_system_template: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: string;
  template_id?: string;
  employee_id: string;
  reviewer_id?: string;
  team_id?: string;
  review_period_start: string;
  review_period_end: string;
  status: PerformanceReviewStatus;
  overall_score?: number;
  scores: Record<string, any>;
  feedback: Record<string, any>;
  improvement_goals?: string;
  action_items: any[];
  reviewer_signature?: any;
  employee_signature?: any;
  signed_at?: string;
  due_date?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PerformanceComment {
  id: string;
  review_id: string;
  user_id: string;
  criteria_id?: string;
  comment: string;
  is_private: boolean;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceNotification {
  id: string;
  review_id: string;
  user_id: string;
  notification_type: PerformanceNotificationType;
  message: string;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
}

export interface PerformanceCycle {
  id: string;
  name: string;
  cycle_type: PerformanceCycleType;
  start_date: string;
  end_date: string;
  template_id?: string;
  is_active: boolean;
  auto_create_reviews: boolean;
  reminder_days_before: number;
  created_by?: string;
  created_at: string;
}

export interface PerformanceAnalytics {
  id: string;
  employee_id: string;
  analysis_period_start: string;
  analysis_period_end: string;
  performance_trend?: PerformanceTrend;
  trend_score?: number;
  peer_comparison: Record<string, any>;
  recommendations: any[];
  risk_factors: any[];
  strengths: any[];
  areas_for_improvement: any[];
  generated_at: string;
  is_current: boolean;
}

export interface PerformanceGoalLink {
  id: string;
  review_id: string;
  goal_id: string;
  goal_weight: number;
  goal_achievement_score?: number;
  created_at: string;
}

export interface CreatePerformanceReviewRequest {
  template_id?: string;
  employee_id: string;
  reviewer_id?: string;
  team_id?: string;
  review_period_start: string;
  review_period_end: string;
  due_date?: string;
  metadata?: Record<string, any>;
}

export interface CreatePerformanceTemplateRequest {
  name: string;
  description?: string;
  template_type: PerformanceTemplateType;
  evaluation_fields: PerformanceEvaluationField[];
  criteria: PerformanceCriteria[];
  rating_scale?: PerformanceRatingScale;
  cycle_type?: PerformanceCycleType;
  requires_signature?: boolean;
}

export interface PerformanceMetrics {
  totalReviews: number;
  completedReviews: number;
  averageScore: number;
  onTimeCompletion: number;
  pendingReviews: number;
  overdueReviews: number;
}
