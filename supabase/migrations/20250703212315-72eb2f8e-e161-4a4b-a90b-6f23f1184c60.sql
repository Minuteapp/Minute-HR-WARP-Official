-- ========================================
-- RLS POLICIES FÜR ENTERPRISE TABELLEN
-- ========================================

-- Budget Details
ALTER TABLE public.project_budget_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget details for their projects" ON public.project_budget_details
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage budget details for their projects" ON public.project_budget_details
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Objectives
ALTER TABLE public.project_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view objectives for their projects" ON public.project_objectives
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage objectives for their projects" ON public.project_objectives
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Key Results  
ALTER TABLE public.project_key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view key results for their objectives" ON public.project_key_results
  FOR SELECT USING (
    objective_id IN (
      SELECT po.id FROM public.project_objectives po
      JOIN public.projects p ON p.id = po.project_id
      WHERE p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage key results for their objectives" ON public.project_key_results
  FOR ALL USING (
    objective_id IN (
      SELECT po.id FROM public.project_objectives po
      JOIN public.projects p ON p.id = po.project_id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Forecast Files
ALTER TABLE public.project_forecast_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forecast files for their projects" ON public.project_forecast_files
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage forecast files for their projects" ON public.project_forecast_files
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Predictions
ALTER TABLE public.project_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view predictions for their projects" ON public.project_predictions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage predictions for their projects" ON public.project_predictions
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );