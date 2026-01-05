
export interface BusinessTrip {
  id: string;
  employee_id?: string;
  employee_name: string;
  department?: string;
  supervisor?: string;
  purpose: string;
  purpose_type: 'customer_meeting' | 'conference' | 'training' | 'other';
  start_date: string;
  end_date: string;
  destination: string;
  destination_address?: string;
  transport: 'car' | 'train' | 'plane' | 'other';
  hotel_required: boolean;
  hotel_details?: string;
  cost_coverage: boolean;
  cost_center?: string;
  advance_payment?: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approver_id?: string;
  report_submitted_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  budget_id?: string;
  project_id?: string;
}

export interface FlightDetails {
  id: string;
  business_trip_id?: string;
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
  is_return_flight: boolean;
  created_at: string;
  updated_at: string;
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

export interface Expense {
  id: string;
  business_trip_id?: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  expense_date: string;
  notes?: string;
  receipt_path?: string;
  receipt_file_name?: string;
  approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface BusinessTripReport {
  id: string;
  business_trip_id?: string;
  content: string;
  success_rating?: number;
  feedback?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface BudgetPlan {
  id: string;
  name: string;
  type: string;
  amount: number;
  currency: string;
  assigned_to: string;
  assigned_to_name: string;
  start_date: string;
  end_date: string;
  status: string;
  used_amount: number;
  reserved_amount: number;
  remaining_amount: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TripFormData {
  employee_id?: string;
  employee_name: string;
  department?: string;
  supervisor?: string;
  purpose: string;
  purpose_type: 'customer_meeting' | 'conference' | 'training' | 'other';
  start_date: string;
  end_date: string;
  destination: string;
  destination_address?: string;
  transport: 'car' | 'train' | 'plane' | 'other';
  hotel_required: boolean;
  hotel_details?: string;
  cost_coverage: boolean;
  cost_center?: string;
  advance_payment?: number;
  notes?: string;
}

export interface ExpenseFormData {
  description: string;
  category: string;
  amount: number;
  currency: string;
  expense_date: string;
  notes?: string;
}

export interface ReportFormData {
  content: string;
  success_rating?: number;
  feedback?: string;
}
