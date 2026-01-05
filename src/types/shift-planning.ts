
export interface ShiftType {
  id: string;
  name: string;
  color: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  required_staff: number;
  description?: string;
  min_employees?: number;
  max_employees?: number;
}

export interface Employee {
  id: string;
  name: string;
  qualifications: string[];
  preferredShifts: string[];
  availableHours: { start: string; end: string };
  department: string;
  position?: string;
  skills?: string[];
  availability?: any;
  preferences?: any;
}

export interface Shift {
  id: string;
  type: string;
  date: string;
  employeeId: string;
  status?: 'scheduled' | 'confirmed' | 'conflict';
  requirements: string[];
  employeeName?: string;
  department?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

export interface ShiftPattern {
  id: string;
  name: string;
  pattern: string[][];
  cycleLength: number;
}

export interface ShiftPreference {
  employeeId: string;
  preferredShifts: string[];
  preferredDays: number[];
  blackoutDates: string[];
}

export type TimeRange = 'next_14_days' | 'this_week' | 'this_month' | 'custom';

export interface ShiftSwapRequest {
  id: string;
  requester: {
    id: string;
    first_name: string;
    last_name: string;
  };
  target_employee_id: string;
  shift: Shift;
  status: 'pending' | 'accepted' | 'rejected';
  priority: 'hoch' | 'mittel' | 'niedrig';
  message?: string;
  created_at: string;
  responded_at?: string;
}

export interface ShiftStatistics {
  totalShifts: number;
  averageShiftLength: number;
  weekendShifts: number;
  maxWeekendShifts: number;
  reliabilityScore: number;
  reliabilityLabel: string;
  currentMonth: string;
}

export interface ShiftTypeDistribution {
  shiftType: ShiftType;
  count: number;
  percentage: number;
}
