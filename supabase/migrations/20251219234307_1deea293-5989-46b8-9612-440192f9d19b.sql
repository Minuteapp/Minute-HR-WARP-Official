
-- =====================================================
-- PHASE 1: get_effective_company_id() Funktion erstellen/aktualisieren
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_tenant_company_id UUID;
  v_user_company_id UUID;
BEGIN
  -- Aktuellen User holen
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- User-Rolle und Company aus profiles holen
  SELECT role, company_id INTO v_user_role, v_user_company_id
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Wenn SuperAdmin, prüfen ob Tenant-Modus aktiv ist
  IF v_user_role = 'superadmin' THEN
    -- Tenant company_id aus user_metadata holen (gesetzt wenn SuperAdmin einen Tenant auswählt)
    v_tenant_company_id := (
      SELECT (raw_user_meta_data->>'tenant_company_id')::UUID
      FROM auth.users
      WHERE id = v_user_id
    );
    
    -- Wenn Tenant gewählt, dessen company_id zurückgeben
    IF v_tenant_company_id IS NOT NULL THEN
      RETURN v_tenant_company_id;
    END IF;
  END IF;
  
  -- Standard: eigene company_id zurückgeben
  RETURN v_user_company_id;
END;
$$;

-- =====================================================
-- PHASE 2: RLS Policies für employees korrigieren
-- =====================================================

-- Alte Policies löschen
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_update_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON public.employees;

-- Neue Policies mit get_effective_company_id()
CREATE POLICY "employees_select_policy" ON public.employees
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "employees_insert_policy" ON public.employees
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "employees_update_policy" ON public.employees
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "employees_delete_policy" ON public.employees
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 3: RLS Policies für absence_requests korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_requests_select_policy" ON public.absence_requests;
DROP POLICY IF EXISTS "absence_requests_insert_policy" ON public.absence_requests;
DROP POLICY IF EXISTS "absence_requests_update_policy" ON public.absence_requests;
DROP POLICY IF EXISTS "absence_requests_delete_policy" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can view own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can create own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update own absence requests" ON public.absence_requests;

CREATE POLICY "absence_requests_select_policy" ON public.absence_requests
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_requests_insert_policy" ON public.absence_requests
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_requests_update_policy" ON public.absence_requests
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_requests_delete_policy" ON public.absence_requests
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 4: RLS Policies für absence_quotas korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_quotas_select_policy" ON public.absence_quotas;
DROP POLICY IF EXISTS "absence_quotas_insert_policy" ON public.absence_quotas;
DROP POLICY IF EXISTS "absence_quotas_update_policy" ON public.absence_quotas;
DROP POLICY IF EXISTS "absence_quotas_delete_policy" ON public.absence_quotas;

CREATE POLICY "absence_quotas_select_policy" ON public.absence_quotas
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_quotas_insert_policy" ON public.absence_quotas
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_quotas_update_policy" ON public.absence_quotas
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_quotas_delete_policy" ON public.absence_quotas
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 5: RLS Policies für absence_settings korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_settings_select_policy" ON public.absence_settings;
DROP POLICY IF EXISTS "absence_settings_insert_policy" ON public.absence_settings;
DROP POLICY IF EXISTS "absence_settings_update_policy" ON public.absence_settings;
DROP POLICY IF EXISTS "absence_settings_delete_policy" ON public.absence_settings;

CREATE POLICY "absence_settings_select_policy" ON public.absence_settings
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_insert_policy" ON public.absence_settings
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_update_policy" ON public.absence_settings
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_delete_policy" ON public.absence_settings
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 6: RLS Policies für absence_blackout_periods korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_blackout_select" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "absence_blackout_insert" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "absence_blackout_update" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "absence_blackout_delete" ON public.absence_blackout_periods;

CREATE POLICY "absence_blackout_select" ON public.absence_blackout_periods
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_blackout_insert" ON public.absence_blackout_periods
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_blackout_update" ON public.absence_blackout_periods
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_blackout_delete" ON public.absence_blackout_periods
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 7: RLS Policies für absence_holidays korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_holidays_select" ON public.absence_holidays;
DROP POLICY IF EXISTS "absence_holidays_insert" ON public.absence_holidays;
DROP POLICY IF EXISTS "absence_holidays_update" ON public.absence_holidays;
DROP POLICY IF EXISTS "absence_holidays_delete" ON public.absence_holidays;

