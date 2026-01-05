export interface RewardArchiveItem {
  id: string;
  archive_date: string;
  employee_id?: string;
  employee_name?: string;
  employee_avatar?: string;
  reward_name: string;
  reward_description?: string;
  value_display: string;
  value_amount?: number;
  category: string;
  department?: string;
  approved_by?: string;
  company_id?: string;
  created_at: string;
}

export interface ArchiveStatistics {
  totalRewards: number;
  totalValue: number;
  avgPerEmployee: number;
  mostFrequent: {
    name: string;
    count: number;
  };
  yearlyBreakdown: Array<{
    year: number;
    count: number;
    value: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface ArchiveFilters {
  year?: number;
  category?: string;
  search?: string;
}

export const archiveCategoryLabels: Record<string, string> = {
  monetary: 'Monetär',
  goods: 'Sachprämie',
  experience: 'Erlebnis',
  development: 'Weiterbildung',
  recognition: 'Anerkennung',
};

export const archiveCategoryColors: Record<string, string> = {
  monetary: 'bg-emerald-100 text-emerald-800',
  goods: 'bg-blue-100 text-blue-800',
  experience: 'bg-purple-100 text-purple-800',
  development: 'bg-orange-100 text-orange-800',
  recognition: 'bg-pink-100 text-pink-800',
};
