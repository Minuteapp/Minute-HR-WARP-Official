export interface UserGoalStats {
  userId: string;
  userName: string;
  department: string;
  role: string;
  isAdmin: boolean;
  totalGoals: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  completionRate: number;
  alignmentRate: number;
}

export interface DepartmentStats {
  department: string;
  totalGoals: number;
  completionRate: number;
  onTrack: number;
  atRisk: number;
  behind: number;
}

export interface KPIMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'critical';
  progress: number;
  goalId?: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'recommendation' | 'forecast' | 'correlation' | 'capacity' | 'new-goal';
  title: string;
  confidence: number;
  description: string;
  action: string;
  actionable: boolean;
  relatedGoalIds: string[];
  createdAt: string;
}

export interface GoalCardData {
  id: string;
  title: string;
  description: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  owner: string;
  department: string;
  dueDate: string;
  keyResults: KeyResult[];
  tags: string[];
  subGoals?: GoalCardData[];
}

export interface KeyResult {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
}

export type GoalStatusFilter = 'all' | 'on-track' | 'at-risk' | 'behind' | 'completed';
export type DepartmentFilter = 'all' | string;
