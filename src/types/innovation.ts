
export interface IdeaFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  channel_id?: string;
  priority: 'low' | 'medium' | 'high';
  expected_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  attachments?: string[];
  tags: string[];
  target_audience?: string;
  success_metrics?: string;
  resources_needed?: string;
  timeline_estimate?: string;
  created_by?: string;
  status?: IdeaStatus;
  votes_count?: number;
  comments_count?: number;
  created_at?: string;
  updated_at?: string;
  // Innovation Lifecycle Extensions
  roadmap_id?: string;
  project_id?: string;
  lifecycle_stage?: LifecycleStage;
  risk_score?: number;
  success_probability?: number;
  budget_estimate?: number;
  pilot_area?: string;
  automation_triggered?: boolean;
}

export type IdeaStatus = 'new' | 'under_review' | 'approved' | 'in_development' | 'pilot_phase' | 'implemented' | 'rejected' | 'archived';

export interface InnovationChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  ideas_count: number;
  pilot_projects_count: number;
}

export interface PilotProject {
  id: string;
  title: string;
  description: string;
  idea_id?: string;
  status: 'preparing' | 'pilot_phase' | 'scaling' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget?: number;
  success_metrics: string[];
  responsible_person: string;
  team_members: string[];
  progress: number;
  risk_assessment?: string;
  learnings?: string;
  next_steps?: string;
  attachments: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaVote {
  id: string;
  idea_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface IdeaComment {
  id: string;
  idea_id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface InnovationStatistics {
  total_ideas: number;
  ideas_this_month: number;
  implemented_ideas: number;
  active_pilot_projects: number;
  participation_rate: number;
  top_contributors: Array<{
    user_id: string;
    user_name: string;
    ideas_count: number;
    votes_count: number;
  }>;
  ideas_by_status: Record<IdeaStatus, number>;
  ideas_by_channel: Array<{
    channel_name: string;
    ideas_count: number;
  }>;
}

export interface KITestFeature {
  id: string;
  name: string;
  description: string;
  feature_type: 'ai_comment' | 'skill_matching' | 'auto_categorization' | 'predictive_analysis';
  is_enabled: boolean;
  usage_count: number;
  feedback_score: number;
  created_at: string;
}

// Innovation Lifecycle Types
export type LifecycleStage = 
  | 'new' 
  | 'under_review' 
  | 'approved' 
  | 'roadmap_created' 
  | 'project_created' 
  | 'in_development' 
  | 'pilot_phase' 
  | 'implemented' 
  | 'rejected' 
  | 'archived';

export interface InnovationLifecycleTracking {
  id: string;
  idea_id: string;
  roadmap_id?: string;
  project_id?: string;
  current_stage: LifecycleStage;
  stage_history: Array<{
    stage: LifecycleStage;
    timestamp: string;
    trigger: string;
  }>;
  automation_log: Array<{
    action: string;
    timestamp: string;
    roadmap_id?: string;
    project_id?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface InnovationApproval {
  id: string;
  idea_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  approval_stage: 'initial_review' | 'technical_review' | 'final_approval';
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  decision?: string;
  feedback?: string;
  ai_score: {
    duplicate_risk?: number;
    success_probability?: number;
    risk_assessment?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: {
    default_tasks: Array<{
      title: string;
      priority: 'low' | 'medium' | 'high';
      estimated_hours: number;
    }>;
    default_timeline_weeks: number;
    required_skills: string[];
  };
  is_active: boolean;
  created_at: string;
}

export interface InnovationAIInsight {
  id: string;
  idea_id: string;
  insight_type: 'duplicate_detection' | 'success_prediction' | 'risk_analysis' | 'skill_matching';
  confidence_score: number;
  insight_data: Record<string, any>;
  recommendations: string[];
  similar_ideas: string[];
  created_at: string;
}
