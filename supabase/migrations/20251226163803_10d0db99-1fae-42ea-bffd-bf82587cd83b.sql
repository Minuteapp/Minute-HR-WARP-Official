-- Create workflow_definitions table for storing workflow structure
CREATE TABLE public.workflow_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
  module text,
  nodes jsonb DEFAULT '[]',
  edges jsonb DEFAULT '[]',
  execution_count integer DEFAULT 0,
  success_rate numeric DEFAULT 100,
  avg_duration_minutes numeric DEFAULT 0,
  last_execution_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES public.companies(id)
);

-- Create workflow_executions table for tracking workflow runs
CREATE TABLE public.workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.workflow_definitions(id) ON DELETE CASCADE,
  status text DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_minutes numeric,
  error_message text,
  execution_data jsonb DEFAULT '{}',
  company_id uuid REFERENCES public.companies(id)
);

-- Create ai_workflow_suggestions table for AI-generated optimization ideas
CREATE TABLE public.ai_workflow_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  impact text DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'very_high')),
  category text,
  modules text[],
  confidence_percent integer DEFAULT 85,
  time_savings_hours numeric DEFAULT 0,
  estimated_usage_monthly integer DEFAULT 0,
  workflow_id uuid REFERENCES public.workflow_definitions(id) ON DELETE SET NULL,
  is_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES public.companies(id)
);

-- Enable RLS on all tables
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workflow_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_definitions
CREATE POLICY "Users can view workflow definitions" ON public.workflow_definitions
  FOR SELECT USING (true);

CREATE POLICY "Users can create workflow definitions" ON public.workflow_definitions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update workflow definitions" ON public.workflow_definitions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete workflow definitions" ON public.workflow_definitions
  FOR DELETE USING (true);

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view workflow executions" ON public.workflow_executions
  FOR SELECT USING (true);

CREATE POLICY "Users can create workflow executions" ON public.workflow_executions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update workflow executions" ON public.workflow_executions
  FOR UPDATE USING (true);

-- RLS Policies for ai_workflow_suggestions
CREATE POLICY "Users can view ai workflow suggestions" ON public.ai_workflow_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Users can create ai workflow suggestions" ON public.ai_workflow_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update ai workflow suggestions" ON public.ai_workflow_suggestions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete ai workflow suggestions" ON public.ai_workflow_suggestions
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_workflow_definitions_status ON public.workflow_definitions(status);
CREATE INDEX idx_workflow_definitions_module ON public.workflow_definitions(module);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_ai_workflow_suggestions_impact ON public.ai_workflow_suggestions(impact);

-- Create trigger for updated_at
CREATE TRIGGER update_workflow_definitions_updated_at
  BEFORE UPDATE ON public.workflow_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();