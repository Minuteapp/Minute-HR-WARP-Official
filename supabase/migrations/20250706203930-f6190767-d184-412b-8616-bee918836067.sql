-- Business Travel Management System
-- Tabellen für Geschäftsreisen, Genehmigungen und Analytics

-- Business Travel Requests Table
CREATE TABLE public.business_travel_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_name TEXT,
  department TEXT,
  
  -- Reise Details
  destination TEXT NOT NULL,
  purpose TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  cost_center TEXT,
  
  -- Präferenzen
  flight_preferences JSONB DEFAULT '{}',
  hotel_preferences JSONB DEFAULT '{}',
  car_rental_needed BOOLEAN DEFAULT false,
  
  -- Status & Workflow
  status TEXT DEFAULT 'pending',
  current_approval_step INTEGER DEFAULT 1,
  risk_score NUMERIC DEFAULT 0,
  
  -- Buchungsdetails
  booking_reference TEXT,
  actual_cost NUMERIC DEFAULT 0,
  receipts JSONB DEFAULT '[]',
  
  -- Metadaten
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Foreign Key Constraints
  CONSTRAINT business_travel_user_fk REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Travel Approvals Table
CREATE TABLE public.travel_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_request_id UUID NOT NULL REFERENCES public.business_travel_requests(id) ON DELETE CASCADE,
  approver_id UUID,
  approver_name TEXT,
  approver_role TEXT NOT NULL,
  
  step_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Travel Policies & Workflow Rules
CREATE TABLE public.travel_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Auslöse-Bedingungen
  cost_threshold NUMERIC,
  destination_criteria JSONB DEFAULT '{}',
  department_criteria JSONB DEFAULT '[]',
  
  -- Approval Workflow
  approval_steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Travel Analytics & Reporting
CREATE TABLE public.travel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Kosten-Metriken
  total_cost NUMERIC DEFAULT 0,
  flight_cost NUMERIC DEFAULT 0,
  hotel_cost NUMERIC DEFAULT 0,
  car_rental_cost NUMERIC DEFAULT 0,
  other_cost NUMERIC DEFAULT 0,
  
  -- Trip-Metriken
  total_trips INTEGER DEFAULT 0,
  domestic_trips INTEGER DEFAULT 0,
  international_trips INTEGER DEFAULT 0,
  
  -- Abteilungs-Breakdown
  department_breakdown JSONB DEFAULT '{}',
  destination_breakdown JSONB DEFAULT '{}',
  
  -- Risk & Compliance
  high_risk_trips INTEGER DEFAULT 0,
  compliance_issues INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Travel Map Pins (für Weltkarte)
CREATE TABLE public.travel_map_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_request_id UUID NOT NULL REFERENCES public.business_travel_requests(id) ON DELETE CASCADE,
  
  -- Geolocation
  destination TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  country_code TEXT,
  
  -- Display Info
  employee_name TEXT NOT NULL,
  travel_dates TEXT NOT NULL,
  status TEXT NOT NULL,
  risk_level TEXT DEFAULT 'low',
  
  -- Metadaten
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_map_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policies für business_travel_requests
CREATE POLICY "Users can view their own travel requests"
ON public.business_travel_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel requests"
ON public.business_travel_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
ON public.business_travel_requests
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'draft'));

CREATE POLICY "Admins can view all travel requests"
ON public.business_travel_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update all travel requests"
ON public.business_travel_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_approvals
CREATE POLICY "Users can view approvals for their requests"
ON public.travel_approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_travel_requests 
    WHERE id = travel_request_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approvers can manage their approvals"
ON public.travel_approvals
FOR ALL
USING (approver_id = auth.uid());

CREATE POLICY "Admins can manage all approvals"
ON public.travel_approvals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_policies
CREATE POLICY "Admins can manage travel policies"
ON public.travel_policies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view active travel policies"
ON public.travel_policies
FOR SELECT
USING (is_active = true);

-- RLS Policies für travel_analytics
CREATE POLICY "Admins can view travel analytics"
ON public.travel_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies für travel_map_pins
CREATE POLICY "Admins can view all map pins"
ON public.travel_map_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view pins for their own travels"
ON public.travel_map_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_travel_requests 
    WHERE id = travel_request_id AND user_id = auth.uid()
  )
);

-- Trigger für automatische Erstellung von Map Pins
CREATE OR REPLACE FUNCTION create_travel_map_pin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.travel_map_pins (
      travel_request_id,
      destination,
      employee_name,
      travel_dates,
      status,
      risk_level
    ) VALUES (
      NEW.id,
      NEW.destination,
      COALESCE(NEW.employee_name, 'Unbekannt'),
      NEW.start_date::text || ' - ' || NEW.end_date::text,
      NEW.status,
      CASE 
        WHEN NEW.risk_score > 7 THEN 'high'
        WHEN NEW.risk_score > 4 THEN 'medium'
        ELSE 'low'
      END
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_map_pin_on_approval
  AFTER UPDATE ON public.business_travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_travel_map_pin();

-- Trigger für Updated_at
CREATE OR REPLACE FUNCTION update_travel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_requests_updated_at
  BEFORE UPDATE ON public.business_travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_updated_at();

CREATE TRIGGER update_travel_approvals_updated_at
  BEFORE UPDATE ON public.travel_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_updated_at();

-- Sample Data für Policies
INSERT INTO public.travel_policies (name, description, cost_threshold, approval_steps) VALUES
('Standard Domestic Travel', 'Inlandsreisen bis 1000€', 1000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "hr", "required": false}
]'),
('International Travel', 'Auslandsreisen über 1000€', 1000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "finance", "required": true},
  {"step": 3, "role": "travel_admin", "required": true}
]'),
('High-Cost Travel', 'Reisen über 5000€', 5000, '[
  {"step": 1, "role": "manager", "required": true},
  {"step": 2, "role": "finance", "required": true},
  {"step": 3, "role": "cfo", "required": true}
]');

-- Enable Realtime
ALTER TABLE public.business_travel_requests REPLICA IDENTITY FULL;
ALTER TABLE public.travel_approvals REPLICA IDENTITY FULL;
ALTER TABLE public.travel_map_pins REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_travel_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_map_pins;