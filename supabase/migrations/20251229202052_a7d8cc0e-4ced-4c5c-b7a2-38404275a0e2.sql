-- =============================================
-- SETTINGS-DRIVEN ARCHITECTURE (SDA) MIGRATION
-- Phase 1: RPC Functions (Policies bereits erstellt in voriger Migration)
-- =============================================

-- 6. RPC: initialize_tenant_settings - Setzt alle 80/20 Defaults für neuen Tenant
CREATE OR REPLACE FUNCTION initialize_tenant_settings(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_definition RECORD;
  v_count INTEGER := 0;
  v_existing INTEGER;
BEGIN
  -- Prüfe ob Tenant existiert
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_tenant_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant not found',
      'tenant_id', p_tenant_id
    );
  END IF;

  -- Iteriere über alle aktiven Settings-Definitionen
  FOR v_definition IN 
    SELECT id, module, key, COALESCE(default_8020_value, default_value) as default_val
    FROM settings_definitions 
    WHERE is_active = true
  LOOP
    -- Prüfe ob Setting bereits existiert für diesen Tenant
    SELECT COUNT(*) INTO v_existing
    FROM settings_values
    WHERE module = v_definition.module
      AND key = v_definition.key
      AND scope_level = 'company'
      AND scope_entity_id = p_tenant_id;
    
    -- Nur erstellen wenn noch nicht vorhanden
    IF v_existing = 0 THEN
      INSERT INTO settings_values (
        definition_id,
        module,
        key,
        value,
        scope_level,
        scope_entity_id,
        inheritance_mode,
        company_id,
        created_at,
        updated_at
      ) VALUES (
        v_definition.id,
        v_definition.module,
        v_definition.key,
        v_definition.default_val,
        'company',
        p_tenant_id,
        'override',
        p_tenant_id,
        NOW(),
        NOW()
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- Log die Initialisierung
  INSERT INTO settings_audit_log (
    module,
    key,
    action,
    new_value,
    scope_level,
    scope_entity_id,
    enforcement_channel,
    reason
  ) VALUES (
    'system',
    'tenant_initialization',
    'create',
    jsonb_build_object('settings_created', v_count, 'tenant_id', p_tenant_id),
    'company',
    p_tenant_id,
    'api',
    '80/20 Defaults bei Tenant-Erstellung'
  );

  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', p_tenant_id,
    'settings_created', v_count,
    'message', format('%s Settings mit 80/20 Defaults initialisiert', v_count)
  );
END;
$$;

-- 7. RPC: reset_tenant_to_8020_defaults - Setzt alle Settings zurück auf 80/20 Defaults
CREATE OR REPLACE FUNCTION reset_tenant_to_8020_defaults(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
  v_created INTEGER;
BEGIN
  -- Prüfe Superadmin Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nur Superadmins können Settings zurücksetzen'
    );
  END IF;

  -- Lösche alle aktuellen Settings für den Tenant
  DELETE FROM settings_values 
  WHERE scope_entity_id = p_tenant_id 
    AND scope_level = 'company';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Re-initialisiere mit 80/20 Defaults
  SELECT (initialize_tenant_settings(p_tenant_id)->>'settings_created')::INTEGER 
  INTO v_created;

  -- Log die Aktion
  INSERT INTO settings_audit_log (
    module,
    key,
    action,
    old_value,
    new_value,
    scope_level,
    scope_entity_id,
    changed_by,
    enforcement_channel,
    reason
  ) VALUES (
    'system',
    'tenant_reset',
    'reset',
    jsonb_build_object('deleted', v_deleted),
    jsonb_build_object('created', v_created),
    'company',
    p_tenant_id,
    auth.uid(),
    'api',
    'Reset auf 80/20 Defaults durch Superadmin'
  );

  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', p_tenant_id,
    'settings_deleted', v_deleted,
    'settings_created', v_created,
    'message', format('%s Settings gelöscht, %s neu mit 80/20 Defaults erstellt', v_deleted, v_created)
  );
END;
$$;

