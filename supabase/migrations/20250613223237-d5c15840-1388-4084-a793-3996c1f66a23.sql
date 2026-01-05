
-- HR Surveys Tabelle
CREATE TABLE public.hr_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  survey_type TEXT NOT NULL DEFAULT 'general' CHECK (survey_type IN ('general', 'satisfaction', 'feedback', 'evaluation')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '[]'::jsonb,
  anonymous BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Survey Responses Tabelle
CREATE TABLE public.hr_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES hr_surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_anonymous BOOLEAN DEFAULT true
);

-- HR Training Courses Tabelle
CREATE TABLE public.hr_training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT DEFAULT 'general',
  content JSONB DEFAULT '{}'::jsonb,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Dynamic Roles Tabelle
CREATE TABLE public.hr_dynamic_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permission_level INTEGER NOT NULL DEFAULT 1,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Fleet Vehicles Tabelle
CREATE TABLE public.hr_fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  vin TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  assigned_to UUID REFERENCES auth.users(id),
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'gasoline',
  insurance_expires DATE,
  last_service DATE,
  next_service_due DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies aktivieren
ALTER TABLE public.hr_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_dynamic_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_fleet_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies für hr_surveys
CREATE POLICY "Users can view all surveys" ON public.hr_surveys FOR SELECT USING (true);
CREATE POLICY "Admins can manage surveys" ON public.hr_surveys FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- RLS Policies für hr_survey_responses
CREATE POLICY "Users can view their own responses" ON public.hr_survey_responses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own responses" ON public.hr_survey_responses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all responses" ON public.hr_survey_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- RLS Policies für hr_training_courses
CREATE POLICY "Users can view all courses" ON public.hr_training_courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.hr_training_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- RLS Policies für hr_dynamic_roles
CREATE POLICY "Users can view all roles" ON public.hr_dynamic_roles FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage roles" ON public.hr_dynamic_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
);

-- RLS Policies für hr_fleet_vehicles
CREATE POLICY "Users can view all vehicles" ON public.hr_fleet_vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON public.hr_fleet_vehicles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hr_surveys_updated_at BEFORE UPDATE ON hr_surveys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hr_training_courses_updated_at BEFORE UPDATE ON hr_training_courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hr_dynamic_roles_updated_at BEFORE UPDATE ON hr_dynamic_roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hr_fleet_vehicles_updated_at BEFORE UPDATE ON hr_fleet_vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