CREATE POLICY "absence_holidays_select" ON public.absence_holidays
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_holidays_insert" ON public.absence_holidays
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_holidays_update" ON public.absence_holidays
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_holidays_delete" ON public.absence_holidays
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 8: RLS Policies für absence_payroll_mappings korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_payroll_select" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "absence_payroll_insert" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "absence_payroll_update" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "absence_payroll_delete" ON public.absence_payroll_mappings;

CREATE POLICY "absence_payroll_select" ON public.absence_payroll_mappings
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_payroll_insert" ON public.absence_payroll_mappings
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_payroll_update" ON public.absence_payroll_mappings
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_payroll_delete" ON public.absence_payroll_mappings
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 9: RLS Policies für absence_settings_hierarchy korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_settings_hierarchy_select" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "absence_settings_hierarchy_insert" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "absence_settings_hierarchy_update" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "absence_settings_hierarchy_delete" ON public.absence_settings_hierarchy;

CREATE POLICY "absence_settings_hierarchy_select" ON public.absence_settings_hierarchy
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_hierarchy_insert" ON public.absence_settings_hierarchy
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_hierarchy_update" ON public.absence_settings_hierarchy
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_settings_hierarchy_delete" ON public.absence_settings_hierarchy
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 10: RLS Policies für absence_substitute_rules korrigieren
-- =====================================================

DROP POLICY IF EXISTS "absence_substitute_select" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "absence_substitute_insert" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "absence_substitute_update" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "absence_substitute_delete" ON public.absence_substitute_rules;

CREATE POLICY "absence_substitute_select" ON public.absence_substitute_rules
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_substitute_insert" ON public.absence_substitute_rules
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_substitute_update" ON public.absence_substitute_rules
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "absence_substitute_delete" ON public.absence_substitute_rules
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 11: RLS Policies für time_entries korrigieren (falls company_id existiert)
-- =====================================================

