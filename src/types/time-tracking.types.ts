
export interface TimeEntry {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  project?: string;
  location?: string;
  break_minutes?: number;
  note?: string;
  department?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  projects?: string[];
  locations?: string[];
  status?: ('active' | 'pending' | 'completed' | 'cancelled')[];
  searchQuery?: string;
}
