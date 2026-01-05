
export interface OnboardingProcess {
  id: string;
  employee_id: string;
  status: 'not_started' | 'preboarding' | 'in_progress' | 'completed';
  start_date: string | null;
  completion_date: string | null;
  mentor_id: string | null;
  created_at: string;
  updated_at: string;
  preboarding_started_at?: string | null;
  gamification_score?: number;
  current_level?: number;
  feedback_submitted?: boolean;
  feedback_requested_at?: string | null;
  employee?: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  };
}

export interface OnboardingChecklistItem {
  id: string;
  process_id: string;
  title: string;
  description: string | null;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee_id?: string | null;
  points?: number;
  type?: 'regular' | 'it_setup' | 'feedback' | 'goal';
  position?: number;
}

export interface NewEmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  startDate: string;
  role: string;
  mentorId?: string;
}

export interface MentorOption {
  id: string;
  name: string;
  position?: string;
  department?: string;
}

export interface OnboardingFeedback {
  id: string;
  process_id: string;
  employee_id: string;
  phase: 'week1' | 'day30' | 'day90';
  rating: number;
  comments: string;
  created_at: string;
  anonymous: boolean;
  improvement_suggestions?: string;
  satisfaction_areas?: string[];
}

export interface OnboardingBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: string;
    value: any;
  };
  image_url?: string;
}

export interface EmployeeBadge {
  id: string;
  employee_id: string;
  badge_id: string;
  earned_at: string;
  process_id: string;
  badge: OnboardingBadge;
}

export interface OnboardingWikiArticle {
  id: string;
  title: string;
  content: string;
  category: 'structure' | 'tools' | 'culture' | 'contacts' | 'general';
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  attachments?: OnboardingWikiAttachment[];
  video_url?: string;
}

export interface OnboardingWikiAttachment {
  id: string;
  article_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface ITSetupItem {
  id: string;
  process_id: string;
  title: string;
  description?: string;
  assignee_role: 'it_department' | 'system_admin' | 'employee';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
  reminder_sent_at?: string;
  due_date?: string;
}

export interface OnboardingLevel {
  id: number;
  name: string;
  description: string;
  min_points: number;
  badge_id?: string;
}

export interface OnboardingGoal {
  id: string;
  process_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  feedback?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  linked_goal_id?: string;
  created_at: string;
  updated_at: string;
}
