-- ============================================
-- KORRIGIERTE TENANT ISOLATION FIX
-- Erstelle RLS-Policies nur für Tabellen mit existierenden Spalten
-- ============================================

-- 1. INNOVATION TABELLEN (nur wenn Spalten existieren)
DO $$ BEGIN
    -- innovation_ideas (prüfen auf submitter_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'innovation_ideas' AND column_name = 'submitter_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.innovation_ideas ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Innovation Ideas Tenant Isolation" ON public.innovation_ideas';
        EXECUTE 'CREATE POLICY "Innovation Ideas Tenant Isolation" ON public.innovation_ideas
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = submitter_id 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              submitter_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = submitter_id 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;

    -- pilot_projects (prüfen auf created_by)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'pilot_projects' AND column_name = 'created_by'
    ) THEN
        EXECUTE 'ALTER TABLE public.pilot_projects ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Pilot Projects Tenant Isolation" ON public.pilot_projects';
        EXECUTE 'CREATE POLICY "Pilot Projects Tenant Isolation" ON public.pilot_projects
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = created_by 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              created_by = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = created_by 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;

-- 2. BUDGET TABELLEN (nur mit company_id)
DO $$ BEGIN
    -- budget_plans
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'budget_plans' AND column_name = 'company_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Budget Plans Tenant Isolation" ON public.budget_plans';
        EXECUTE 'CREATE POLICY "Budget Plans Tenant Isolation" ON public.budget_plans
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              company_id = get_tenant_company_id_safe()
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              company_id = get_user_company_id(auth.uid()) OR
              (company_id IS NULL AND is_superadmin_safe(auth.uid()))
          END
        )';
    END IF;

    -- expenses (nur mit employee_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'employee_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Expenses Tenant Isolation" ON public.expenses';
        EXECUTE 'CREATE POLICY "Expenses Tenant Isolation" ON public.expenses
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              employee_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;

-- 3. REWARDS TABELLEN
DO $$ BEGIN
    -- reward_campaigns (mit company_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'reward_campaigns' AND column_name = 'company_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.reward_campaigns ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Reward Campaigns Tenant Isolation" ON public.reward_campaigns';
        EXECUTE 'CREATE POLICY "Reward Campaigns Tenant Isolation" ON public.reward_campaigns
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              company_id = get_tenant_company_id_safe()
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              company_id = get_user_company_id(auth.uid()) OR
              (company_id IS NULL AND is_superadmin_safe(auth.uid()))
          END
        )';
    END IF;

    -- reward_instances (mit employee_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'reward_instances' AND column_name = 'employee_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.reward_instances ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Reward Instances Tenant Isolation" ON public.reward_instances';
        EXECUTE 'CREATE POLICY "Reward Instances Tenant Isolation" ON public.reward_instances
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              employee_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;

-- 4. WORKFLOW TABELLEN  
DO $$ BEGIN
    -- workflow_instances (mit company_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'workflow_instances' AND column_name = 'company_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Workflow Instances Tenant Isolation" ON public.workflow_instances';
        EXECUTE 'CREATE POLICY "Workflow Instances Tenant Isolation" ON public.workflow_instances
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              company_id = get_tenant_company_id_safe()
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              company_id = get_user_company_id(auth.uid()) OR
              (company_id IS NULL AND is_superadmin_safe(auth.uid()))
          END
        )';
    END IF;
END $$;

-- 5. BUSINESS TRAVEL TABELLEN
DO $$ BEGIN
    -- business_trips (mit employee_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'business_trips' AND column_name = 'employee_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Business Trips Tenant Isolation" ON public.business_trips';
        EXECUTE 'CREATE POLICY "Business Trips Tenant Isolation" ON public.business_trips
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              employee_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;

-- 6. CALENDAR TABELLEN
DO $$ BEGIN
    -- calendar_events (mit created_by)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'created_by'
    ) THEN
        EXECUTE 'ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Calendar Events Tenant Isolation" ON public.calendar_events';
        EXECUTE 'CREATE POLICY "Calendar Events Tenant Isolation" ON public.calendar_events
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              created_by IN (
                SELECT e.id FROM public.employees e 
                WHERE e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              created_by = auth.uid() OR
              created_by IN (
                SELECT e.id FROM public.employees e 
                WHERE e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;

-- 7. DOCUMENTS TABELLEN
DO $$ BEGIN
    -- documents (prüfen auf company_id oder uploaded_by)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'uploaded_by'
    ) THEN
        EXECUTE 'ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Documents Tenant Isolation" ON public.documents';
        
        -- Policy abhängig davon ob company_id existiert
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'documents' AND column_name = 'company_id'
        ) THEN
            EXECUTE 'CREATE POLICY "Documents Tenant Isolation" ON public.documents
            FOR ALL USING (
              CASE
                WHEN is_in_tenant_context() THEN 
                  company_id = get_tenant_company_id_safe() OR
                  uploaded_by IN (
                    SELECT e.id FROM public.employees e 
                    WHERE e.company_id = get_tenant_company_id_safe()
                  )
                WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
                ELSE 
                  uploaded_by = auth.uid() OR
                  company_id = get_user_company_id(auth.uid()) OR
                  uploaded_by IN (
                    SELECT e.id FROM public.employees e 
                    WHERE e.company_id = get_user_company_id(auth.uid())
                  )
              END
            )';
        ELSE
            EXECUTE 'CREATE POLICY "Documents Tenant Isolation" ON public.documents
            FOR ALL USING (
              CASE
                WHEN is_in_tenant_context() THEN 
                  uploaded_by IN (
                    SELECT e.id FROM public.employees e 
                    WHERE e.company_id = get_tenant_company_id_safe()
                  )
                WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
                ELSE 
                  uploaded_by = auth.uid() OR
                  uploaded_by IN (
                    SELECT e.id FROM public.employees e 
                    WHERE e.company_id = get_user_company_id(auth.uid())
                  )
              END
            )';
        END IF;
    END IF;
END $$;

-- 8. SHIFT PLANNING TABELLEN
DO $$ BEGIN
    -- shifts (mit employee_id)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'employee_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Shifts Tenant Isolation" ON public.shifts';
        EXECUTE 'CREATE POLICY "Shifts Tenant Isolation" ON public.shifts
        FOR ALL USING (
          CASE
            WHEN is_in_tenant_context() THEN 
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_tenant_company_id_safe()
              )
            WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
            ELSE 
              employee_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.employees e 
                WHERE e.id = employee_id 
                AND e.company_id = get_user_company_id(auth.uid())
              )
          END
        )';
    END IF;
END $$;