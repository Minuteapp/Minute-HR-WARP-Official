
export interface Payslip {
  id: string;
  user_id?: string;
  year: number;
  month: number;
  status: 'draft' | 'pending' | 'approved' | 'archived' | 'deleted';
  gross_salary: number;
  net_salary: number;
  document_path: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryComponent {
  id: string;
  user_id?: string;
  payslip_id: string;
  component_type: 'base' | 'bonus' | 'overtime' | 'deduction' | 'benefit';
  name: string;
  amount: number;
  currency: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryBenefit {
  id: string;
  user_id?: string;
  benefit_type: string;
  name: string;
  description?: string;
  monetary_value?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  created_at?: string;
  updated_at?: string;
}
