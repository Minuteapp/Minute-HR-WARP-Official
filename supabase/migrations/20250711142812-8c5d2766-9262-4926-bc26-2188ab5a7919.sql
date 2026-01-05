-- Erstelle travel_requests Tabelle für Reisemanagement
CREATE TABLE IF NOT EXISTS public.travel_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_name TEXT,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER DEFAULT 0
);

-- Erstelle travel_documents Tabelle für Reisedokumente
CREATE TABLE IF NOT EXISTS public.travel_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_request_id UUID REFERENCES travel_requests(id),
  document_name TEXT NOT NULL,
  document_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies für travel_requests
CREATE POLICY "Users can view their own travel requests" 
ON public.travel_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel requests" 
ON public.travel_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel requests" 
ON public.travel_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all travel requests" 
ON public.travel_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

CREATE POLICY "Admins can update all travel requests" 
ON public.travel_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- RLS Policies für travel_documents
CREATE POLICY "Users can view their own travel documents" 
ON public.travel_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM travel_requests 
  WHERE travel_requests.id = travel_documents.travel_request_id 
  AND travel_requests.user_id = auth.uid()
));

CREATE POLICY "Users can create their own travel documents" 
ON public.travel_documents 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM travel_requests 
  WHERE travel_requests.id = travel_documents.travel_request_id 
  AND travel_requests.user_id = auth.uid()
));