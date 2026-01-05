export interface TripHotel {
  id: string;
  business_trip_id: string;
  hotel_name: string;
  hotel_rating: number | null;
  address: string | null;
  phone: string | null;
  check_in: string | null;
  check_out: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  room_type: string | null;
  nights: number | null;
  booking_reference: string | null;
  meal_plan: string | null;
  company_id: string | null;
  created_at: string;
}

export interface TripMeetingLocation {
  id: string;
  business_trip_id: string;
  location_name: string;
  address: string | null;
  stand_number: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_id: string | null;
  created_at: string;
}

export interface TripAgendaItem {
  id: string;
  business_trip_id: string;
  title: string;
  agenda_date: string;
  agenda_time: string | null;
  location: string | null;
  is_completed: boolean;
  company_id: string | null;
  created_at: string;
  item_type?: string;
  description?: string;
  day_number?: number;
}

export interface TripCost {
  id: string;
  business_trip_id: string;
  category: 'flight' | 'hotel' | 'food' | 'transport' | 'other';
  description: string | null;
  amount: number;
  company_id: string | null;
  created_at: string;
}

export interface TripDocument {
  id: string;
  business_trip_id: string;
  document_name: string;
  document_type: 'travel_request' | 'approval' | 'flight_ticket' | 'hotel_booking' | 'receipt' | 'other';
  file_path: string | null;
  file_size_kb: number | null;
  notes: string | null;
  company_id: string | null;
  created_at: string;
}

export interface TripProject {
  id: string;
  business_trip_id: string;
  project_id: string | null;
  project_name: string;
  company_id: string | null;
  created_at: string;
}

export interface TripTask {
  id: string;
  business_trip_id: string;
  title: string;
  is_completed: boolean;
  company_id: string | null;
  created_at: string;
}

export interface SystemActivityLog {
  id: string;
  activity_type: string;
  activity_message: string;
  department: string | null;
  module: string;
  status_color: string;
  company_id: string | null;
  created_at: string;
}

export interface ExtendedBusinessTrip {
  id: string;
  title: string;
  description: string | null;
  destination: string | null;
  country: string | null;
  city: string | null;
  destination_image_url: string | null;
  start_date: string;
  end_date: string;
  duration_days: number | null;
  status: string;
  budget: number | null;
  total_cost: number | null;
  co2_emission: number | null;
  booking_reference: string | null;
  priority: string | null;
  approval_status: string | null;
  approved_by: string | null;
  trip_number: string | null;
  timezone: string | null;
  employee_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  hotels?: TripHotel[];
  meeting_locations?: TripMeetingLocation[];
  agenda_items?: TripAgendaItem[];
  projects?: TripProject[];
  tasks?: TripTask[];
  flight_details?: FlightDetail[];
  costs?: TripCost[];
  documents?: TripDocument[];
}

export interface FlightDetail {
  id: string;
  business_trip_id: string;
  airline: string | null;
  flight_number: string | null;
  departure_airport: string | null;
  arrival_airport: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  status: string | null;
  flight_class: string | null;
  aircraft_type: string | null;
  duration_minutes: number | null;
  departure_terminal: string | null;
  departure_gate: string | null;
  arrival_terminal: string | null;
  arrival_gate: string | null;
}

export interface AdminDashboardStats {
  totalBudget: number;
  activeEmployees: number;
  departmentsCount: number;
  newRequestsCount: number;
  pendingRequestsCount: number;
}

export interface MyTripsStats {
  totalTrips: number;
  totalBudget: number;
  totalExpenses: number;
  totalCO2: number;
}

export interface DepartmentOverview {
  department: string;
  employeeCount: number;
  activeTrips: number;
  budget: number;
  spent: number;
}
