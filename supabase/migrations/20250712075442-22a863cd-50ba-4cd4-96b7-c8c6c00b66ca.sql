-- Create integration_settings table for storing API credentials and configuration
CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'outlook', 'payroll', 'sso'
  provider TEXT, -- 'datev', 'personio', 'azure', 'google', etc.
  settings JSONB NOT NULL DEFAULT '{}', -- encrypted settings like API keys, endpoints, etc.
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one integration per type per user
  UNIQUE(user_id, integration_type)
);

-- Enable Row Level Security
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own integration settings" 
ON public.integration_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integration settings" 
ON public.integration_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration settings" 
ON public.integration_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration settings" 
ON public.integration_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_integration_settings_updated_at
    BEFORE UPDATE ON public.integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();