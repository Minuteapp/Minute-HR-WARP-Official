
-- Create global_mobility_requests table for tracking all mobility requests
CREATE TABLE public.global_mobility_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('relocation', 'assignment', 'transfer', 'visa_support', 'remote_work')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  current_location VARCHAR(255),
  destination_location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  business_justification TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_mobility_documents table for document management
CREATE TABLE public.global_mobility_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  expiry_date DATE,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_mobility_visa_applications table
CREATE TABLE public.global_mobility_visa_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  visa_type VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  application_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected', 'expired')),
  application_date DATE,
  interview_date TIMESTAMP WITH TIME ZONE,
  decision_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_mobility_assignments table for detailed assignment tracking
CREATE TABLE public.global_mobility_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('short_term', 'long_term', 'permanent', 'rotational')),
  home_country VARCHAR(100) NOT NULL,
  host_country VARCHAR(100) NOT NULL,
  home_entity VARCHAR(255),
  host_entity VARCHAR(255),
  reporting_manager UUID,
  assignment_manager UUID,
  tax_treatment VARCHAR(100),
  social_security_treatment VARCHAR(100),
  housing_allowance DECIMAL(10,2),
  cost_of_living_adjustment DECIMAL(10,2),
  education_allowance DECIMAL(10,2),
  other_allowances JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_mobility_compliance table for compliance tracking
CREATE TABLE public.global_mobility_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  compliance_type VARCHAR(100) NOT NULL,
  requirement VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  due_date DATE,
  completed_date DATE,
  responsible_party VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_mobility_policy_exceptions table
CREATE TABLE public.global_mobility_policy_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.global_mobility_requests(id) ON DELETE CASCADE,
  policy_area VARCHAR(100) NOT NULL,
  exception_type VARCHAR(100) NOT NULL,
  rationale TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.global_mobility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_policy_exceptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for global_mobility_requests
CREATE POLICY "Users can view mobility requests they are involved in" 
  ON public.global_mobility_requests 
  FOR SELECT 
  USING (
    auth.uid() = employee_id OR 
    auth.uid() = approved_by OR
    EXISTS (
      SELECT 1 FROM public.global_mobility_assignments 
      WHERE request_id = global_mobility_requests.id 
      AND (reporting_manager = auth.uid() OR assignment_manager = auth.uid())
    )
  );

CREATE POLICY "Users can create mobility requests for themselves" 
  ON public.global_mobility_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update their own requests or managers can update assigned requests" 
  ON public.global_mobility_requests 
  FOR UPDATE 
  USING (
    auth.uid() = employee_id OR 
    auth.uid() = approved_by OR
    EXISTS (
      SELECT 1 FROM public.global_mobility_assignments 
      WHERE request_id = global_mobility_requests.id 
      AND (reporting_manager = auth.uid() OR assignment_manager = auth.uid())
    )
  );

-- Create RLS policies for documents
CREATE POLICY "Users can view documents for requests they have access to" 
  ON public.global_mobility_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.global_mobility_assignments gma
          WHERE gma.request_id = gmr.id 
          AND (gma.reporting_manager = auth.uid() OR gma.assignment_manager = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can insert documents for accessible requests" 
  ON public.global_mobility_documents 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.global_mobility_assignments gma
          WHERE gma.request_id = gmr.id 
          AND (gma.reporting_manager = auth.uid() OR gma.assignment_manager = auth.uid())
        )
      )
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view visa applications for accessible requests" 
  ON public.global_mobility_visa_applications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.global_mobility_assignments gma
          WHERE gma.request_id = gmr.id 
          AND (gma.reporting_manager = auth.uid() OR gma.assignment_manager = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can manage assignments for accessible requests" 
  ON public.global_mobility_assignments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        reporting_manager = auth.uid() OR 
        assignment_manager = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage compliance for accessible requests" 
  ON public.global_mobility_compliance 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.global_mobility_assignments gma
          WHERE gma.request_id = gmr.id 
          AND (gma.reporting_manager = auth.uid() OR gma.assignment_manager = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can manage policy exceptions for accessible requests" 
  ON public.global_mobility_policy_exceptions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.global_mobility_requests gmr 
      WHERE gmr.id = request_id 
      AND (
        gmr.employee_id = auth.uid() OR 
        gmr.approved_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.global_mobility_assignments gma
          WHERE gma.request_id = gmr.id 
          AND (gma.reporting_manager = auth.uid() OR gma.assignment_manager = auth.uid())
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_global_mobility_requests_employee_id ON public.global_mobility_requests(employee_id);
CREATE INDEX idx_global_mobility_requests_status ON public.global_mobility_requests(status);
CREATE INDEX idx_global_mobility_requests_type ON public.global_mobility_requests(request_type);
CREATE INDEX idx_global_mobility_documents_request_id ON public.global_mobility_documents(request_id);
CREATE INDEX idx_global_mobility_visa_applications_request_id ON public.global_mobility_visa_applications(request_id);
CREATE INDEX idx_global_mobility_assignments_request_id ON public.global_mobility_assignments(request_id);
CREATE INDEX idx_global_mobility_compliance_request_id ON public.global_mobility_compliance(request_id);
CREATE INDEX idx_global_mobility_policy_exceptions_request_id ON public.global_mobility_policy_exceptions(request_id);
