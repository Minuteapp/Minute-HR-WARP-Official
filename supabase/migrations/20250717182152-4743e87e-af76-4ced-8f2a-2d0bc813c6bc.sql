-- Fix infinite recursion in ki_test_features RLS policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can manage KI features" ON public.ki_test_features;
DROP POLICY IF EXISTS "Users can view KI features" ON public.ki_test_features;

-- Create safe, non-recursive policies
CREATE POLICY "ki_test_features_select" ON public.ki_test_features
FOR SELECT USING (true);

CREATE POLICY "ki_test_features_manage" ON public.ki_test_features
FOR ALL USING (
  is_superadmin_safe(auth.uid()) 
  OR is_admin_safe(auth.uid())
);

-- Also check if we need to create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ki_test_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  feature_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  feedback_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE public.ki_test_features ENABLE ROW LEVEL SECURITY;