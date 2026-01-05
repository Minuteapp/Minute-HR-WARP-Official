-- ============================================
-- MASSIVE TENANT ISOLATION FIX
-- Erstelle RLS-Policies für alle wichtigen Tabellen
-- ============================================

-- 1. INNOVATION TABELLEN
-- innovation_ideas
ALTER TABLE public.innovation_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Innovation Ideas Tenant Isolation" ON public.innovation_ideas;
CREATE POLICY "Innovation Ideas Tenant Isolation" ON public.innovation_ideas
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
);

-- pilot_projects
ALTER TABLE public.pilot_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pilot Projects Tenant Isolation" ON public.pilot_projects;
CREATE POLICY "Pilot Projects Tenant Isolation" ON public.pilot_projects
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
);

-- 2. BUDGET UND FINANCE TABELLEN
-- budget_plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Budget Plans Tenant Isolation" ON public.budget_plans;
CREATE POLICY "Budget Plans Tenant Isolation" ON public.budget_plans
FOR ALL USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR
      (company_id IS NULL AND is_superadmin_safe(auth.uid()))
  END
);

-- expenses (falls existiert)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Expenses Tenant Isolation" ON public.expenses;
CREATE POLICY "Expenses Tenant Isolation" ON public.expenses
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
);

-- 3. REWARDS TABELLEN
-- reward_campaigns
ALTER TABLE public.reward_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reward Campaigns Tenant Isolation" ON public.reward_campaigns;
CREATE POLICY "Reward Campaigns Tenant Isolation" ON public.reward_campaigns
FOR ALL USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR
      (company_id IS NULL AND is_superadmin_safe(auth.uid()))
  END
);

-- reward_instances
ALTER TABLE public.reward_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reward Instances Tenant Isolation" ON public.reward_instances;
CREATE POLICY "Reward Instances Tenant Isolation" ON public.reward_instances
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
);

-- 4. WORKFLOW TABELLEN
-- workflow_instances  
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workflow Instances Tenant Isolation" ON public.workflow_instances;
CREATE POLICY "Workflow Instances Tenant Isolation" ON public.workflow_instances
FOR ALL USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR
      (company_id IS NULL AND is_superadmin_safe(auth.uid()))
  END
);

-- 5. BUSINESS TRAVEL TABELLEN
-- business_trips
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business Trips Tenant Isolation" ON public.business_trips;
CREATE POLICY "Business Trips Tenant Isolation" ON public.business_trips
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
);

-- 6. CALENDAR TABELLEN
-- calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Calendar Events Tenant Isolation" ON public.calendar_events;
CREATE POLICY "Calendar Events Tenant Isolation" ON public.calendar_events
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
);

-- 7. DOCUMENTS TABELLEN
-- documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Documents Tenant Isolation" ON public.documents;
CREATE POLICY "Documents Tenant Isolation" ON public.documents
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
);

-- 8. SHIFT PLANNING TABELLEN
-- shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shifts Tenant Isolation" ON public.shifts;
CREATE POLICY "Shifts Tenant Isolation" ON public.shifts
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
);

-- 9. AI TABELLEN
-- ai_usage_logs (bereits vorhanden, aber sicherstellen)
-- ai_suggestions (bereits vorhanden, aber sicherstellen)

-- 10. PERFORMANCE TABELLEN
-- performance_reviews (falls existiert)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_reviews') THEN
        EXECUTE 'ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'DROP POLICY IF EXISTS "Performance Reviews Tenant Isolation" ON public.performance_reviews';
        EXECUTE 'CREATE POLICY "Performance Reviews Tenant Isolation" ON public.performance_reviews
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