-- 8. RPC: get_effective_settings - Serverseitige Settings-Auflösung mit provenance
CREATE OR REPLACE FUNCTION get_effective_settings(
  p_module TEXT,
  p_tenant_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_department_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_location_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB := '{}';
  v_provenance JSONB := '{}';
  v_definition RECORD;
  v_value JSONB;
  v_source TEXT;
BEGIN
  -- Iteriere über alle Definitionen des Moduls
  FOR v_definition IN 
    SELECT id, key, COALESCE(default_8020_value, default_value) as default_val
    FROM settings_definitions 
    WHERE module = p_module AND is_active = true
  LOOP
    -- Priorität: user > team > department > location > company > global
    -- Suche den Wert mit höchster Priorität
    
    -- 1. User-Level
    IF p_user_id IS NOT NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'user' AND scope_entity_id = p_user_id
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'user';
      END IF;
    END IF;
    
    -- 2. Team-Level
    IF v_value IS NULL AND p_team_id IS NOT NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'team' AND scope_entity_id = p_team_id
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'team';
      END IF;
    END IF;
    
    -- 3. Department-Level
    IF v_value IS NULL AND p_department_id IS NOT NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'department' AND scope_entity_id = p_department_id
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'department';
      END IF;
    END IF;
    
    -- 4. Location-Level
    IF v_value IS NULL AND p_location_id IS NOT NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'location' AND scope_entity_id = p_location_id
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'location';
      END IF;
    END IF;
    
    -- 5. Company/Tenant-Level
    IF v_value IS NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'company' AND scope_entity_id = p_tenant_id
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'company';
      END IF;
    END IF;
    
    -- 6. Global Level
    IF v_value IS NULL THEN
      SELECT value INTO v_value
      FROM settings_values
      WHERE module = p_module AND key = v_definition.key
        AND scope_level = 'global'
      LIMIT 1;
      IF v_value IS NOT NULL THEN
        v_source := 'global';
      END IF;
    END IF;
    
    -- 7. Fallback auf 80/20 Default
    IF v_value IS NULL THEN
      v_value := v_definition.default_val;
      v_source := 'default_8020';
    END IF;
    
    -- Speichere Ergebnis
    v_result := v_result || jsonb_build_object(v_definition.key, v_value);
    v_provenance := v_provenance || jsonb_build_object(
      v_definition.key, 
      jsonb_build_object('source', v_source, 'value', v_value)
    );
    
    -- Reset für nächste Iteration
    v_value := NULL;
    v_source := NULL;
  END LOOP;

  RETURN jsonb_build_object(
    'module', p_module,
    'tenant_id', p_tenant_id,
    'settings', v_result,
    'provenance', v_provenance,
    'version_hash', md5(v_result::TEXT),
    'resolved_at', NOW()
  );
END;
$$;

-- 9. RPC: enforce_setting - Prüft ob eine Aktion durch ein Setting blockiert wird
CREATE OR REPLACE FUNCTION enforce_setting(
  p_module TEXT,
  p_key TEXT,
  p_tenant_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_required_value JSONB DEFAULT 'true'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_effective JSONB;
  v_current_value JSONB;
  v_source TEXT;
BEGIN
  -- Hole effektive Settings
  v_effective := get_effective_settings(p_module, p_tenant_id, p_user_id);
  
  -- Extrahiere den aktuellen Wert und die Quelle
  v_current_value := v_effective->'settings'->p_key;
  v_source := v_effective->'provenance'->p_key->>'source';
  
  -- Wenn kein Wert gefunden, ist die Aktion blockiert
  IF v_current_value IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'key', p_key,
      'current_value', NULL,
      'required_value', p_required_value,
      'source', 'not_found',
      'blocked_by_setting', p_key,
      'message', format('Einstellung "%s" nicht gefunden im Modul "%s"', p_key, p_module)
    );
  END IF;
  
  -- Prüfe ob der aktuelle Wert dem erforderlichen entspricht
  IF v_current_value = p_required_value THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'key', p_key,
      'current_value', v_current_value,
      'required_value', p_required_value,
      'source', v_source,
      'message', format('Aktion erlaubt durch Einstellung "%s" auf Ebene "%s"', p_key, v_source)
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', false,
      'key', p_key,
      'current_value', v_current_value,
      'required_value', p_required_value,
      'source', v_source,
      'blocked_by_setting', p_key,
      'message', format('Aktion blockiert durch Einstellung "%s" auf Ebene "%s"', p_key, v_source)
    );
  END IF;
END;
$$;

-- 10. Erstelle RLS Policies für settings_audit_log (ohne IF NOT EXISTS)
DO $$
BEGIN
  -- Lösche existierende Policies falls vorhanden
  DROP POLICY IF EXISTS "settings_audit_log_read_own_company" ON settings_audit_log;
  DROP POLICY IF EXISTS "settings_audit_log_insert" ON settings_audit_log;
  
  -- Erstelle neue Policies
  CREATE POLICY "settings_audit_log_read_own_company" ON settings_audit_log
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('superadmin', 'admin', 'hr')
      )
    );
    
  CREATE POLICY "settings_audit_log_insert" ON settings_audit_log
    FOR INSERT WITH CHECK (true);
END $$;