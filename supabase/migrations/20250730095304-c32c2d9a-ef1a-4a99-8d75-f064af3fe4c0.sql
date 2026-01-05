-- Create innovation_ideas_inbox table with proper structure
CREATE TABLE IF NOT EXISTS public.innovation_ideas_inbox (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  tags text[] DEFAULT '{}',
  submitter_id uuid NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'rejected', 'moved_to_main')),
  ai_analysis_triggered boolean DEFAULT false,
  ai_analysis_completed boolean DEFAULT false,
  priority_score integer DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  
  -- AI Analysis Results
  ai_innovation_score numeric,
  ai_feasibility_score numeric,
  ai_impact_score numeric,
  ai_risk_score numeric,
  ai_confidence_level numeric,
  ai_recommendation text,
  ai_pros text[],
  ai_cons text[],
  ai_opportunities text[],
  ai_benefits text[],
  ai_analysis_metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.innovation_ideas_inbox ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can view all inbox ideas" 
ON public.innovation_ideas_inbox 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create inbox ideas" 
ON public.innovation_ideas_inbox 
FOR INSERT 
WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can update their own inbox ideas" 
ON public.innovation_ideas_inbox 
FOR UPDATE 
USING (auth.uid() = submitter_id);

CREATE POLICY "Admins can update all inbox ideas" 
ON public.innovation_ideas_inbox 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'superadmin')
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_innovation_ideas_inbox_updated_at
BEFORE UPDATE ON public.innovation_ideas_inbox
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER TABLE public.innovation_ideas_inbox REPLICA IDENTITY FULL;

-- Add table to realtime publication
INSERT INTO supabase_realtime.messages (topic, payload, private)
VALUES ('realtime', json_build_object('table', 'innovation_ideas_inbox'), false)
ON CONFLICT DO NOTHING;

-- Insert some sample data for testing (optional)
INSERT INTO public.innovation_ideas_inbox (
  title, 
  description, 
  category, 
  tags, 
  submitter_id,
  status,
  priority_score
) VALUES 
(
  'KI-basierte Automatisierung für HR-Prozesse',
  'Implementierung einer KI-Lösung zur Automatisierung wiederkehrender HR-Aufgaben wie Bewerbungsfilterung und Onboarding-Prozesse.',
  'Automation',
  ARRAY['KI', 'HR', 'Automatisierung'],
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2',
  'pending',
  85
),
(
  'Mobile App für Mitarbeiter-Feedback',
  'Entwicklung einer mobilen Anwendung für kontinuierliches Mitarbeiter-Feedback und Pulse-Umfragen.',
  'Digital Solutions',
  ARRAY['Mobile', 'Feedback', 'Engagement'],
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2',
  'pending',
  70
),
(
  'Nachhaltiges Bürokonzept',
  'Umstellung auf ein vollständig nachhaltiges Bürokonzept mit erneuerbaren Energien und papierlosen Prozessen.',
  'Sustainability',
  ARRAY['Nachhaltigkeit', 'Umwelt', 'Büro'],
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2',
  'pending',
  60
)
ON CONFLICT (id) DO NOTHING;