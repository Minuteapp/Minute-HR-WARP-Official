
export type CompanyData = {
  company_id: string;
  company_name: string | null;
  employee_count: number | null;
  subscription_status: 'free' | 'basic' | 'premium' | 'enterprise' | null;
  is_active?: boolean;
  slug?: string | null;
}

export type CompanyFormData = {
  name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  tax_id: string;
  vat_id: string;
  contact_person: string;
  subscription_status: 'free' | 'basic' | 'premium' | 'enterprise';
  // Neue erweiterte Felder
  logo_url?: string;
  founding_date?: string;
  company_size: 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  description?: string;
  annual_revenue?: number;
  currency: string;
  legal_form?: string;
  commercial_register?: string;
  bank_name?: string;
  iban?: string;
  bic?: string;
  primary_contact_name?: string;
  primary_contact_title?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  technical_contact_name?: string;
  technical_contact_email?: string;
  notes?: string;
  onboarding_status: 'pending' | 'in_progress' | 'completed' | 'paused';
  license_expires_at?: string;
  max_users: number;
  max_storage_gb: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  contract_start_date?: string;
  contract_end_date?: string;
  auto_renewal: boolean;
}

export type CompanyDetails = {
  id: string;
  name: string;
  address: string | null;
  tax_id: string | null;
  vat_id: string | null;
  contact_person: string | null;
  billing_email: string | null;
  phone: string | null;
  website: string | null;
  employee_count: number;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Erweiterte Felder
  logo_url?: string;
  founding_date?: string;
  company_size?: string;
  industry?: string;
  description?: string;
  annual_revenue?: number;
  currency?: string;
  legal_form?: string;
  commercial_register?: string;
  bank_name?: string;
  iban?: string;
  bic?: string;
  primary_contact_name?: string;
  primary_contact_title?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  technical_contact_name?: string;
  technical_contact_email?: string;
  notes?: string;
  onboarding_status?: string;
  license_expires_at?: string;
  max_users?: number;
  max_storage_gb?: number;
  enabled_modules?: string[];
  custom_features?: Record<string, any>;
  billing_cycle?: string;
  last_login_at?: string;
  last_payment_at?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  auto_renewal?: boolean;
  admins?: CompanyAdmin[];
  moduleAssignments?: CompanyModuleAssignment[];
  employees?: CompanyEmployee[];
  // Zusätzliche Felder für Detailansicht
  domain?: string;
  subscription_tier?: string;
  monthly_revenue?: number;
  next_billing_date?: string;
  timezone?: string;
  storage_used?: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  companyAdmins?: CompanyAdmin[];
}

export type CompanyAdmin = {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  phone?: string;
  position?: string;
  salutation?: string;
  status: string;
  role?: string;
  invitation_sent_at?: string;
  created_at: string;
}

export interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  salutation: 'Herr' | 'Frau' | 'Divers';
  first_name: string;
  last_name: string;
  position: string;
  password: string;
  createDirectly: boolean;
}

export type CompanyModule = {
  id: string;
  module_key: string;
  module_name: string;
  display_name: string;
  description?: string;
  base_price: number;
  price_per_user: number;
  is_core_module: boolean;
  category: string;
  icon?: string;
  requires_modules?: string[];
}

export type CompanyModuleAssignment = {
  id: string;
  company_id: string;
  module_key: string;
  is_enabled: boolean;
  custom_price?: number;
  enabled_at: string;
  enabled_by?: string;
  notes?: string;
  module?: CompanyModule;
}

export type CompanyEmployee = {
  id: string;
  company_id: string;
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  department?: string;
  employee_number?: string;
  is_active: boolean;
  invited_at: string;
  invited_by?: string;
  activated_at?: string;
  last_login_at?: string;
  password_reset_required: boolean;
  notes?: string;
}

export type LicenseHistory = {
  id: string;
  company_id: string;
  action_type: string;
  module_key?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  performed_by?: string;
  performed_at: string;
  notes?: string;
}
