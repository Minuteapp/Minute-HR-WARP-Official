export interface RewardBudget {
  id: string;
  year: number;
  department: string;
  total_budget: number;
  used_budget: number;
  color: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardTransaction {
  id: string;
  employee_id?: string;
  employee_name?: string;
  employee_avatar?: string;
  reward_name: string;
  category: string;
  amount: number;
  department?: string;
  transaction_date: string;
  company_id?: string;
  created_at: string;
}

export interface BudgetStatistics {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  utilizationPercentage: number;
  monthlySpend: number;
  avgPerEmployee: number;
  largestExpense: {
    name: string;
    amount: number;
  };
  yearEndForecast: number;
  departmentBudgets: Array<{
    department: string;
    totalBudget: number;
    usedBudget: number;
    percentage: number;
    color: string;
  }>;
  monthlyExpenses: Array<{
    month: string;
    amount: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}
