
export interface BudgetPlan {
  id: string;
  name: string;
  type: 'operational' | 'investment' | 'project' | 'department';
  amount: number;
  used_amount: number;
  reserved_amount: number;
  remaining_amount: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  currency: string;
  category?: string;
  department?: string;
  responsible_person?: string;
  template_id?: string;
  comments?: string;
  assigned_to: string;
  assigned_to_name: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetPlanRequest {
  name: string;
  type: 'operational' | 'investment' | 'project' | 'department';
  amount: number;
  start_date: string;
  end_date: string;
  assigned_to: string;
  assigned_to_name: string;
  currency?: string;
  category?: string;
  department?: string;
  responsible_person?: string;
  template_id?: string;
  comments?: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  type: 'operational' | 'investment' | 'project' | 'department';
  template_data: Record<string, any>;
  category?: string;
  department?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetForecast {
  id: string;
  budget_plan_id: string;
  forecast_period_start: string;
  forecast_period_end: string;
  predicted_amounts: Record<string, number>;
  confidence_level: number;
  scenario_type: 'worst_case' | 'realistic' | 'best_case';
  created_by?: string;
  created_at: string;
  updated_at: string;
}
