
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  secondNationality?: string;
  gender?: 'male' | 'female' | 'diverse';
  email: string;
  phone: string;
  mobilePhone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface EmploymentInfo {
  position: string;
  department: string;
  team?: string;
  startDate: string;
  workingHours: string;
  vacationDays: string;
  workStartTime: string;
  workEndTime: string;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  taxId: string;
  socialSecurityNumber: string;
  managerId?: string;
  contractEndDate?: string;
  costCenter?: string;
  taxClass?: string;
  healthInsurance?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface EmployeeEditData {
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  emergencyContact: EmergencyContact;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  progress?: number;
  estimated_hours?: number;
  project_name?: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface GoalData {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress?: number;
  deadline?: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CarbonFootprintData {
  id: string;
  date: string;
  source: string;
  emissions_value: number;
  unit: string;
  location?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
