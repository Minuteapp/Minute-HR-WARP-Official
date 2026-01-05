-- Create missing training_sessions table
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  trainer_id UUID,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  training_type TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for training_sessions
CREATE POLICY "Users can view training sessions"
ON public.training_sessions
FOR SELECT
USING (true);

CREATE POLICY "Users can create training sessions"
ON public.training_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = trainer_id);

CREATE POLICY "Trainers and admins can update sessions"
ON public.training_sessions
FOR UPDATE
USING (
  auth.uid() = trainer_id 
  OR auth.uid() = user_id 
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Create missing personal_goals table
CREATE TABLE IF NOT EXISTS public.personal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  milestones JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for personal_goals
CREATE POLICY "Users can manage their own goals"
ON public.personal_goals
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals"
ON public.personal_goals
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Create update triggers for both tables
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_goals_updated_at
  BEFORE UPDATE ON public.personal_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_training_sessions_user_id ON public.training_sessions(user_id);
CREATE INDEX idx_training_sessions_date ON public.training_sessions(session_date);
CREATE INDEX idx_personal_goals_user_id ON public.personal_goals(user_id);
CREATE INDEX idx_personal_goals_status ON public.personal_goals(status);