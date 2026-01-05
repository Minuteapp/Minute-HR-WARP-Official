export interface LocationTrackingSettings {
  id: string;
  company_id?: string;
  location_tracking_enabled: boolean;
  geofencing_enabled: boolean;
  allowed_locations: GeofenceLocation[];
  location_accuracy_meters: number;
  require_location_for_clock_in: boolean;
  require_location_for_clock_out: boolean;
  qr_code_enabled: boolean;
  employee_id_enabled: boolean;
  offline_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address?: string;
  is_active: boolean;
  qr_code?: string;
  wifi_networks?: string[];
  created_at: string;
}

export interface LocationClockEntry {
  id: string;
  time_entry_id: string;
  employee_id: string;
  location_type: 'gps' | 'qr_code' | 'employee_id' | 'wifi';
  latitude?: number;
  longitude?: number;
  address?: string;
  accuracy_meters?: number;
  geofence_location_id?: string;
  qr_code_scanned?: string;
  employee_id_entered?: string;
  wifi_network?: string;
  verification_status: 'verified' | 'suspicious' | 'failed';
  verification_notes?: string;
  created_at: string;
}

export interface TimeCategory {
  id: string;
  company_id?: string;
  name: string;
  code: string;
  color: string;
  icon?: string;
  is_billable: boolean;
  is_overtime: boolean;
  overtime_multiplier?: number;
  compensation_type: 'time_off' | 'payment' | 'both';
  hourly_rate?: number;
  time_off_ratio?: number; // z.B. 1.5 für 1,5 Stunden Freizeit pro Stunde
  requires_approval: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreakType {
  id: string;
  company_id?: string;
  name: string;
  type: 'fixed' | 'semi_flexible' | 'flexible';
  duration_minutes: number;
  min_duration_minutes?: number;
  max_duration_minutes?: number;
  is_paid: boolean;
  is_mandatory: boolean;
  after_work_hours: number; // Nach wie vielen Stunden Arbeit die Pause erforderlich ist
  auto_deduct: boolean; // Automatisch von Arbeitszeit abziehen
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingPolicy {
  id: string;
  company_id?: string;
  name: string;
  description?: string;
  location_settings: LocationTrackingSettings;
  allowed_categories: string[]; // Time category IDs
  break_rules: string[]; // Break type IDs
  overtime_rules: {
    daily_limit_hours: number;
    weekly_limit_hours: number;
    auto_approval_limit_hours: number;
    requires_manager_approval: boolean;
  };
  geofencing_rules: {
    strict_mode: boolean; // Muss innerhalb Geofence sein
    warning_distance_meters: number;
    auto_clock_out_outside_fence: boolean;
  };
  applies_to: {
    departments?: string[];
    teams?: string[];
    employees?: string[];
    employment_types?: string[];
  };
  is_active: boolean;
  priority: number; // Höhere Nummer = höhere Priorität bei Konflikten
  created_at: string;
  updated_at: string;
}

export interface AttendanceOverview {
  employee_id: string;
  employee_name: string;
  department?: string;
  current_status: 'clocked_in' | 'clocked_out' | 'on_break' | 'absent';
  current_location?: {
    latitude: number;
    longitude: number;
    address?: string;
    geofence_name?: string;
  };
  clock_in_time?: string;
  break_start_time?: string;
  total_hours_today: number;
  overtime_hours_today: number;
  break_minutes_taken: number;
  last_activity: string;
  policy_violations?: {
    type: 'location' | 'overtime' | 'break' | 'time_category';
    message: string;
    severity: 'warning' | 'error';
  }[];
}

export interface AnnualWorkTimeBalance {
  employee_id: string;
  year: number;
  contract_hours_per_year: number;
  worked_hours_total: number;
  overtime_hours_total: number;
  time_off_hours_taken: number;
  time_off_hours_earned: number;
  sick_hours_total: number;
  vacation_hours_total: number;
  balance_hours: number; // Plusstunden/Minusstunden
  projected_year_end_balance: number;
  last_calculated: string;
}