
export type EmploymentType = 'full_time' | 'part_time' | 'temporary' | 'freelance' | 'intern' | '';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  department: string;
  position: string;
  team: string;
  employmentType: EmploymentType;
  startDate: string;
}
