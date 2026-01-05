-- Nur fehlende Tabellen erstellen (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.hr_fleet_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.hr_fleet_vehicles(id) ON DELETE CASCADE,
  assigned_from DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_until DATE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für hr_fleet_assignments falls nicht existiert
CREATE INDEX IF NOT EXISTS idx_hr_fleet_assignments_employee_id ON public.hr_fleet_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_fleet_assignments_vehicle_id ON public.hr_fleet_assignments(vehicle_id);

-- Channel-Tabellen für Kommunikation erstellen
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- RLS für channels aktivieren
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Basic policies für channels
CREATE POLICY "Public channels are viewable by all authenticated users" 
ON public.channels 
FOR SELECT 
USING (auth.role() = 'authenticated' AND type = 'public');

CREATE POLICY "Users can view their channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (auth.uid() = user_id);