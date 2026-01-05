import { User } from '../types/user.types';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD' | 'CNY';

export type ExpenseStatus = 
  | 'draft' 
  | 'submitted' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'paid' 
  | 'cancelled';

export type ExpenseCategory = 
  | 'travel' 
  | 'accommodation' 
  | 'meals' 
  | 'training' 
  | 'equipment' 
  | 'office_supplies' 
  | 'software' 
  | 'telecommunications' 
  | 'transport' 
  | 'entertainment' 
  | 'events' 
  | 'marketing' 
  | 'other';

export type TaxClassification = 
  | 'taxable' 
  | 'tax_free' 
  | 'private' 
  | 'business';

export type PaymentMethod = 
  | 'company_card' 
  | 'personal_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'company_account' 
  | 'other';

export interface ApprovalStep {
  id: string;
  role: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  upload_date: string;
  uploaded_by: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  exchange_rate?: number;
  amount_local?: number; // Betrag in lokaler Währung nach Umrechnung
  category: ExpenseCategory;
  tax_classification: TaxClassification;
  tax_rate?: number;
  tax_amount?: number;
  date: string;
  payment_method: PaymentMethod;
  cost_center?: string;
  project_id?: string;
  business_trip_id?: string;
  attachments: Attachment[];
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
  submitted_by: string;
  approval_chain: ApprovalStep[];
  comments: ExpenseComment[];
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  is_reimbursed: boolean;
  reimbursement_date?: string;
  audit_logs: AuditLogEntry[];
}

export interface ExpenseComment {
  id: string;
  expense_id: string;
  user_id: string;
  comment: string;
  timestamp: string;
  is_internal: boolean;
}

export interface AuditLogEntry {
  id: string;
  expense_id: string;
  user_id: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface ExpenseFilter {
  status?: ExpenseStatus[];
  category?: ExpenseCategory[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  costCenter?: string;
  projectId?: string;
  businessTripId?: string;
  searchQuery?: string;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: Currency;
  start_date: string;
  end_date: string;
  department_id?: string;
  cost_center?: string;
  project_id?: string;
  user_id?: string;
  spent_amount: number;
  remaining_amount: number;
  status: 'active' | 'overbudget' | 'closed';
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  manager_id?: string;
  department_id?: string;
  is_active: boolean;
}

export interface ExpenseReport {
  id: string;
  title: string;
  description?: string;
  expenses: string[]; // Array von Expense-IDs
  total_amount: number;
  currency: Currency;
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  approval_chain: ApprovalStep[];
}

export interface ExpenseSummary {
  totalExpenses: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  currency: Currency;
}

export interface ExpensePolicy {
  id: string;
  name: string;
  description: string;
  rules: ExpensePolicyRule[];
  applicable_to: {
    departments?: string[];
    roles?: string[];
    countries?: string[];
    all: boolean;
  };
  is_active: boolean;
}

export interface ExpensePolicyRule {
  id: string;
  policy_id: string;
  category?: ExpenseCategory;
  max_amount?: number;
  currency?: Currency;
  requires_receipt_threshold?: number;
  requires_approval_threshold?: number;
  approval_roles?: string[];
}