-- Erst prüfen ob time_entries company_id hat und Policies entsprechend setzen
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'time_entries' 
    AND column_name = 'company_id'
  ) THEN
    -- Alte Policies löschen
    DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
    DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;
    
    -- Neue Policies erstellen
    EXECUTE 'CREATE POLICY "time_entries_select_policy" ON public.time_entries FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "time_entries_insert_policy" ON public.time_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "time_entries_update_policy" ON public.time_entries FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "time_entries_delete_policy" ON public.time_entries FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 12: RLS Policies für business_trips korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'business_trips' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "business_trips_select_policy" ON public.business_trips;
    DROP POLICY IF EXISTS "business_trips_insert_policy" ON public.business_trips;
    DROP POLICY IF EXISTS "business_trips_update_policy" ON public.business_trips;
    DROP POLICY IF EXISTS "business_trips_delete_policy" ON public.business_trips;
    
    EXECUTE 'CREATE POLICY "business_trips_select_policy" ON public.business_trips FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "business_trips_insert_policy" ON public.business_trips FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "business_trips_update_policy" ON public.business_trips FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "business_trips_delete_policy" ON public.business_trips FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 13: RLS Policies für departments korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'departments' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "departments_select_policy" ON public.departments;
    DROP POLICY IF EXISTS "departments_insert_policy" ON public.departments;
    DROP POLICY IF EXISTS "departments_update_policy" ON public.departments;
    DROP POLICY IF EXISTS "departments_delete_policy" ON public.departments;
    
    EXECUTE 'CREATE POLICY "departments_select_policy" ON public.departments FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "departments_insert_policy" ON public.departments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "departments_update_policy" ON public.departments FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "departments_delete_policy" ON public.departments FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 14: RLS Policies für locations korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'locations' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "locations_select_policy" ON public.locations;
    DROP POLICY IF EXISTS "locations_insert_policy" ON public.locations;
    DROP POLICY IF EXISTS "locations_update_policy" ON public.locations;
    DROP POLICY IF EXISTS "locations_delete_policy" ON public.locations;
    
    EXECUTE 'CREATE POLICY "locations_select_policy" ON public.locations FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "locations_insert_policy" ON public.locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "locations_update_policy" ON public.locations FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "locations_delete_policy" ON public.locations FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 15: RLS Policies für teams korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'teams' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "teams_select_policy" ON public.teams;
    DROP POLICY IF EXISTS "teams_insert_policy" ON public.teams;
    DROP POLICY IF EXISTS "teams_update_policy" ON public.teams;
    DROP POLICY IF EXISTS "teams_delete_policy" ON public.teams;
    
    EXECUTE 'CREATE POLICY "teams_select_policy" ON public.teams FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "teams_insert_policy" ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "teams_update_policy" ON public.teams FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "teams_delete_policy" ON public.teams FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 16: RLS Policies für workflow_definitions korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workflow_definitions' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "workflow_definitions_select_policy" ON public.workflow_definitions;
    DROP POLICY IF EXISTS "workflow_definitions_insert_policy" ON public.workflow_definitions;
    DROP POLICY IF EXISTS "workflow_definitions_update_policy" ON public.workflow_definitions;
    DROP POLICY IF EXISTS "workflow_definitions_delete_policy" ON public.workflow_definitions;
    
    EXECUTE 'CREATE POLICY "workflow_definitions_select_policy" ON public.workflow_definitions FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_definitions_insert_policy" ON public.workflow_definitions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_definitions_update_policy" ON public.workflow_definitions FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_definitions_delete_policy" ON public.workflow_definitions FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 17: RLS Policies für workflow_instances korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workflow_instances' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "workflow_instances_select_policy" ON public.workflow_instances;
    DROP POLICY IF EXISTS "workflow_instances_insert_policy" ON public.workflow_instances;
    DROP POLICY IF EXISTS "workflow_instances_update_policy" ON public.workflow_instances;
    DROP POLICY IF EXISTS "workflow_instances_delete_policy" ON public.workflow_instances;
    
    EXECUTE 'CREATE POLICY "workflow_instances_select_policy" ON public.workflow_instances FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_instances_insert_policy" ON public.workflow_instances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_instances_update_policy" ON public.workflow_instances FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "workflow_instances_delete_policy" ON public.workflow_instances FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 18: RLS Policies für documents korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
    DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
    DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
    DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
    
    EXECUTE 'CREATE POLICY "documents_select_policy" ON public.documents FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "documents_insert_policy" ON public.documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "documents_update_policy" ON public.documents FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "documents_delete_policy" ON public.documents FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 19: RLS Policies für calendar_events korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'calendar_events' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "calendar_events_select_policy" ON public.calendar_events;
    DROP POLICY IF EXISTS "calendar_events_insert_policy" ON public.calendar_events;
    DROP POLICY IF EXISTS "calendar_events_update_policy" ON public.calendar_events;
    DROP POLICY IF EXISTS "calendar_events_delete_policy" ON public.calendar_events;
    
    EXECUTE 'CREATE POLICY "calendar_events_select_policy" ON public.calendar_events FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "calendar_events_insert_policy" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "calendar_events_update_policy" ON public.calendar_events FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "calendar_events_delete_policy" ON public.calendar_events FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 20: RLS Policies für tickets korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tickets' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "tickets_select_policy" ON public.tickets;
    DROP POLICY IF EXISTS "tickets_insert_policy" ON public.tickets;
    DROP POLICY IF EXISTS "tickets_update_policy" ON public.tickets;
    DROP POLICY IF EXISTS "tickets_delete_policy" ON public.tickets;
    
    EXECUTE 'CREATE POLICY "tickets_select_policy" ON public.tickets FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "tickets_insert_policy" ON public.tickets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "tickets_update_policy" ON public.tickets FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "tickets_delete_policy" ON public.tickets FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;

-- =====================================================
-- PHASE 21: RLS Policies für sick_leaves korrigieren
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sick_leaves' 
    AND column_name = 'company_id'
  ) THEN
    DROP POLICY IF EXISTS "sick_leaves_select_policy" ON public.sick_leaves;
    DROP POLICY IF EXISTS "sick_leaves_insert_policy" ON public.sick_leaves;
    DROP POLICY IF EXISTS "sick_leaves_update_policy" ON public.sick_leaves;
    DROP POLICY IF EXISTS "sick_leaves_delete_policy" ON public.sick_leaves;
    
    EXECUTE 'CREATE POLICY "sick_leaves_select_policy" ON public.sick_leaves FOR SELECT USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "sick_leaves_insert_policy" ON public.sick_leaves FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "sick_leaves_update_policy" ON public.sick_leaves FOR UPDATE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
    EXECUTE 'CREATE POLICY "sick_leaves_delete_policy" ON public.sick_leaves FOR DELETE USING (auth.uid() IS NOT NULL AND company_id = get_effective_company_id())';
  END IF;
END $$;
