-- ============================================
-- PHASE 1: EVENT STORE & EFFECT ENGINE SCHEMA
-- ============================================

-- 1. ZENTRALER EVENT STORE (append-only, immutable)
CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_version INTEGER DEFAULT 1,
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_user_id UUID,
  actor_role TEXT,
  impersonated_by UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  module TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  context JSONB DEFAULT '{}',
  correlation_id UUID,
  causation_id UUID,
  idempotency_key TEXT,
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_events_idempotency 
ON system_events(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_system_events_tenant ON system_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_events_event_name ON system_events(event_name);
CREATE INDEX IF NOT EXISTS idx_system_events_entity ON system_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_events_occurred_at ON system_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_correlation ON system_events(correlation_id) WHERE correlation_id IS NOT NULL;

-- 2. EVENT OUTBOX (garantiert Event-Delivery)
CREATE TABLE IF NOT EXISTS event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES system_events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_event_outbox_status ON event_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_event_outbox_event ON event_outbox(event_id);

-- 3. EFFECT RUNS (Ausführungsprotokoll)
CREATE TABLE IF NOT EXISTS effect_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES system_events(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL,
  effect_category TEXT NOT NULL,
  effect_config JSONB DEFAULT '{}',
  target_type TEXT,
  target_id UUID,
  target_metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'cancelled')),
  execution_mode TEXT DEFAULT 'async' CHECK (execution_mode IN ('sync', 'async')),
  priority TEXT DEFAULT 'P1' CHECK (priority IN ('P0', 'P1', 'P2')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  result JSONB,
  error_message TEXT,
  error_stack TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_effect_runs_idempotency 
ON effect_runs(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_effect_runs_event ON effect_runs(event_id);
CREATE INDEX IF NOT EXISTS idx_effect_runs_status ON effect_runs(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_effect_runs_effect_type ON effect_runs(effect_type);

-- 4. DEAD LETTER QUEUE
CREATE TABLE IF NOT EXISTS effect_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effect_run_id UUID NOT NULL REFERENCES effect_runs(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES system_events(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  error_details JSONB NOT NULL,
  original_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_type TEXT CHECK (resolution_type IN ('retry', 'skip', 'manual', 'auto_fixed')),
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_effect_dead_letters_unresolved 
ON effect_dead_letters(tenant_id, created_at DESC) WHERE resolved_at IS NULL;

-- 5. ACTION REGISTRY (alle möglichen Aktionen)
CREATE TABLE IF NOT EXISTS action_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_name TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT,
  description_de TEXT,
  triggerable_by_roles TEXT[] DEFAULT ARRAY['superadmin', 'admin', 'hr', 'manager', 'employee'],
  event_schema JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  requires_tenant BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_registry_module ON action_registry(module);
CREATE INDEX IF NOT EXISTS idx_action_registry_active ON action_registry(is_active);

-- 6. EFFECT TYPES (Definiert alle möglichen Effekt-Typen)
CREATE TABLE IF NOT EXISTS effect_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effect_type TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ui', 'notification', 'task', 'workflow', 'analytics', 'compliance', 'integration', 'access', 'ai', 'cache')),
  description TEXT,
  description_de TEXT,
  handler_function TEXT,
  config_schema JSONB DEFAULT '{}',
  supports_rollback BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. IMPACT MATRIX (Aktion → Effekte Mapping)
CREATE TABLE IF NOT EXISTS impact_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_name TEXT NOT NULL REFERENCES action_registry(action_name) ON DELETE CASCADE,
  effect_type TEXT NOT NULL REFERENCES effect_types(effect_type) ON DELETE CASCADE,
  effect_category TEXT NOT NULL,
  target_resolution_rule JSONB NOT NULL DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'P1' CHECK (priority IN ('P0', 'P1', 'P2')),
  execution_mode TEXT DEFAULT 'async' CHECK (execution_mode IN ('sync', 'async')),
  retry_policy JSONB DEFAULT '{"max_attempts": 3, "backoff": "exponential", "initial_delay_ms": 1000}',
  failure_handling TEXT DEFAULT 'retry' CHECK (failure_handling IN ('retry', 'skip', 'escalate', 'dead_letter')),
  is_active BOOLEAN DEFAULT true,
  tests_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(action_name, effect_type)
);

CREATE INDEX IF NOT EXISTS idx_impact_matrix_action ON impact_matrix(action_name);
CREATE INDEX IF NOT EXISTS idx_impact_matrix_active ON impact_matrix(is_active);

-- 8. EFFECT SETTINGS (Tenant/Site/Department/Team Hierarchie)
CREATE TABLE IF NOT EXISTS effect_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  site_id UUID,
  department_id UUID,
  team_id UUID,
  effect_type TEXT NOT NULL REFERENCES effect_types(effect_type) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique index mit NULL-Handling
CREATE UNIQUE INDEX IF NOT EXISTS idx_effect_settings_unique 
ON effect_settings(tenant_id, COALESCE(site_id::text, ''), COALESCE(department_id::text, ''), COALESCE(team_id::text, ''), effect_type);

CREATE INDEX IF NOT EXISTS idx_effect_settings_tenant ON effect_settings(tenant_id);

-- 9. EVENT SUBSCRIPTIONS (Wer bekommt welche Events)
CREATE TABLE IF NOT EXISTS event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscriber_type TEXT NOT NULL CHECK (subscriber_type IN ('user', 'role', 'team', 'department', 'webhook', 'integration')),
  subscriber_id TEXT NOT NULL,
  event_pattern TEXT NOT NULL,
  filter_conditions JSONB DEFAULT '{}',
  delivery_channels TEXT[] DEFAULT ARRAY['in_app'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_subscriptions_tenant ON event_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_pattern ON event_subscriptions(event_pattern);

-- 10. EVENT METRICS (Monitoring)
CREATE TABLE IF NOT EXISTS event_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_name TEXT NOT NULL,
  total_events INTEGER DEFAULT 0,
  successful_effects INTEGER DEFAULT 0,
  failed_effects INTEGER DEFAULT 0,
  avg_processing_time_ms INTEGER,
  p95_processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_date, event_name)
);

CREATE INDEX IF NOT EXISTS idx_event_metrics_lookup ON event_metrics(tenant_id, metric_date DESC);

-- RLS POLICIES
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_dead_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_metrics ENABLE ROW LEVEL SECURITY;

-- System Events: Tenant-isoliert
CREATE POLICY "system_events_tenant_isolation" ON system_events
  FOR ALL USING (
    tenant_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Event Outbox: Nur für Service Role
CREATE POLICY "event_outbox_service_only" ON event_outbox
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
  );

-- Effect Runs: Tenant-isoliert über Event
CREATE POLICY "effect_runs_tenant_isolation" ON effect_runs
  FOR ALL USING (
    event_id IN (
      SELECT id FROM system_events WHERE tenant_id IN (
        SELECT company_id FROM user_roles WHERE user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Dead Letters: Tenant-isoliert
CREATE POLICY "effect_dead_letters_tenant_isolation" ON effect_dead_letters
  FOR ALL USING (
    tenant_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Action Registry: Lesezugriff für alle authentifizierten User
CREATE POLICY "action_registry_read" ON action_registry
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "action_registry_write" ON action_registry
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
  );

-- Effect Types: Lesezugriff für alle authentifizierten User
CREATE POLICY "effect_types_read" ON effect_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "effect_types_write" ON effect_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
  );

-- Impact Matrix: Lesezugriff für alle authentifizierten User
CREATE POLICY "impact_matrix_read" ON impact_matrix
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "impact_matrix_write" ON impact_matrix
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
  );

-- Effect Settings: Tenant-isoliert
CREATE POLICY "effect_settings_tenant_isolation" ON effect_settings
  FOR ALL USING (
    tenant_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Event Subscriptions: Tenant-isoliert
CREATE POLICY "event_subscriptions_tenant_isolation" ON event_subscriptions
  FOR ALL USING (
    tenant_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Event Metrics: Tenant-isoliert
CREATE POLICY "event_metrics_tenant_isolation" ON event_metrics
  FOR ALL USING (
    tenant_id IN (
      SELECT company_id FROM user_roles WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- TRIGGER: Auto-Update für updated_at
CREATE OR REPLACE FUNCTION update_event_system_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_registry_updated_at
  BEFORE UPDATE ON action_registry
  FOR EACH ROW EXECUTE FUNCTION update_event_system_updated_at();

CREATE TRIGGER update_impact_matrix_updated_at
  BEFORE UPDATE ON impact_matrix
  FOR EACH ROW EXECUTE FUNCTION update_event_system_updated_at();

CREATE TRIGGER update_effect_settings_updated_at
  BEFORE UPDATE ON effect_settings
  FOR EACH ROW EXECUTE FUNCTION update_event_system_updated_at();

CREATE TRIGGER update_event_subscriptions_updated_at
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_event_system_updated_at();

-- TRIGGER: Automatisches Outbox-Entry bei Event-Erstellung
CREATE OR REPLACE FUNCTION auto_create_outbox_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO event_outbox (event_id, status, next_retry_at)
  VALUES (NEW.id, 'pending', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_events_auto_outbox
  AFTER INSERT ON system_events
  FOR EACH ROW EXECUTE FUNCTION auto_create_outbox_entry();