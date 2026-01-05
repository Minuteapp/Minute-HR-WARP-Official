
export type AbsenceType = 'vacation' | 'special_vacation' | 'sick_leave' | 'homeoffice' | 'parental' | 'other' | 'business_trip';

export type AbsenceSubType = 
  // Urlaub
  | 'regular_vacation' 
  | 'special_vacation' 
  | 'unpaid_vacation'
  // Krankheit
  | 'sick_with_certificate' 
  | 'sick_without_certificate' 
  | 'long_term_sick'
  // Elternzeit
  | 'maternity_protection' 
  | 'parental_leave' 
  | 'caregiver_leave'
  // Sonstige
  | 'educational_leave' 
  | 'sabbatical' 
  | 'quarantine' 
  | 'suspension'
  // Dienstreise (automatisch)
  | 'business_trip';

export type AbsenceStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export interface AbsenceRequest {
  id: string;
  user_id: string;
  employee_name?: string;
  department?: string;
  type: AbsenceType;
  subtype: AbsenceSubType;
  start_date: string;
  end_date: string;
  status: AbsenceStatus;
  reason?: string;
  half_day: boolean;
  start_time?: string;
  end_time?: string;
  substitute_id?: string;
  substitute_name?: string;
  created_by: string; // Wer hat beantragt?
  created_at: string;
  approved_by?: string; // Wer hat genehmigt
  approved_at?: string;
  has_certificate?: boolean; // Nur bei Krankheit – ja/nein
  valid_for_time_tracking: boolean; // Wenn true → Zeiterfassung blockiert
  visible_for?: string[]; // Array von Benutzer-IDs
  company_id?: string | null; // Firma für Multi-Tenancy
}

export interface AbsenceFilter {
  start_date?: Date;
  end_date?: Date;
  status?: AbsenceStatus[];
  types?: AbsenceType[];
  subtypes?: AbsenceSubType[];
  departments?: string[];
  employee_id?: string;
}

// Statistik-Interface für die Übersichtsseite
export interface AbsenceStatistic {
  total_days: number;
  by_type: Record<AbsenceType, number>;
  by_month: { month: string; count: number }[];
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_vacation_days?: number;
  used_vacation_days?: number;
  remaining_vacation_days?: number;
  employees_on_leave_today?: number;
  total_employees?: number;
}

// Interface für Abwesenheitseinstellungen
export interface AbsenceSettings {
  require_approval: boolean;
  allow_self_approval: boolean;
  max_consecutive_days: number;
  notice_period_days: number;
  absence_colors: Record<AbsenceType, string>;
  auto_block_time_tracking: boolean;
  show_in_calendar: boolean;
  require_certificate_after_days: number;
  default_substitute_id?: string;
  notification_recipients: string[];
}
