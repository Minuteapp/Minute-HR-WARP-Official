export type RewardCategory = 'financial' | 'non_financial' | 'experience' | 'recognition';
export type RewardFrequency = 'once' | 'monthly' | 'quarterly' | 'yearly' | 'unlimited';
export type EmployeeRewardStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

export interface RewardCatalogItem {
  id: string;
  name: string;
  description?: string;
  category: RewardCategory;
  value_display: string;
  value_min?: number;
  value_max?: number;
  budget?: number;
  budget_used?: number;
  frequency?: RewardFrequency;
  eligibility?: string;
  is_active: boolean;
  redemption_count: number;
  icon?: string;
  company_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeReward {
  id: string;
  employee_id: string;
  employee_name?: string;
  reward_id?: string;
  reward_name: string;
  value: string;
  category: string;
  status: EmployeeRewardStatus;
  awarded_by?: string;
  awarded_by_name?: string;
  awarded_at: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRewardCatalogRequest {
  name: string;
  description?: string;
  category: RewardCategory;
  value_display: string;
  value_min?: number;
  value_max?: number;
  budget?: number;
  frequency?: RewardFrequency;
  eligibility?: string;
  is_active?: boolean;
  icon?: string;
}

export interface UpdateRewardCatalogRequest extends Partial<CreateRewardCatalogRequest> {
  id: string;
}

export interface CreateEmployeeRewardRequest {
  employee_id: string;
  employee_name?: string;
  reward_id?: string;
  reward_name: string;
  value: string;
  category: string;
  notes?: string;
}

export interface RewardStatistics {
  totalRewards: number;
  rewardsThisMonth: number;
  rewardsChange: number;
  budgetUsed: number;
  budgetTotal: number;
  budgetPercentage: number;
  participation: number;
  automatedRewards: number;
  activeRewards: number;
  totalCatalogRewards: number;
  redeemedThisMonth: number;
  redeemedChange: number;
  mostPopular?: {
    name: string;
    count: number;
  };
  monthlyData: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  categoryDistribution: Array<{
    category: RewardCategory;
    count: number;
    percentage: number;
  }>;
}

export const CATEGORY_LABELS: Record<RewardCategory, string> = {
  financial: 'Finanziell',
  non_financial: 'Nicht-finanziell',
  experience: 'Erlebnis',
  recognition: 'Anerkennung',
};

export const FREQUENCY_LABELS: Record<RewardFrequency, string> = {
  once: 'Einmalig',
  monthly: 'Monatlich',
  quarterly: 'Quartalsweise',
  yearly: 'Jährlich',
  unlimited: 'Unbegrenzt',
};

export const STATUS_LABELS: Record<EmployeeRewardStatus, string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  rejected: 'Abgelehnt',
};

export const CATEGORY_COLORS: Record<RewardCategory, string> = {
  financial: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  non_financial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  experience: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  recognition: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export const STATUS_COLORS: Record<EmployeeRewardStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
