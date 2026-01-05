// Enterprise Expense Management Types

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_cost_center_id?: string;
  department?: string;
  responsible_person_id?: string;
  budget_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  category_type: 'opex' | 'personnel' | 'travel' | 'marketing' | 'rd' | 'production' | 'finance' | 'depreciation' | 'taxes' | 'compliance' | 'csr' | 'other';
  parent_category_id?: string;
  requires_approval: boolean;
  approval_threshold: number;
  default_tax_rate: number;
  is_active: boolean;
  color_code: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface Supplier {
  id: string;
  supplier_number?: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  vat_id?: string;
  address?: Record<string, any>;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  payment_terms?: string;
  default_payment_method?: string;
  currency: string;
  category?: string;
  is_active: boolean;
  risk_rating: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface EnterpriseExpense {
  id: string;
  user_id?: string;
  amount: number;
  currency: string;
  category: string; // Legacy field
  category_id?: string;
  cost_center_id?: string;
  supplier_id?: string;
  project_id?: string;
  budget_plan_id?: string;
  description?: string;
  date: string;
  expense_type: 'operational' | 'capital' | 'extraordinary';
  vat_amount: number;
  vat_rate: number;
  net_amount?: number;
  invoice_number?: string;
  payment_method?: 'corporate_card' | 'cash' | 'bank_transfer' | 'invoice';
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  location?: string;
  department?: string;
  fiscal_year?: number;
  quarter?: number;
  month?: number;
  receipt_path?: string;
  ocr_data?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  approval_chain: any[];
  comments: any[];
  attachments: any[];
  is_recurring: boolean;
  recurring_frequency?: string;
  is_reimbursed: boolean;
  reimbursement_date?: string;
}

export interface BudgetExpenseAllocation {
  id: string;
  expense_id: string;
  budget_plan_id?: string;
  allocated_amount: number;
  allocation_percentage: number;
  allocation_date: string;
  created_at: string;
}

export interface ExpenseAnalytics {
  id: string;
  analysis_type: 'spending_pattern' | 'budget_variance' | 'forecast_accuracy' | 'anomaly_detection';
  period_start: string;
  period_end: string;
  cost_center_id?: string;
  category_id?: string;
  analysis_data: Record<string, any>;
  insights?: Record<string, any>;
  recommendations?: Record<string, any>;
  confidence_score: number;
  created_at: string;
}

export interface ExpenseFilter {
  category_id?: string;
  cost_center_id?: string;
  supplier_id?: string;
  project_id?: string;
  budget_plan_id?: string;
  expense_type?: string;
  payment_status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  department?: string;
  location?: string;
  tags?: string[];
  status?: string;
  fiscal_year?: number;
  quarter?: number;
  search?: string;
}

export interface ExpenseDashboardStats {
  total_expenses: number;
  pending_approvals: number;
  this_month_total: number;
  this_year_total: number;
  budget_utilization: number;
  top_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  top_cost_centers: Array<{
    cost_center: string;
    amount: number;
    percentage: number;
  }>;
  monthly_trend: Array<{
    month: string;
    amount: number;
    budget: number;
    variance: number;
  }>;
  overdue_payments: number;
  upcoming_payments: number;
}

export interface BudgetVarianceAnalysis {
  budget_plan_id: string;
  budget_name: string;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  period_start: string;
  period_end: string;
  category_breakdown: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}

export interface ExpenseImportData {
  date: string;
  amount: number;
  currency?: string;
  description: string;
  category?: string;
  cost_center?: string;
  supplier?: string;
  invoice_number?: string;
  vat_rate?: number;
  project?: string;
  department?: string;
  location?: string;
  tags?: string;
}

export interface ExpenseTemplate {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  cost_center_id?: string;
  supplier_id?: string;
  default_amount?: number;
  currency: string;
  expense_type: string;
  vat_rate: number;
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const EXPENSE_CATEGORIES = [
  { type: 'opex', label: 'Betriebsausgaben', color: '#3B82F6', icon: 'Building' },
  { type: 'personnel', label: 'Personalkosten', color: '#10B981', icon: 'Users' },
  { type: 'travel', label: 'Reisekosten', color: '#F59E0B', icon: 'Plane' },
  { type: 'marketing', label: 'Marketing & Vertrieb', color: '#EF4444', icon: 'Megaphone' },
  { type: 'rd', label: 'Forschung & Entwicklung', color: '#8B5CF6', icon: 'Lightbulb' },
  { type: 'production', label: 'Produktion', color: '#F97316', icon: 'Cog' },
  { type: 'finance', label: 'Finanzkosten', color: '#06B6D4', icon: 'CreditCard' },
  { type: 'depreciation', label: 'Abschreibungen', color: '#6B7280', icon: 'TrendingDown' },
  { type: 'taxes', label: 'Steuern & Abgaben', color: '#DC2626', icon: 'FileText' },
  { type: 'compliance', label: 'Compliance & Recht', color: '#7C3AED', icon: 'Scale' },
  { type: 'csr', label: 'Nachhaltigkeit & CSR', color: '#059669', icon: 'Leaf' },
  { type: 'other', label: 'Sonstige', color: '#6B7280', icon: 'Package' },
] as const;

export const EXPENSE_TYPES = [
  { value: 'operational', label: 'Betriebsausgaben' },
  { value: 'capital', label: 'Investitionsausgaben' },
  { value: 'extraordinary', label: 'Außerordentliche Ausgaben' }
] as const;

export const PAYMENT_METHODS = [
  { value: 'corporate_card', label: 'Firmenkreditkarte' },
  { value: 'cash', label: 'Bargeld' },
  { value: 'bank_transfer', label: 'Überweisung' },
  { value: 'invoice', label: 'Rechnung' }
] as const;

export const PAYMENT_STATUS = [
  { value: 'pending', label: 'Ausstehend', color: '#F59E0B' },
  { value: 'paid', label: 'Bezahlt', color: '#10B981' },
  { value: 'overdue', label: 'Überfällig', color: '#EF4444' },
  { value: 'cancelled', label: 'Storniert', color: '#6B7280' }
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Niedrig', color: '#6B7280' },
  { value: 'medium', label: 'Mittel', color: '#F59E0B' },
  { value: 'high', label: 'Hoch', color: '#EF4444' },
  { value: 'urgent', label: 'Dringend', color: '#DC2626' }
] as const;