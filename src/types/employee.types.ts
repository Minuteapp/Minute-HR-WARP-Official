
export interface Employee {
  id: string;
  name: string;
  team: string;
  position: string;
  role: string;
  status: 'active' | 'inactive' | 'probation';
  employee_number?: string;
  email?: string;
  department?: string;
  employment_type?: 'full_time' | 'part_time' | 'temporary' | 'freelance' | 'intern';
  archived?: boolean;
  archived_at?: string;
  archived_by?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  nationality?: string;
  gender?: 'male' | 'female' | 'diverse';
  phone?: string;
  mobile_phone?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  location?: string;
  tax_id?: string;
  social_security_number?: string;
  working_hours?: number;
  start_date?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  company_id?: string;
  company_name?: string;
  
  // Zusätzliche Felder für die EmploymentTab-Komponente
  contract_end_date?: string;
  cost_center?: string;
  manager_id?: string;
  vacation_days?: number;
  work_start_time?: string;
  work_end_time?: string;
  lunch_break_start?: string;
  lunch_break_end?: string;
  
  // Zusätzliche Felder für die SalaryTab-Komponente
  salary_amount?: number;
  salary_currency?: string;
  
  // Steuer- und Bankfelder
  tax_class?: string;
  health_insurance?: string;
  iban?: string;
  bic?: string;
  bank_name?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  department: string;
  position: string;
  team: string;
  employmentType: 'full_time' | 'part_time' | 'temporary' | 'freelance' | 'intern';
  startDate: string;
  birthDate?: string;
  nationality?: string;
  phone?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  workingHours?: number;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  // Beschäftigungsdaten
  contractEndDate?: string;
  costCenter?: string;
  managerId?: string;
  vacationDays?: number;
  workStartTime?: string;
  workEndTime?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  taxId?: string;
  socialSecurityNumber?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  bankName?: string;
  onboardingRequired?: boolean;
  companyId?: string;
  // Neue Felder (vorher separate useState)
  iban?: string;
  bic?: string;
  taxClass?: string;
  healthInsurance?: string;
  probationMonths?: number;
  remoteWork?: string;
  location?: string;
  // Organigramm-Felder
  organizationalUnitId?: string;
  organizationalRoleType?: 'manager' | 'member' | 'deputy' | 'assistant' | 'viewer';
}

export interface EmployeeFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  teamFilter: string;
  setTeamFilter: (team: string) => void;
  employmentTypeFilter: string;
  setEmploymentTypeFilter: (type: string) => void;
  onExport: () => void;
  onClearFilters: () => void;
}

// Interface für die Props der DocumentCategories-Komponente
export interface DocumentCategoriesProps {
  employeeId: string;
  documents?: any[];
}

// Interface für die Props der TimeTrackingTab-Komponente
export interface TimeTrackingTabProps {
  employeeId: string;
  timeEntries?: any[];
}

// Interfaces für die ProjectsTab-Komponente
export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  progress: number;
}

export interface ProjectAssignment {
  id: string;
  role: string;
  project_id: string;
  projects: Project;
}
