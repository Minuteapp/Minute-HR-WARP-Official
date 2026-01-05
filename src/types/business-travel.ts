
export type BusinessTripStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type TransportType = 'car' | 'train' | 'plane' | 'public_transport' | 'taxi' | 'rental_car';
export type PurposeType = 'customer_meeting' | 'trade_fair' | 'training' | 'internal_meeting' | 'other';

export interface BusinessTrip {
  id: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
  employee_name: string;
  department: string;
  supervisor: string;
  purpose: string;
  purpose_type: PurposeType;
  start_date: string;
  end_date: string;
  destination: string;
  destination_address?: string;
  transport: TransportType;
  hotel_required: boolean;
  hotel_details?: string;
  cost_coverage: boolean;
  cost_center?: string;
  budget_id?: string;
  project_id?: string;
  advance_payment?: number;
  estimated_cost?: number;
  actual_cost?: number;
  status: BusinessTripStatus;
  approver_id?: string;
  approved_at?: string;
  notes?: string;
  report?: string;
  report_submitted_at?: string;
  flight_details?: FlightDetails[];
}

export interface Expense {
  id: string;
  created_at: string;
  business_trip_id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  receipt_path?: string;
  receipt_file_name?: string;
  expense_date: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  budget_id?: string;
  project_id?: string;
  cost_center?: string;
}

export interface BusinessTripReport {
  id: string;
  business_trip_id: string;
  created_at: string;
  updated_at: string;
  content: string;
  success_rating: number;
  feedback: string;
  attachments?: string[];
}

export interface TravelAiSuggestion {
  id: string;
  business_trip_id?: string;
  suggestion_type: 'hotel' | 'flight' | 'transport' | 'restaurant' | 'activity';
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  provider?: string;
  rating?: number;
  url?: string;
  metadata?: Record<string, any>;
  is_accepted: boolean;
  created_at: string;
}

export type TripType = 'domestic' | 'europe' | 'international';
export type Priority = 'low' | 'normal' | 'high';

export interface WizardExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  receipt_file?: File;
}

export interface TripFormData {
  purpose: string;
  purpose_type: PurposeType;
  start_date: string;
  end_date: string;
  destination: string;
  destination_address?: string;
  transport: TransportType;
  hotel_required: boolean;
  hotel_details?: string;
  cost_coverage: boolean;
  cost_center?: string;
  budget_id?: string;
  project_id?: string;
  estimated_cost?: number;
  advance_payment?: number;
  notes?: string;
  employee_name: string;
  employee_id: string;
  department: string;
  supervisor: string;
  fellow_travelers?: string[];
  flight_details?: FlightDetails[];
  // Neue Felder für Wizard
  title?: string;
  trip_type?: TripType;
  priority?: Priority;
  advance_requested?: boolean;
  selected_employee_id?: string;
  wizard_expenses?: WizardExpense[];
}

export interface ExpenseFormData {
  description: string;
  category: string;
  amount: number;
  currency: string;
  expense_date: string;
  notes?: string;
  budget_id?: string;
  project_id?: string;
  cost_center?: string;
}

export interface ReportFormData {
  content: string;
  success_rating: number;
  feedback: string;
}

// Budget-bezogene Schnittstellen
export interface BudgetPlan {
  id: string;
  name: string;
  type: 'department' | 'project' | 'team' | 'cost_center';
  assigned_to: string; // Department, Projekt, Team oder Kostenstelle ID
  assigned_to_name: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  used_amount: number;
  reserved_amount: number; // Bereits genehmigte, aber noch nicht abgerechnete Reisen
  remaining_amount: number;
  created_by: string;
}

// Flug-Tracking-Schnittstellen
export interface FlightDetails {
  id: string;
  business_trip_id: string;
  flight_number: string;
  airline: string;
  departure_airport: string;
  departure_time: string;
  arrival_airport: string;
  arrival_time: string;
  status: 'scheduled' | 'delayed' | 'in_air' | 'landed' | 'cancelled';
  delay_minutes?: number;
  terminal?: string;
  gate?: string;
  created_at: string;
  updated_at: string;
  is_return_flight: boolean;
}

// Self-Service-Assistant Schnittstellen
export interface AssistantStepData {
  destination?: string;
  destination_address?: string;
  purpose?: string;
  purpose_type?: PurposeType;
  transport?: TransportType;
  start_date?: string;
  end_date?: string;
  hotel_required?: boolean;
  hotel_details?: string;
  fellow_travelers?: string[];
  estimated_cost?: number;
  documents?: File[];
  cost_center?: string;
  project_id?: string;
  budget_id?: string;
}
