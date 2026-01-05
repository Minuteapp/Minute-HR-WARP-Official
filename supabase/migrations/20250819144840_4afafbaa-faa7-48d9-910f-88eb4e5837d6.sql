-- Zentrale Policy-Engine und Regel-System

-- 1. System Policies (Zentrale Regelsammlung)
CREATE TABLE IF NOT EXISTS public.system_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key TEXT NOT NULL UNIQUE, -- z.B. 'mfa_required', 'qr_code_mandatory' 
  policy_category TEXT NOT NULL, -- 'security', 'timetracking', 'absence', 'documents'
  policy_name TEXT NOT NULL,
  policy_description TEXT,
  is_active BOOLEAN DEFAULT true,
  policy_value JSONB NOT NULL DEFAULT '{}', -- Flexible Wertestruktur
  affected_modules TEXT[] DEFAULT '{}', -- Module die von dieser Policy betroffen sind
  required_roles TEXT[] DEFAULT '{}', -- Rollen die diese Policy betrifft
  priority INTEGER DEFAULT 1, -- Für Konfliktlösung
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Policy Conflicts (Erkennung von Widersprüchen)
CREATE TABLE IF NOT EXISTS public.policy_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type TEXT NOT NULL, -- 'contradiction', 'incompatible', 'circular'
  primary_policy_id UUID REFERENCES public.system_policies(id),
  conflicting_policy_id UUID REFERENCES public.system_policies(id),
  conflict_description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  auto_resolution_suggestion JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Policy Enforcement Logs (Auditierbarkeit)
CREATE TABLE IF NOT EXISTS public.policy_enforcement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES public.system_policies(id),
  user_id UUID REFERENCES auth.users(id),
  module_name TEXT NOT NULL,
  action_attempted TEXT NOT NULL,
  enforcement_result TEXT NOT NULL, -- 'allowed', 'blocked', 'conditional'
  enforcement_reason TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Real-time Policy Updates (für Synchronisation)
CREATE TABLE IF NOT EXISTS public.policy_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'policy_created', 'policy_updated', 'policy_deleted'
  policy_id UUID REFERENCES public.system_policies(id),
  affected_users UUID[] DEFAULT '{}',
  affected_modules TEXT[] DEFAULT '{}',
  change_payload JSONB NOT NULL,
  propagation_status TEXT DEFAULT 'pending', -- 'pending', 'propagating', 'completed', 'failed'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. User Policy Overrides (Ausnahmen für einzelne Benutzer)
CREATE TABLE IF NOT EXISTS public.user_policy_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  policy_id UUID REFERENCES public.system_policies(id),
  override_type TEXT NOT NULL, -- 'exempt', 'strict_enforce', 'custom_value'
  override_value JSONB,
  override_reason TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_system_policies_category ON public.system_policies(policy_category);
CREATE INDEX IF NOT EXISTS idx_system_policies_active ON public.system_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_system_policies_company ON public.system_policies(company_id);
CREATE INDEX IF NOT EXISTS idx_policy_enforcement_user ON public.policy_enforcement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_enforcement_module ON public.policy_enforcement_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_policy_sync_status ON public.policy_sync_events(propagation_status);
CREATE INDEX IF NOT EXISTS idx_user_overrides_active ON public.user_policy_overrides(user_id, is_active);

-- Trigger für automatische Aktualisierung
CREATE OR REPLACE FUNCTION update_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_policies_updated_at
  BEFORE UPDATE ON public.system_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_policy_updated_at();

