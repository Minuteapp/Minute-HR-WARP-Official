
export interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  employee_id: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'conflict';
  notes?: string;
  type: 'early' | 'late' | 'night';
  requirements: string[];
}

export type PlanningPeriod = 'day' | 'week' | 'month';

export type ShiftRequirementType = 'qualification' | 'employee_count' | 'time_constraint';
