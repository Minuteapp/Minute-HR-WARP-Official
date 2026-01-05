-- =====================================================
-- STOP THE BLEED: Entferne permissive USING(true) Policies
-- die Tenant-Isolation auf Helpdesk-Tabellen aushebeln
-- =====================================================

-- 1) helpdesk_workflows
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_workflows" ON public.helpdesk_workflows;

-- 2) helpdesk_templates
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_templates" ON public.helpdesk_templates;

-- 3) helpdesk_teams
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_teams" ON public.helpdesk_teams;

-- 4) helpdesk_sla_configs
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_sla_configs" ON public.helpdesk_sla_configs;

-- 5) helpdesk_knowledge_base
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_knowledge_base" ON public.helpdesk_knowledge_base;

-- 6) helpdesk_escalation_rules
DROP POLICY IF EXISTS "Authenticated users can view helpdesk_escalation_rules" ON public.helpdesk_escalation_rules;

-- =====================================================
-- Sicherstellen, dass tenant-strikte SELECT Policies existieren
-- (Falls sie fehlen, werden sie hier erstellt)
-- =====================================================

-- helpdesk_workflows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_workflows' 
    AND policyname = 'tenant_helpdesk_workflows_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_workflows_select" 
    ON public.helpdesk_workflows 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;

-- helpdesk_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_templates' 
    AND policyname = 'tenant_helpdesk_templates_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_templates_select" 
    ON public.helpdesk_templates 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;

-- helpdesk_teams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_teams' 
    AND policyname = 'tenant_helpdesk_teams_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_teams_select" 
    ON public.helpdesk_teams 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;

-- helpdesk_sla_configs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_sla_configs' 
    AND policyname = 'tenant_helpdesk_sla_configs_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_sla_configs_select" 
    ON public.helpdesk_sla_configs 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;

-- helpdesk_knowledge_base
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_knowledge_base' 
    AND policyname = 'tenant_helpdesk_knowledge_base_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_knowledge_base_select" 
    ON public.helpdesk_knowledge_base 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;

-- helpdesk_escalation_rules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'helpdesk_escalation_rules' 
    AND policyname = 'tenant_helpdesk_escalation_rules_select'
  ) THEN
    CREATE POLICY "tenant_helpdesk_escalation_rules_select" 
    ON public.helpdesk_escalation_rules 
    FOR SELECT 
    USING (public.can_access_tenant(company_id));
  END IF;
END $$;