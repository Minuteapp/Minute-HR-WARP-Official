
-- =====================================================
-- PHASE 1: FEHLENDE COMPANY_ID SPALTEN HINZUFÜGEN
-- Alle Domain-Tabellen bekommen company_id (nullable zuerst)
-- =====================================================

-- 1. Helpdesk-Tabellen
ALTER TABLE IF EXISTS public.helpdesk_escalation_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_escalation_rules_company_id 
  ON public.helpdesk_escalation_rules(company_id);

ALTER TABLE IF EXISTS public.helpdesk_knowledge_base 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_knowledge_base_company_id 
  ON public.helpdesk_knowledge_base(company_id);

ALTER TABLE IF EXISTS public.helpdesk_sla_configs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_sla_configs_company_id 
  ON public.helpdesk_sla_configs(company_id);

ALTER TABLE IF EXISTS public.helpdesk_teams 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_teams_company_id 
  ON public.helpdesk_teams(company_id);

ALTER TABLE IF EXISTS public.helpdesk_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_templates_company_id 
  ON public.helpdesk_templates(company_id);

ALTER TABLE IF EXISTS public.helpdesk_tickets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_company_id 
  ON public.helpdesk_tickets(company_id);

ALTER TABLE IF EXISTS public.helpdesk_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_workflows_company_id 
  ON public.helpdesk_workflows(company_id);

-- 2. Chat-Tabellen
ALTER TABLE IF EXISTS public.chat_command_executions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chat_command_executions_company_id 
  ON public.chat_command_executions(company_id);

ALTER TABLE IF EXISTS public.chat_commands 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chat_commands_company_id 
  ON public.chat_commands(company_id);

ALTER TABLE IF EXISTS public.chat_interactive_cards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chat_interactive_cards_company_id 
  ON public.chat_interactive_cards(company_id);

-- 3. Knowledge-Tabellen
ALTER TABLE IF EXISTS public.knowledge_article_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_comments_company_id 
  ON public.knowledge_article_comments(company_id);

ALTER TABLE IF EXISTS public.knowledge_article_favorites 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_favorites_company_id 
  ON public.knowledge_article_favorites(company_id);

ALTER TABLE IF EXISTS public.knowledge_article_feedback 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_feedback_company_id 
  ON public.knowledge_article_feedback(company_id);

ALTER TABLE IF EXISTS public.knowledge_article_relations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_relations_company_id 
  ON public.knowledge_article_relations(company_id);

ALTER TABLE IF EXISTS public.knowledge_article_views 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_views_company_id 
  ON public.knowledge_article_views(company_id);

-- 4. Pulse-Survey-Tabellen
ALTER TABLE IF EXISTS public.pulse_action_items 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_action_items_company_id 
  ON public.pulse_action_items(company_id);

ALTER TABLE IF EXISTS public.pulse_ai_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_ai_insights_company_id 
  ON public.pulse_ai_insights(company_id);

ALTER TABLE IF EXISTS public.pulse_survey_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_survey_analytics_company_id 
  ON public.pulse_survey_analytics(company_id);

ALTER TABLE IF EXISTS public.pulse_survey_questions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_survey_questions_company_id 
  ON public.pulse_survey_questions(company_id);

ALTER TABLE IF EXISTS public.pulse_survey_responses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_survey_responses_company_id 
  ON public.pulse_survey_responses(company_id);

ALTER TABLE IF EXISTS public.pulse_survey_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_survey_templates_company_id 
  ON public.pulse_survey_templates(company_id);

ALTER TABLE IF EXISTS public.pulse_surveys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pulse_surveys_company_id 
  ON public.pulse_surveys(company_id);

-- 5. Org-Tabellen
ALTER TABLE IF EXISTS public.org_ai_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_org_ai_insights_company_id 
  ON public.org_ai_insights(company_id);

ALTER TABLE IF EXISTS public.org_kpi_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_org_kpi_metrics_company_id 
  ON public.org_kpi_metrics(company_id);

ALTER TABLE IF EXISTS public.org_scenarios 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_org_scenarios_company_id 
  ON public.org_scenarios(company_id);

ALTER TABLE IF EXISTS public.org_succession_plans 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_org_succession_plans_company_id 
  ON public.org_succession_plans(company_id);

-- 6. Translation-Tabellen
ALTER TABLE IF EXISTS public.translation_memory 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_translation_memory_company_id 
  ON public.translation_memory(company_id);

ALTER TABLE IF EXISTS public.translation_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_translation_metrics_company_id 
  ON public.translation_metrics(company_id);

-- 7. Sonstige
ALTER TABLE IF EXISTS public.glossary_terms 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_company_id 
  ON public.glossary_terms(company_id);

-- 8. RLS Policies für neue Tabellen (tenant-scoped)
DO $$
DECLARE
  tables_to_policy TEXT[] := ARRAY[
    'helpdesk_escalation_rules', 'helpdesk_knowledge_base', 'helpdesk_sla_configs',
    'helpdesk_teams', 'helpdesk_templates', 'helpdesk_tickets', 'helpdesk_workflows',
    'chat_command_executions', 'chat_commands', 'chat_interactive_cards',
    'knowledge_article_comments', 'knowledge_article_favorites', 'knowledge_article_feedback',
    'knowledge_article_relations', 'knowledge_article_views',
    'pulse_action_items', 'pulse_ai_insights', 'pulse_survey_analytics',
    'pulse_survey_questions', 'pulse_survey_responses', 'pulse_survey_templates', 'pulse_surveys',
    'org_ai_insights', 'org_kpi_metrics', 'org_scenarios', 'org_succession_plans',
    'translation_memory', 'translation_metrics', 'glossary_terms'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_to_policy
  LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- Drop existing tenant policies if any
        EXECUTE format('DROP POLICY IF EXISTS tenant_%s_select ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_%s_insert ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_%s_update ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_%s_delete ON public.%I', tbl, tbl);
        
        -- Create new tenant policies
        EXECUTE format(
          'CREATE POLICY tenant_%s_select ON public.%I FOR SELECT USING (public.can_access_tenant(company_id))',
          tbl, tbl
        );
        EXECUTE format(
          'CREATE POLICY tenant_%s_insert ON public.%I FOR INSERT WITH CHECK (public.can_write_tenant(company_id))',
          tbl, tbl
        );
        EXECUTE format(
          'CREATE POLICY tenant_%s_update ON public.%I FOR UPDATE USING (public.can_write_tenant(company_id))',
          tbl, tbl
        );
        EXECUTE format(
          'CREATE POLICY tenant_%s_delete ON public.%I FOR DELETE USING (public.can_write_tenant(company_id))',
          tbl, tbl
        );
        
        RAISE NOTICE 'Added RLS policies for: %', tbl;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add policies for %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;
