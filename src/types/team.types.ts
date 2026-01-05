export interface TeamMember {
  id: string;
  name: string;
  employeeNumber: string;
  department: string;
  location: string;
  vacationDays: number;
  sickDays: number;
  homeofficeDays: number;
  remainingVacation: number;
  status: 'available' | 'absent' | 'pending';
  currentAbsence?: {
    type: string;
    startDate: Date;
    endDate: Date;
  };
  avatar?: string;
}

export interface TeamFilters {
  departments: string[];
  statuses: string[];
  locations: string[];
}

export type GroupByOption = 'none' | 'department' | 'status';
export type SortByOption = 'name' | 'vacation' | 'sick';
export type ViewMode = 'list' | 'grid' | 'calendar';
