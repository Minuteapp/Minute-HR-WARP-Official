
export interface GlobalMobilityRequest {
  id: string;
  employee_id: string;
  request_type: 'relocation' | 'assignment' | 'transfer' | 'visa_support' | 'remote_work';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  description?: string;
  current_location?: string;
  destination_location?: string;
  start_date?: string;
  end_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  actual_cost?: number;
  business_justification?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalMobilityDocument {
  id: string;
  request_id: string;
  document_type: string;
  document_name: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiry_date?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalMobilityVisaApplication {
  id: string;
  request_id: string;
  visa_type: string;
  country: string;
  application_number?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'expired';
  application_date?: string;
  interview_date?: string;
  decision_date?: string;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalMobilityAssignment {
  id: string;
  request_id: string;
  assignment_type: 'short_term' | 'long_term' | 'permanent' | 'rotational';
  home_country: string;
  host_country: string;
  home_entity?: string;
  host_entity?: string;
  reporting_manager?: string;
  assignment_manager?: string;
  tax_treatment?: string;
  social_security_treatment?: string;
  housing_allowance?: number;
  cost_of_living_adjustment?: number;
  education_allowance?: number;
  other_allowances?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GlobalMobilityCompliance {
  id: string;
  request_id: string;
  compliance_type: string;
  requirement: string;
  status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  due_date?: string;
  completed_date?: string;
  responsible_party?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalMobilityPolicyException {
  id: string;
  request_id: string;
  policy_area: string;
  exception_type: string;
  rationale: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
