
-- Erstelle Tabellen für das Budget & Forecast Modul

-- Budget Templates Tabelle
CREATE TABLE public.budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('yearly', 'monthly', 'department', 'project', 'personnel', 'training', 'travel', 'forecast')),
  budget_categories JSONB NOT NULL DEFAULT '[]',
  default_values JSONB DEFAULT '{}',
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget Plans Tabelle (erweitert)
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.budget_templates(id);
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]';
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected'));
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.budget_plans ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Budget Forecasts Tabelle
CREATE TABLE public.budget_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  forecast_period_start DATE NOT NULL,
  forecast_period_end DATE NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('best_case', 'normal', 'worst_case')),
  predicted_amount NUMERIC NOT NULL,
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 100),
  ai_factors JSONB DEFAULT '{}',
  manual_adjustments JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget Actuals Tabelle (Ist-Ausgaben)
CREATE TABLE public.budget_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  actual_date DATE NOT NULL,
  actual_amount NUMERIC NOT NULL,
  source_module TEXT, -- 'expenses', 'payroll', 'projects', etc.
  source_reference_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget Approvals Tabelle
CREATE TABLE public.budget_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget Alerts Tabelle
CREATE TABLE public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('overspend', 'approaching_limit', 'forecast_deviation', 'approval_needed')),
  threshold_percentage NUMERIC,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_for UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Budget Versions Tabelle (für Historie)
CREATE TABLE public.budget_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_versions ENABLE ROW LEVEL SECURITY;

-- Policies für budget_templates
CREATE POLICY "Users can view budget templates" ON public.budget_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage budget templates" ON public.budget_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies für budget_forecasts
CREATE POLICY "Users can view forecasts for accessible budgets" ON public.budget_forecasts
  FOR SELECT USING (
    budget_plan_id IN (
      SELECT id FROM public.budget_plans 
      WHERE created_by = auth.uid() 
      OR assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their forecasts" ON public.budget_forecasts
  FOR ALL USING (
    budget_plan_id IN (
      SELECT id FROM public.budget_plans 
      WHERE created_by = auth.uid()
    )
  );

-- Policies für budget_actuals
CREATE POLICY "Users can view actuals for accessible budgets" ON public.budget_actuals
  FOR SELECT USING (
    budget_plan_id IN (
      SELECT id FROM public.budget_plans 
      WHERE created_by = auth.uid() 
      OR assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "System can insert actuals" ON public.budget_actuals
  FOR INSERT WITH CHECK (true);

-- Policies für budget_approvals
CREATE POLICY "Users can view relevant approvals" ON public.budget_approvals
  FOR SELECT USING (
    approver_id = auth.uid() 
    OR budget_plan_id IN (
      SELECT id FROM public.budget_plans WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage approvals" ON public.budget_approvals
  FOR ALL USING (approver_id = auth.uid());

-- Policies für budget_alerts
CREATE POLICY "Users can view their alerts" ON public.budget_alerts
  FOR SELECT USING (created_for = auth.uid());

CREATE POLICY "System can create alerts" ON public.budget_alerts
  FOR INSERT WITH CHECK (true);

-- Policies für budget_versions
CREATE POLICY "Users can view budget versions" ON public.budget_versions
  FOR SELECT USING (
    budget_plan_id IN (
      SELECT id FROM public.budget_plans 
      WHERE created_by = auth.uid() 
      OR assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Trigger für automatische Version-Erstellung
CREATE OR REPLACE FUNCTION public.create_budget_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.budget_versions (
    budget_plan_id,
    version_number,
    snapshot_data,
    changes_summary,
    created_by
  ) VALUES (
    NEW.id,
    NEW.version,
    to_jsonb(NEW),
    'Budget plan updated',
    auth.uid()
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER budget_version_trigger
  AFTER UPDATE ON public.budget_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.create_budget_version();

-- Trigger für automatische Benachrichtigungen
CREATE OR REPLACE FUNCTION public.check_budget_thresholds()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_actual NUMERIC;
  budget_amount NUMERIC;
  percentage_used NUMERIC;
BEGIN
  -- Berechne aktuelle Ausgaben
  SELECT COALESCE(SUM(actual_amount), 0) INTO total_actual
  FROM public.budget_actuals
  WHERE budget_plan_id = NEW.budget_plan_id;
  
  -- Hole Budgetbetrag
  SELECT amount INTO budget_amount
  FROM public.budget_plans
  WHERE id = NEW.budget_plan_id;
  
  IF budget_amount > 0 THEN
    percentage_used := (total_actual / budget_amount) * 100;
    
    -- Warnung bei 80% Verbrauch
    IF percentage_used >= 80 AND percentage_used < 100 THEN
      INSERT INTO public.budget_alerts (
        budget_plan_id,
        alert_type,
        threshold_percentage,
        message,
        created_for
      )
      SELECT 
        NEW.budget_plan_id,
        'approaching_limit',
        percentage_used,
        'Budget zu ' || ROUND(percentage_used, 1) || '% verbraucht',
        bp.created_by
      FROM public.budget_plans bp
      WHERE bp.id = NEW.budget_plan_id
      AND NOT EXISTS (
        SELECT 1 FROM public.budget_alerts 
        WHERE budget_plan_id = NEW.budget_plan_id 
        AND alert_type = 'approaching_limit'
        AND created_at > now() - interval '1 day'
      );
      
    -- Alarm bei Überschreitung
    ELSIF percentage_used >= 100 THEN
      INSERT INTO public.budget_alerts (
        budget_plan_id,
        alert_type,
        threshold_percentage,
        message,
        created_for
      )
      SELECT 
        NEW.budget_plan_id,
        'overspend',
        percentage_used,
        'Budget um ' || ROUND(percentage_used - 100, 1) || '% überschritten!',
        bp.created_by
      FROM public.budget_plans bp
      WHERE bp.id = NEW.budget_plan_id
      AND NOT EXISTS (
        SELECT 1 FROM public.budget_alerts 
        WHERE budget_plan_id = NEW.budget_plan_id 
        AND alert_type = 'overspend'
        AND created_at > now() - interval '1 day'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER budget_threshold_trigger
  AFTER INSERT ON public.budget_actuals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_budget_thresholds();

-- Indizes für bessere Performance
CREATE INDEX idx_budget_forecasts_plan_id ON public.budget_forecasts(budget_plan_id);
CREATE INDEX idx_budget_actuals_plan_id ON public.budget_actuals(budget_plan_id);
CREATE INDEX idx_budget_actuals_date ON public.budget_actuals(actual_date);
CREATE INDEX idx_budget_alerts_user ON public.budget_alerts(created_for);
CREATE INDEX idx_budget_versions_plan_id ON public.budget_versions(budget_plan_id);
