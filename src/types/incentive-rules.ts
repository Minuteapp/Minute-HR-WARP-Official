export interface IncentiveRule {
  id: string;
  name: string;
  category: 'performance' | 'goals' | 'tasks' | 'shifts' | 'surveys' | 'general';
  trigger_description: string;
  trigger_conditions: any[];
  conditions_count: number;
  action_description: string;
  action_frequency: 'once' | 'monthly' | 'quarterly' | 'yearly' | 'per_project' | null;
  reward_id: string | null;
  is_automatic: boolean;
  is_active: boolean;
  budget: number | null;
  budget_used: number;
  execution_count: number;
  last_executed_at: string | null;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleAchievement {
  id: string;
  employee_id: string | null;
  source_module: 'performance' | 'goals_okrs' | 'tasks' | 'shifts' | 'surveys';
  achievement_title: string;
  achievement_date: string;
  suggested_reward_id: string | null;
  suggested_reward_name: string | null;
  impact_level: 'high' | 'medium' | 'low' | null;
  ai_score: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  company_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  // Joined data
  employee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateIncentiveRuleRequest {
  name: string;
  category: IncentiveRule['category'];
  trigger_description: string;
  trigger_conditions?: any[];
  conditions_count?: number;
  action_description: string;
  action_frequency?: IncentiveRule['action_frequency'];
  reward_id?: string;
  is_automatic?: boolean;
  is_active?: boolean;
  budget?: number;
}

export interface IncentiveRuleStatistics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  automatedPercentage: number;
  budgetTotal: number;
  budgetUsed: number;
}

export interface ModuleAchievementStatistics {
  totalAchievements: number;
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  avgAiScore: number;
  byModule: Record<string, number>;
}

export const categoryLabels: Record<IncentiveRule['category'], string> = {
  performance: 'Performance',
  goals: 'Ziele & OKRs',
  tasks: 'Aufgaben',
  shifts: 'Schichten',
  surveys: 'Umfragen',
  general: 'Allgemein'
};

export const categoryColors: Record<IncentiveRule['category'], string> = {
  performance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  goals: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  tasks: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  shifts: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  surveys: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export const frequencyLabels: Record<string, string> = {
  once: 'Einmalig',
  monthly: 'Monatlich',
  quarterly: 'Quartalsweise',
  yearly: 'Jährlich',
  per_project: 'Pro Projekt'
};

export const moduleLabels: Record<ModuleAchievement['source_module'], string> = {
  performance: 'Performance Management',
  goals_okrs: 'Ziele & OKRs',
  tasks: 'Aufgabenmanagement',
  shifts: 'Schichtplanung',
  surveys: 'Mitarbeiterumfragen'
};

export const moduleColors: Record<ModuleAchievement['source_module'], string> = {
  performance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  goals_okrs: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  tasks: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  shifts: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  surveys: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
};

export const impactLabels: Record<string, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig'
};

export const impactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

export const achievementStatusLabels: Record<ModuleAchievement['status'], string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
  completed: 'Ausgegeben'
};

export const achievementStatusColors: Record<ModuleAchievement['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};