-- Trigger für automatische Sync-Events bei Policy-Änderungen
CREATE OR REPLACE FUNCTION create_policy_sync_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.policy_sync_events (
      event_type, policy_id, affected_modules, change_payload, created_by
    ) VALUES (
      'policy_created', 
      NEW.id, 
      NEW.affected_modules,
      to_jsonb(NEW),
      NEW.created_by
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.policy_sync_events (
      event_type, policy_id, affected_modules, change_payload, created_by
    ) VALUES (
      'policy_updated', 
      NEW.id, 
      NEW.affected_modules,
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      ),
      NEW.created_by
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.policy_sync_events (
      event_type, policy_id, affected_modules, change_payload, created_by
    ) VALUES (
      'policy_deleted', 
      OLD.id, 
      OLD.affected_modules,
      to_jsonb(OLD),
      OLD.created_by
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_policy_sync_events
  AFTER INSERT OR UPDATE OR DELETE ON public.system_policies
  FOR EACH ROW
  EXECUTE FUNCTION create_policy_sync_event();

-- Funktion zur Policy-Durchsetzung (Zentrale Prüfung)
CREATE OR REPLACE FUNCTION check_policy_enforcement(
  p_user_id UUID,
  p_module_name TEXT,
  p_action TEXT,
  p_context JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_policy RECORD;
  v_user_role TEXT;
  v_company_id UUID;
  v_result JSONB := jsonb_build_object('allowed', true, 'policies_applied', '[]'::jsonb);
  v_blocked_policies JSONB := '[]'::jsonb;
BEGIN
  -- User Info holen
  SELECT role INTO v_user_role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
  SELECT company_id INTO v_company_id FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
  
  -- Alle aktiven Policies für diesen Kontext prüfen
  FOR v_policy IN
    SELECT sp.*, upo.override_type, upo.override_value
    FROM public.system_policies sp
    LEFT JOIN public.user_policy_overrides upo ON sp.id = upo.policy_id 
      AND upo.user_id = p_user_id AND upo.is_active = true
    WHERE sp.is_active = true
      AND (sp.company_id = v_company_id OR sp.company_id IS NULL)
      AND (p_module_name = ANY(sp.affected_modules) OR sp.affected_modules = '{}')
      AND (v_user_role = ANY(sp.required_roles) OR sp.required_roles = '{}')
      AND (sp.effective_from IS NULL OR sp.effective_from <= NOW())
      AND (sp.effective_until IS NULL OR sp.effective_until >= NOW())
    ORDER BY sp.priority DESC
  LOOP
    -- User Override prüfen
    IF v_policy.override_type = 'exempt' THEN
      CONTINUE; -- Policy wird übersprungen
    END IF;
    
    -- Policy-spezifische Logik
    CASE v_policy.policy_key
      WHEN 'mfa_required' THEN
        IF NOT COALESCE((p_context->>'mfa_verified')::boolean, false) THEN
          v_blocked_policies := v_blocked_policies || jsonb_build_object(
            'policy', v_policy.policy_key,
            'reason', 'MFA required but not verified'
          );
          v_result := jsonb_set(v_result, '{allowed}', 'false'::jsonb);
        END IF;
        
      WHEN 'qr_code_mandatory' THEN
        IF p_action = 'time_check_in' AND NOT COALESCE((p_context->>'qr_scanned')::boolean, false) THEN
          v_blocked_policies := v_blocked_policies || jsonb_build_object(
            'policy', v_policy.policy_key,
            'reason', 'QR Code scan required for check-in'
          );
          v_result := jsonb_set(v_result, '{allowed}', 'false'::jsonb);
        END IF;
        
      WHEN 'location_verification_required' THEN
        IF NOT COALESCE((p_context->>'location_verified')::boolean, false) THEN
          v_blocked_policies := v_blocked_policies || jsonb_build_object(
            'policy', v_policy.policy_key,
            'reason', 'Location verification required'
          );
          v_result := jsonb_set(v_result, '{allowed}', 'false'::jsonb);
        END IF;
    END CASE;
    
    -- Policy zur angewandten Liste hinzufügen
    v_result := jsonb_set(
      v_result, 
      '{policies_applied}', 
      (v_result->'policies_applied') || jsonb_build_object(
        'policy_key', v_policy.policy_key,
        'policy_name', v_policy.policy_name
      )
    );
  END LOOP;
  
  -- Blocked Policies hinzufügen wenn vorhanden
  IF jsonb_array_length(v_blocked_policies) > 0 THEN
    v_result := jsonb_set(v_result, '{blocked_by}', v_blocked_policies);
  END IF;
  
  -- Log erstellen
  INSERT INTO public.policy_enforcement_logs (
    user_id, module_name, action_attempted, enforcement_result, 
    enforcement_reason, metadata
  ) VALUES (
    p_user_id, p_module_name, p_action,
    CASE WHEN (v_result->>'allowed')::boolean THEN 'allowed' ELSE 'blocked' END,
    CASE WHEN NOT (v_result->>'allowed')::boolean THEN v_blocked_policies::text ELSE NULL END,
    p_context
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;