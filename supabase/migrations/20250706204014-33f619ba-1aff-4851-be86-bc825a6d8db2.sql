-- Business Travel Management System
-- Tabellen für Geschäftsreisen, Genehmigungen und Analytics

-- Business Travel Requests Table
CREATE TABLE public.business_travel_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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