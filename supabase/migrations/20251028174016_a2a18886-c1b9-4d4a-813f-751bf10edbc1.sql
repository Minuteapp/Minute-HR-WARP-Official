-- Tabelle für Nachfolgeplanung erstellen
CREATE TABLE IF NOT EXISTS public.org_succession_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organizational_unit_id UUID REFERENCES public.organizational_units(id) ON DELETE CASCADE,
  position_role TEXT NOT NULL,
  current_holder_id UUID,
  successor_candidates JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  time_to_ready INTERVAL,
  business_impact TEXT,
  development_plans JSONB DEFAULT '[]'::jsonb,
  is_key_position BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Tabelle für Organisationsszenarien erstellen
CREATE TABLE IF NOT EXISTS public.org_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'approved', 'archived')) DEFAULT 'draft',
  scenario_data JSONB DEFAULT '{}'::jsonb,
  changes JSONB DEFAULT '[]'::jsonb,
  impact_analysis JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

-- Tabelle für KPI-Metriken erstellen
CREATE TABLE IF NOT EXISTS public.org_kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organizational_unit_id UUID REFERENCES public.organizational_units(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  employee_count INTEGER DEFAULT 0,
  turnover_rate NUMERIC(5,2),
  satisfaction_score NUMERIC(5,2),
  efficiency_score NUMERIC(5,2),
  budget_allocated NUMERIC(15,2),
  budget_used NUMERIC(15,2),
  vacancies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabelle für KI-Analysen erstellen
CREATE TABLE IF NOT EXISTS public.org_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('structure_optimization', 'succession_risk', 'capacity_analysis', 'scenario_impact', 'role_overlap')) NOT NULL,
  target_id UUID,
  insight_data JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_org_succession_plans_tenant ON public.org_succession_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_succession_plans_unit ON public.org_succession_plans(organizational_unit_id);
CREATE INDEX IF NOT EXISTS idx_org_scenarios_tenant ON public.org_scenarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_scenarios_status ON public.org_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_org_kpi_metrics_tenant ON public.org_kpi_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_kpi_metrics_unit ON public.org_kpi_metrics(organizational_unit_id);
CREATE INDEX IF NOT EXISTS idx_org_kpi_metrics_period ON public.org_kpi_metrics(period);
CREATE INDEX IF NOT EXISTS idx_org_ai_insights_tenant ON public.org_ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_ai_insights_type ON public.org_ai_insights(insight_type);

-- RLS aktivieren
ALTER TABLE public.org_succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies für org_succession_plans
CREATE POLICY "Users can view succession plans in their tenant"
  ON public.org_succession_plans FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR and Admin can insert succession plans"
  ON public.org_succession_plans FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

CREATE POLICY "HR and Admin can update succession plans"
  ON public.org_succession_plans FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- RLS Policies für org_scenarios
CREATE POLICY "Users can view scenarios in their tenant"
  ON public.org_scenarios FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR and Admin can manage scenarios"
  ON public.org_scenarios FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- RLS Policies für org_kpi_metrics
CREATE POLICY "Users can view KPI metrics in their tenant"
  ON public.org_kpi_metrics FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "HR and Admin can manage KPI metrics"
  ON public.org_kpi_metrics FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- RLS Policies für org_ai_insights
CREATE POLICY "Users can view AI insights in their tenant"
  ON public.org_ai_insights FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI insights"
  ON public.org_ai_insights FOR INSERT
  WITH CHECK (true);

-- Trigger für updated_at (Funktion existiert bereits, nur Trigger erstellen)
CREATE TRIGGER update_org_succession_plans_updated_at
  BEFORE UPDATE ON public.org_succession_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_scenarios_updated_at
  BEFORE UPDATE ON public.org_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_kpi_metrics_updated_at
  BEFORE UPDATE ON public.org_kpi_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();