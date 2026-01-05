
-- =====================================================
-- PHASE 2: MULTI-TENANT ISOLATION - TABELLEN-MIGRATION
-- Hinzufügen von company_id zu allen Domain-Tabellen
-- =====================================================

-- ===== BATCH 1: ABSENCE & ATTENDANCE TABELLEN =====

-- absence_audit_trail
ALTER TABLE public.absence_audit_trail 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_audit_trail_company_id 
  ON public.absence_audit_trail(company_id);

-- absence_auto_notifications
ALTER TABLE public.absence_auto_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_auto_notifications_company_id 
  ON public.absence_auto_notifications(company_id);

-- absence_documents
ALTER TABLE public.absence_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_documents_company_id 
  ON public.absence_documents(company_id);

-- absence_notifications
ALTER TABLE public.absence_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_notifications_company_id 
  ON public.absence_notifications(company_id);

-- absence_queries
ALTER TABLE public.absence_queries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_queries_company_id 
  ON public.absence_queries(company_id);

-- absence_types
ALTER TABLE public.absence_types 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absence_types_company_id 
  ON public.absence_types(company_id);

-- absences
ALTER TABLE public.absences 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_absences_company_id 
  ON public.absences(company_id);

-- abwesenheitsarten
ALTER TABLE public.abwesenheitsarten 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_abwesenheitsarten_company_id 
  ON public.abwesenheitsarten(company_id);

-- ===== BATCH 2: AI & AUTOMATION TABELLEN =====

-- ai_alerts
ALTER TABLE public.ai_alerts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_company_id 
  ON public.ai_alerts(company_id);

-- ai_automations
ALTER TABLE public.ai_automations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_automations_company_id 
  ON public.ai_automations(company_id);

-- ai_budget_insights
ALTER TABLE public.ai_budget_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_budget_insights_company_id 
  ON public.ai_budget_insights(company_id);

-- ai_compliance_audits
ALTER TABLE public.ai_compliance_audits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_compliance_audits_company_id 
  ON public.ai_compliance_audits(company_id);

-- ai_cost_tracking
ALTER TABLE public.ai_cost_tracking 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_company_id 
  ON public.ai_cost_tracking(company_id);

-- ai_forecasts
ALTER TABLE public.ai_forecasts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_forecasts_company_id 
  ON public.ai_forecasts(company_id);

-- ai_models
ALTER TABLE public.ai_models 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_models_company_id 
  ON public.ai_models(company_id);

-- ai_settings
ALTER TABLE public.ai_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_company_id 
  ON public.ai_settings(company_id);

-- ai_suggestions
ALTER TABLE public.ai_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_company_id 
  ON public.ai_suggestions(company_id);

-- ai_team_approvals
ALTER TABLE public.ai_team_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_team_approvals_company_id 
  ON public.ai_team_approvals(company_id);

-- ai_training_data
ALTER TABLE public.ai_training_data 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_company_id 
  ON public.ai_training_data(company_id);

-- ai_usage_logs
ALTER TABLE public.ai_usage_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_company_id 
  ON public.ai_usage_logs(company_id);

-- automation_workflows
ALTER TABLE public.automation_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_company_id 
  ON public.automation_workflows(company_id);

-- ===== BATCH 3: API & APPROVAL TABELLEN =====

-- api_keys
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_api_keys_company_id 
  ON public.api_keys(company_id);

-- api_rate_limits
ALTER TABLE public.api_rate_limits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_company_id 
  ON public.api_rate_limits(company_id);

-- approval_workflow_history
ALTER TABLE public.approval_workflow_history 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_history_company_id 
  ON public.approval_workflow_history(company_id);

-- approval_workflows
ALTER TABLE public.approval_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_company_id 
  ON public.approval_workflows(company_id);

-- arbeitszeit_modelle
ALTER TABLE public.arbeitszeit_modelle 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_arbeitszeit_modelle_company_id 
  ON public.arbeitszeit_modelle(company_id);

-- au_ocr_queue
ALTER TABLE public.au_ocr_queue 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_au_ocr_queue_company_id 
  ON public.au_ocr_queue(company_id);

-- audit_findings
ALTER TABLE public.audit_findings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_company_id 
  ON public.audit_findings(company_id);

-- auto_approval_conditions
ALTER TABLE public.auto_approval_conditions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_auto_approval_conditions_company_id 
  ON public.auto_approval_conditions(company_id);

-- auto_approval_rules
ALTER TABLE public.auto_approval_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_auto_approval_rules_company_id 
  ON public.auto_approval_rules(company_id);

-- ===== BATCH 4: BUDGET TABELLEN =====

-- background_music
ALTER TABLE public.background_music 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_background_music_company_id 
  ON public.background_music(company_id);

-- bonus_recommendations
ALTER TABLE public.bonus_recommendations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_bonus_recommendations_company_id 
  ON public.bonus_recommendations(company_id);

-- budget_actual_entries
ALTER TABLE public.budget_actual_entries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_actual_entries_company_id 
  ON public.budget_actual_entries(company_id);

-- budget_actuals
ALTER TABLE public.budget_actuals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_actuals_company_id 
  ON public.budget_actuals(company_id);

-- budget_alerts
ALTER TABLE public.budget_alerts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_company_id 
  ON public.budget_alerts(company_id);

-- budget_approval_workflows
ALTER TABLE public.budget_approval_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_approval_workflows_company_id 
  ON public.budget_approval_workflows(company_id);

-- budget_approvals
ALTER TABLE public.budget_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_approvals_company_id 
  ON public.budget_approvals(company_id);

-- budget_dimension_configs
ALTER TABLE public.budget_dimension_configs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_dimension_configs_company_id 
  ON public.budget_dimension_configs(company_id);

-- budget_expense_allocations
ALTER TABLE public.budget_expense_allocations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_expense_allocations_company_id 
  ON public.budget_expense_allocations(company_id);

-- budget_exports
ALTER TABLE public.budget_exports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_exports_company_id 
  ON public.budget_exports(company_id);

-- budget_forecasts
ALTER TABLE public.budget_forecasts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_forecasts_company_id 
  ON public.budget_forecasts(company_id);

-- budget_integrations
ALTER TABLE public.budget_integrations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_integrations_company_id 
  ON public.budget_integrations(company_id);

-- budget_metrics
ALTER TABLE public.budget_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_metrics_company_id 
  ON public.budget_metrics(company_id);

-- budget_period_comparisons
ALTER TABLE public.budget_period_comparisons 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_period_comparisons_company_id 
  ON public.budget_period_comparisons(company_id);

-- budget_permissions
ALTER TABLE public.budget_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_permissions_company_id 
  ON public.budget_permissions(company_id);

-- budget_scenarios
ALTER TABLE public.budget_scenarios 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_company_id 
  ON public.budget_scenarios(company_id);

-- budget_templates
ALTER TABLE public.budget_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_templates_company_id 
  ON public.budget_templates(company_id);

-- budget_upload_batches
ALTER TABLE public.budget_upload_batches 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_upload_batches_company_id 
  ON public.budget_upload_batches(company_id);

-- budget_versions
ALTER TABLE public.budget_versions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_versions_company_id 
  ON public.budget_versions(company_id);

-- budget_what_if_scenarios
ALTER TABLE public.budget_what_if_scenarios 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_budget_what_if_scenarios_company_id 
  ON public.budget_what_if_scenarios(company_id);

-- business_travel_requests
ALTER TABLE public.business_travel_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_business_travel_requests_company_id 
  ON public.business_travel_requests(company_id);

-- ===== BATCH 5: CALENDAR TABELLEN =====

-- calendar_ai_insights
ALTER TABLE public.calendar_ai_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_ai_insights_company_id 
  ON public.calendar_ai_insights(company_id);

-- calendar_audit_log
ALTER TABLE public.calendar_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_audit_log_company_id 
  ON public.calendar_audit_log(company_id);

-- calendar_categories
ALTER TABLE public.calendar_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_categories_company_id 
  ON public.calendar_categories(company_id);

-- calendar_conflicts
ALTER TABLE public.calendar_conflicts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_conflicts_company_id 
  ON public.calendar_conflicts(company_id);

-- calendar_event_analytics
ALTER TABLE public.calendar_event_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_analytics_company_id 
  ON public.calendar_event_analytics(company_id);

-- calendar_event_comments
ALTER TABLE public.calendar_event_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_comments_company_id 
  ON public.calendar_event_comments(company_id);

-- calendar_event_conflicts
ALTER TABLE public.calendar_event_conflicts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_conflicts_company_id 
  ON public.calendar_event_conflicts(company_id);

-- calendar_event_documents
ALTER TABLE public.calendar_event_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_documents_company_id 
  ON public.calendar_event_documents(company_id);

-- calendar_event_instances
ALTER TABLE public.calendar_event_instances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_instances_company_id 
  ON public.calendar_event_instances(company_id);

-- calendar_event_series
ALTER TABLE public.calendar_event_series 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_series_company_id 
  ON public.calendar_event_series(company_id);

-- calendar_event_templates
ALTER TABLE public.calendar_event_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_templates_company_id 
  ON public.calendar_event_templates(company_id);

-- calendar_holidays
ALTER TABLE public.calendar_holidays 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_holidays_company_id 
  ON public.calendar_holidays(company_id);

-- calendar_integrations
ALTER TABLE public.calendar_integrations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_company_id 
  ON public.calendar_integrations(company_id);

-- calendar_invitations
ALTER TABLE public.calendar_invitations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_invitations_company_id 
  ON public.calendar_invitations(company_id);

-- calendar_reminders
ALTER TABLE public.calendar_reminders 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders_company_id 
  ON public.calendar_reminders(company_id);

-- calendar_resources
ALTER TABLE public.calendar_resources 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_resources_company_id 
  ON public.calendar_resources(company_id);

-- calendar_sync_jobs
ALTER TABLE public.calendar_sync_jobs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_jobs_company_id 
  ON public.calendar_sync_jobs(company_id);

-- calendar_sync_mappings
ALTER TABLE public.calendar_sync_mappings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_mappings_company_id 
  ON public.calendar_sync_mappings(company_id);

-- ===== BATCH 6: CANDIDATES & CAREER TABELLEN =====

-- candidate_documents
ALTER TABLE public.candidate_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_company_id 
  ON public.candidate_documents(company_id);

-- candidates
ALTER TABLE public.candidates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_candidates_company_id 
  ON public.candidates(company_id);

-- carbon_emissions
ALTER TABLE public.carbon_emissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_carbon_emissions_company_id 
  ON public.carbon_emissions(company_id);

-- carbon_footprint
ALTER TABLE public.carbon_footprint 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_carbon_footprint_company_id 
  ON public.carbon_footprint(company_id);

-- career_goals
ALTER TABLE public.career_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_career_goals_company_id 
  ON public.career_goals(company_id);

-- career_path
ALTER TABLE public.career_path 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_career_path_company_id 
  ON public.career_path(company_id);

-- challenge_participations
ALTER TABLE public.challenge_participations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_company_id 
  ON public.challenge_participations(company_id);

-- ===== BATCH 7: CHAT & COMMUNICATION TABELLEN =====

-- channel_member_settings
ALTER TABLE public.channel_member_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_channel_member_settings_company_id 
  ON public.channel_member_settings(company_id);

-- channel_members
ALTER TABLE public.channel_members 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_channel_members_company_id 
  ON public.channel_members(company_id);

-- chat_archives
ALTER TABLE public.chat_archives 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chat_archives_company_id 
  ON public.chat_archives(company_id);

-- chat_notifications
ALTER TABLE public.chat_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_company_id 
  ON public.chat_notifications(company_id);

-- chats
ALTER TABLE public.chats 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_chats_company_id 
  ON public.chats(company_id);

-- communication_settings
ALTER TABLE public.communication_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_communication_settings_company_id 
  ON public.communication_settings(company_id);

-- ===== BATCH 8: COMPANY & COMPLIANCE TABELLEN =====

-- company_goals
ALTER TABLE public.company_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_company_goals_company_id 
  ON public.company_goals(company_id);

-- company_modules
ALTER TABLE public.company_modules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_company_modules_company_id 
  ON public.company_modules(company_id);

-- company_settings
ALTER TABLE public.company_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id 
  ON public.company_settings(company_id);

-- compensation_policies
ALTER TABLE public.compensation_policies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compensation_policies_company_id 
  ON public.compensation_policies(company_id);

-- competency_gaps
ALTER TABLE public.competency_gaps 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_competency_gaps_company_id 
  ON public.competency_gaps(company_id);

-- compliance_audits
ALTER TABLE public.compliance_audits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_company_id 
  ON public.compliance_audits(company_id);

-- compliance_cases
ALTER TABLE public.compliance_cases 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_cases_company_id 
  ON public.compliance_cases(company_id);

-- compliance_deadlines
ALTER TABLE public.compliance_deadlines 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_company_id 
  ON public.compliance_deadlines(company_id);

-- compliance_incidents
ALTER TABLE public.compliance_incidents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_incidents_company_id 
  ON public.compliance_incidents(company_id);

-- compliance_metrics
ALTER TABLE public.compliance_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_metrics_company_id 
  ON public.compliance_metrics(company_id);

-- compliance_policies
ALTER TABLE public.compliance_policies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_policies_company_id 
  ON public.compliance_policies(company_id);

-- compliance_regeln
ALTER TABLE public.compliance_regeln 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_regeln_company_id 
  ON public.compliance_regeln(company_id);

-- compliance_reports
ALTER TABLE public.compliance_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_company_id 
  ON public.compliance_reports(company_id);

-- compliance_requirements
ALTER TABLE public.compliance_requirements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_company_id 
  ON public.compliance_requirements(company_id);

-- compliance_risks
ALTER TABLE public.compliance_risks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_risks_company_id 
  ON public.compliance_risks(company_id);

-- compliance_tracking
ALTER TABLE public.compliance_tracking 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_compliance_tracking_company_id 
  ON public.compliance_tracking(company_id);

-- cost_centers
ALTER TABLE public.cost_centers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_company_id 
  ON public.cost_centers(company_id);

-- country_regulations
ALTER TABLE public.country_regulations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_country_regulations_company_id 
  ON public.country_regulations(company_id);

-- course_enrollments
ALTER TABLE public.course_enrollments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_company_id 
  ON public.course_enrollments(company_id);

-- courses
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_courses_company_id 
  ON public.courses(company_id);

-- cross_module_events
ALTER TABLE public.cross_module_events 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_cross_module_events_company_id 
  ON public.cross_module_events(company_id);

-- ===== BATCH 9: DASHBOARD TABELLEN =====

-- dashboard_ai_insights
ALTER TABLE public.dashboard_ai_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_ai_insights_company_id 
  ON public.dashboard_ai_insights(company_id);

-- dashboard_configs
ALTER TABLE public.dashboard_configs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_company_id 
  ON public.dashboard_configs(company_id);

-- dashboard_containers
ALTER TABLE public.dashboard_containers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_containers_company_id 
  ON public.dashboard_containers(company_id);

-- dashboard_data_sources
ALTER TABLE public.dashboard_data_sources 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_sources_company_id 
  ON public.dashboard_data_sources(company_id);

-- dashboard_layouts
ALTER TABLE public.dashboard_layouts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_company_id 
  ON public.dashboard_layouts(company_id);

-- dashboard_widget_types
ALTER TABLE public.dashboard_widget_types 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widget_types_company_id 
  ON public.dashboard_widget_types(company_id);

-- dashboard_widgets
ALTER TABLE public.dashboard_widgets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_company_id 
  ON public.dashboard_widgets(company_id);

-- debug_logs
ALTER TABLE public.debug_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_debug_logs_company_id 
  ON public.debug_logs(company_id);

-- ===== BATCH 10: DOCUMENT TABELLEN =====

-- document_access_logs
ALTER TABLE public.document_access_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_company_id 
  ON public.document_access_logs(company_id);

-- document_access_permissions
ALTER TABLE public.document_access_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_access_permissions_company_id 
  ON public.document_access_permissions(company_id);

-- document_approvals
ALTER TABLE public.document_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_approvals_company_id 
  ON public.document_approvals(company_id);

-- document_audit_trail
ALTER TABLE public.document_audit_trail 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_audit_trail_company_id 
  ON public.document_audit_trail(company_id);

-- document_automations
ALTER TABLE public.document_automations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_automations_company_id 
  ON public.document_automations(company_id);

-- document_category_settings
ALTER TABLE public.document_category_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_category_settings_company_id 
  ON public.document_category_settings(company_id);

-- document_comments
ALTER TABLE public.document_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_comments_company_id 
  ON public.document_comments(company_id);

-- document_favorites
ALTER TABLE public.document_favorites 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_favorites_company_id 
  ON public.document_favorites(company_id);

-- document_folder_links
ALTER TABLE public.document_folder_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_folder_links_company_id 
  ON public.document_folder_links(company_id);

-- document_folders
ALTER TABLE public.document_folders 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_folders_company_id 
  ON public.document_folders(company_id);

-- document_linking_rules
ALTER TABLE public.document_linking_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_linking_rules_company_id 
  ON public.document_linking_rules(company_id);

-- document_links
ALTER TABLE public.document_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_links_company_id 
  ON public.document_links(company_id);

-- document_notifications
ALTER TABLE public.document_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_company_id 
  ON public.document_notifications(company_id);

-- document_permissions
ALTER TABLE public.document_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_company_id 
  ON public.document_permissions(company_id);

-- document_project_links
ALTER TABLE public.document_project_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_project_links_company_id 
  ON public.document_project_links(company_id);

-- document_reminders
ALTER TABLE public.document_reminders 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_company_id 
  ON public.document_reminders(company_id);

-- document_reviews
ALTER TABLE public.document_reviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_company_id 
  ON public.document_reviews(company_id);

-- document_signatures
ALTER TABLE public.document_signatures 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_company_id 
  ON public.document_signatures(company_id);

-- document_task_links
ALTER TABLE public.document_task_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_task_links_company_id 
  ON public.document_task_links(company_id);

-- document_template_categories
ALTER TABLE public.document_template_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_template_categories_company_id 
  ON public.document_template_categories(company_id);

-- document_template_instances
ALTER TABLE public.document_template_instances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_template_instances_company_id 
  ON public.document_template_instances(company_id);

-- document_templates
ALTER TABLE public.document_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_templates_company_id 
  ON public.document_templates(company_id);

-- document_versions
ALTER TABLE public.document_versions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_versions_company_id 
  ON public.document_versions(company_id);

-- document_workflows
ALTER TABLE public.document_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_document_workflows_company_id 
  ON public.document_workflows(company_id);

-- dsgvo_access_logs
ALTER TABLE public.dsgvo_access_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_dsgvo_access_logs_company_id 
  ON public.dsgvo_access_logs(company_id);

-- ===== BATCH 11: EMPLOYEE TABELLEN (TEIL 1) =====

-- emission_factors
ALTER TABLE public.emission_factors 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_emission_factors_company_id 
  ON public.emission_factors(company_id);

-- employee_audit_logs
ALTER TABLE public.employee_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_audit_logs_company_id 
  ON public.employee_audit_logs(company_id);

-- employee_awards
ALTER TABLE public.employee_awards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_awards_company_id 
  ON public.employee_awards(company_id);

-- employee_benefit_allowances
ALTER TABLE public.employee_benefit_allowances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_benefit_allowances_company_id 
  ON public.employee_benefit_allowances(company_id);

-- employee_benefits
ALTER TABLE public.employee_benefits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_company_id 
  ON public.employee_benefits(company_id);

-- employee_certificates
ALTER TABLE public.employee_certificates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_certificates_company_id 
  ON public.employee_certificates(company_id);

-- employee_childcare_benefits
ALTER TABLE public.employee_childcare_benefits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_childcare_benefits_company_id 
  ON public.employee_childcare_benefits(company_id);

-- employee_compliance_records
ALTER TABLE public.employee_compliance_records 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_compliance_records_company_id 
  ON public.employee_compliance_records(company_id);

-- employee_connectivity_support
ALTER TABLE public.employee_connectivity_support 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_connectivity_support_company_id 
  ON public.employee_connectivity_support(company_id);

-- employee_contracts
ALTER TABLE public.employee_contracts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_contracts_company_id 
  ON public.employee_contracts(company_id);

-- employee_corporate_cards
ALTER TABLE public.employee_corporate_cards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_corporate_cards_company_id 
  ON public.employee_corporate_cards(company_id);

-- employee_desk_booking_entries
ALTER TABLE public.employee_desk_booking_entries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_desk_booking_entries_company_id 
  ON public.employee_desk_booking_entries(company_id);

-- employee_desk_bookings
ALTER TABLE public.employee_desk_bookings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_desk_bookings_company_id 
  ON public.employee_desk_bookings(company_id);

-- employee_development_goals
ALTER TABLE public.employee_development_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_development_goals_company_id 
  ON public.employee_development_goals(company_id);

-- employee_discount_usage
ALTER TABLE public.employee_discount_usage 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_discount_usage_company_id 
  ON public.employee_discount_usage(company_id);

-- employee_document_relations
ALTER TABLE public.employee_document_relations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_document_relations_company_id 
  ON public.employee_document_relations(company_id);

-- employee_document_types
ALTER TABLE public.employee_document_types 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_document_types_company_id 
  ON public.employee_document_types(company_id);

-- employee_documents
ALTER TABLE public.employee_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_company_id 
  ON public.employee_documents(company_id);

-- employee_emergency_contacts
ALTER TABLE public.employee_emergency_contacts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_emergency_contacts_company_id 
  ON public.employee_emergency_contacts(company_id);

-- employee_employment_info
ALTER TABLE public.employee_employment_info 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_employment_info_company_id 
  ON public.employee_employment_info(company_id);

-- employee_fitness_memberships
ALTER TABLE public.employee_fitness_memberships 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_fitness_memberships_company_id 
  ON public.employee_fitness_memberships(company_id);

-- employee_homeoffice_agreements
ALTER TABLE public.employee_homeoffice_agreements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_homeoffice_agreements_company_id 
  ON public.employee_homeoffice_agreements(company_id);

-- employee_hr_note_attachments
ALTER TABLE public.employee_hr_note_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_hr_note_attachments_company_id 
  ON public.employee_hr_note_attachments(company_id);

-- employee_hr_notes
ALTER TABLE public.employee_hr_notes 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_hr_notes_company_id 
  ON public.employee_hr_notes(company_id);

-- employee_kudos_summary
ALTER TABLE public.employee_kudos_summary 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_kudos_summary_company_id 
  ON public.employee_kudos_summary(company_id);

-- employee_languages
ALTER TABLE public.employee_languages 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_languages_company_id 
  ON public.employee_languages(company_id);

-- employee_personal_info
ALTER TABLE public.employee_personal_info 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_personal_info_company_id 
  ON public.employee_personal_info(company_id);

-- employee_potential_awards
ALTER TABLE public.employee_potential_awards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_potential_awards_company_id 
  ON public.employee_potential_awards(company_id);

-- employee_profile_fields
ALTER TABLE public.employee_profile_fields 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_profile_fields_company_id 
  ON public.employee_profile_fields(company_id);

-- employee_profile_templates
ALTER TABLE public.employee_profile_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_profile_templates_company_id 
  ON public.employee_profile_templates(company_id);

-- employee_project_achievements
ALTER TABLE public.employee_project_achievements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_project_achievements_company_id 
  ON public.employee_project_achievements(company_id);

-- employee_project_skills
ALTER TABLE public.employee_project_skills 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_project_skills_company_id 
  ON public.employee_project_skills(company_id);

-- employee_qualifications
ALTER TABLE public.employee_qualifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_qualifications_company_id 
  ON public.employee_qualifications(company_id);

-- employee_referrals
ALTER TABLE public.employee_referrals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_referrals_company_id 
  ON public.employee_referrals(company_id);

-- employee_remote_equipment
ALTER TABLE public.employee_remote_equipment 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_remote_equipment_company_id 
  ON public.employee_remote_equipment(company_id);

-- employee_remote_equipment_items
ALTER TABLE public.employee_remote_equipment_items 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_remote_equipment_items_company_id 
  ON public.employee_remote_equipment_items(company_id);

-- employee_remote_work_stats
ALTER TABLE public.employee_remote_work_stats 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_remote_work_stats_company_id 
  ON public.employee_remote_work_stats(company_id);

-- employee_salary_history
ALTER TABLE public.employee_salary_history 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_history_company_id 
  ON public.employee_salary_history(company_id);

-- employee_shift_preferences
ALTER TABLE public.employee_shift_preferences 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_shift_preferences_company_id 
  ON public.employee_shift_preferences(company_id);

-- employee_skills
ALTER TABLE public.employee_skills 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_company_id 
  ON public.employee_skills(company_id);

-- employee_task_activities
ALTER TABLE public.employee_task_activities 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_task_activities_company_id 
  ON public.employee_task_activities(company_id);

-- employee_tax_data
ALTER TABLE public.employee_tax_data 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_tax_data_company_id 
  ON public.employee_tax_data(company_id);

-- employee_team_awards
ALTER TABLE public.employee_team_awards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_team_awards_company_id 
  ON public.employee_team_awards(company_id);

-- employee_tenure_milestones
ALTER TABLE public.employee_tenure_milestones 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_tenure_milestones_company_id 
  ON public.employee_tenure_milestones(company_id);

-- employee_training_records
ALTER TABLE public.employee_training_records 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_training_records_company_id 
  ON public.employee_training_records(company_id);

-- employee_trainings
ALTER TABLE public.employee_trainings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_trainings_company_id 
  ON public.employee_trainings(company_id);

-- employee_vl_contracts
ALTER TABLE public.employee_vl_contracts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_vl_contracts_company_id 
  ON public.employee_vl_contracts(company_id);

-- employee_work_time_models
ALTER TABLE public.employee_work_time_models 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_work_time_models_company_id 
  ON public.employee_work_time_models(company_id);

-- employee_workation_summary
ALTER TABLE public.employee_workation_summary 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_workation_summary_company_id 
  ON public.employee_workation_summary(company_id);

-- employee_workations
ALTER TABLE public.employee_workations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_employee_workations_company_id 
  ON public.employee_workations(company_id);

-- ===== BATCH 12: ENVIRONMENT & ENTERPRISE =====

-- energy_consumption
ALTER TABLE public.energy_consumption 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_energy_consumption_company_id 
  ON public.energy_consumption(company_id);

-- enterprise_forecasts
ALTER TABLE public.enterprise_forecasts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_enterprise_forecasts_company_id 
  ON public.enterprise_forecasts(company_id);

-- environmental_certifications
ALTER TABLE public.environmental_certifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_environmental_certifications_company_id 
  ON public.environmental_certifications(company_id);

-- environmental_metrics
ALTER TABLE public.environmental_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_environmental_metrics_company_id 
  ON public.environmental_metrics(company_id);

-- equipment_assignments
ALTER TABLE public.equipment_assignments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_company_id 
  ON public.equipment_assignments(company_id);

-- escalation_policies
ALTER TABLE public.escalation_policies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_escalation_policies_company_id 
  ON public.escalation_policies(company_id);

-- escalation_rules
ALTER TABLE public.escalation_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_company_id 
  ON public.escalation_rules(company_id);

-- esg_dashboard_layouts
ALTER TABLE public.esg_dashboard_layouts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_esg_dashboard_layouts_company_id 
  ON public.esg_dashboard_layouts(company_id);

-- esg_data_sources
ALTER TABLE public.esg_data_sources 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_esg_data_sources_company_id 
  ON public.esg_data_sources(company_id);

-- esg_goals
ALTER TABLE public.esg_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_esg_goals_company_id 
  ON public.esg_goals(company_id);

-- esg_reports
ALTER TABLE public.esg_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_esg_reports_company_id 
  ON public.esg_reports(company_id);

-- event_attendees
ALTER TABLE public.event_attendees 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_company_id 
  ON public.event_attendees(company_id);

-- event_resources
ALTER TABLE public.event_resources 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_event_resources_company_id 
  ON public.event_resources(company_id);

-- excel_mapping_templates
ALTER TABLE public.excel_mapping_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_excel_mapping_templates_company_id 
  ON public.excel_mapping_templates(company_id);

-- executive_kpi_widgets
ALTER TABLE public.executive_kpi_widgets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_executive_kpi_widgets_company_id 
  ON public.executive_kpi_widgets(company_id);

-- ===== BATCH 13: EXPENSES =====

-- expense_analytics
ALTER TABLE public.expense_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_analytics_company_id 
  ON public.expense_analytics(company_id);

-- expense_attachments
ALTER TABLE public.expense_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_attachments_company_id 
  ON public.expense_attachments(company_id);

-- expense_audit_log
ALTER TABLE public.expense_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_audit_log_company_id 
  ON public.expense_audit_log(company_id);

-- expense_categories
ALTER TABLE public.expense_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_company_id 
  ON public.expense_categories(company_id);

-- expense_comments
ALTER TABLE public.expense_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_comments_company_id 
  ON public.expense_comments(company_id);

-- expense_documents
ALTER TABLE public.expense_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expense_documents_company_id 
  ON public.expense_documents(company_id);

-- expenses
ALTER TABLE public.expenses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id 
  ON public.expenses(company_id);

-- ===== BATCH 14: FAQ, FEEDBACK, FORECAST =====

-- faq_articles
ALTER TABLE public.faq_articles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_faq_articles_company_id 
  ON public.faq_articles(company_id);

-- faq_categories
ALTER TABLE public.faq_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_faq_categories_company_id 
  ON public.faq_categories(company_id);

-- feedback_requests
ALTER TABLE public.feedback_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_company_id 
  ON public.feedback_requests(company_id);

-- feedback_responses
ALTER TABLE public.feedback_responses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_company_id 
  ON public.feedback_responses(company_id);

-- feedback_reviews
ALTER TABLE public.feedback_reviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviews_company_id 
  ON public.feedback_reviews(company_id);

-- feiertagsregelungen
ALTER TABLE public.feiertagsregelungen 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_feiertagsregelungen_company_id 
  ON public.feiertagsregelungen(company_id);

-- field_permissions
ALTER TABLE public.field_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_field_permissions_company_id 
  ON public.field_permissions(company_id);

-- flight_details
ALTER TABLE public.flight_details 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_flight_details_company_id 
  ON public.flight_details(company_id);

-- folder_templates
ALTER TABLE public.folder_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_folder_templates_company_id 
  ON public.folder_templates(company_id);

-- forecast_ai_recommendations
ALTER TABLE public.forecast_ai_recommendations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_ai_recommendations_company_id 
  ON public.forecast_ai_recommendations(company_id);

-- forecast_ai_settings
ALTER TABLE public.forecast_ai_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_ai_settings_company_id 
  ON public.forecast_ai_settings(company_id);

-- forecast_approvals
ALTER TABLE public.forecast_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_approvals_company_id 
  ON public.forecast_approvals(company_id);

-- forecast_audit_logs
ALTER TABLE public.forecast_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_audit_logs_company_id 
  ON public.forecast_audit_logs(company_id);

-- forecast_dashboard_widgets
ALTER TABLE public.forecast_dashboard_widgets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_dashboard_widgets_company_id 
  ON public.forecast_dashboard_widgets(company_id);

-- forecast_data_connectors
ALTER TABLE public.forecast_data_connectors 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_data_connectors_company_id 
  ON public.forecast_data_connectors(company_id);

-- forecast_escalation_rules
ALTER TABLE public.forecast_escalation_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_escalation_rules_company_id 
  ON public.forecast_escalation_rules(company_id);

-- forecast_instances
ALTER TABLE public.forecast_instances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_instances_company_id 
  ON public.forecast_instances(company_id);

-- forecast_permissions
ALTER TABLE public.forecast_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_permissions_company_id 
  ON public.forecast_permissions(company_id);

-- forecast_reports
ALTER TABLE public.forecast_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_reports_company_id 
  ON public.forecast_reports(company_id);

-- forecast_risk_assessments
ALTER TABLE public.forecast_risk_assessments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_risk_assessments_company_id 
  ON public.forecast_risk_assessments(company_id);

-- forecast_scenarios
ALTER TABLE public.forecast_scenarios 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_scenarios_company_id 
  ON public.forecast_scenarios(company_id);

-- forecast_template_usage
ALTER TABLE public.forecast_template_usage 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_template_usage_company_id 
  ON public.forecast_template_usage(company_id);

-- forecast_template_versions
ALTER TABLE public.forecast_template_versions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_template_versions_company_id 
  ON public.forecast_template_versions(company_id);

-- forecast_templates
ALTER TABLE public.forecast_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_forecast_templates_company_id 
  ON public.forecast_templates(company_id);

-- genehmigungsworkflows
ALTER TABLE public.genehmigungsworkflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_genehmigungsworkflows_company_id 
  ON public.genehmigungsworkflows(company_id);

-- ===== BATCH 15: GLOBAL MOBILITY =====

-- global_mobility_assignments
ALTER TABLE public.global_mobility_assignments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_assignments_company_id 
  ON public.global_mobility_assignments(company_id);

-- global_mobility_compliance
ALTER TABLE public.global_mobility_compliance 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_compliance_company_id 
  ON public.global_mobility_compliance(company_id);

-- global_mobility_documents
ALTER TABLE public.global_mobility_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_documents_company_id 
  ON public.global_mobility_documents(company_id);

-- global_mobility_policy_exceptions
ALTER TABLE public.global_mobility_policy_exceptions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_policy_exceptions_company_id 
  ON public.global_mobility_policy_exceptions(company_id);

-- global_mobility_requests
ALTER TABLE public.global_mobility_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_requests_company_id 
  ON public.global_mobility_requests(company_id);

-- global_mobility_visa_applications
ALTER TABLE public.global_mobility_visa_applications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_mobility_visa_applications_company_id 
  ON public.global_mobility_visa_applications(company_id);

-- global_settings
ALTER TABLE public.global_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_global_settings_company_id 
  ON public.global_settings(company_id);

-- ===== BATCH 16: GOALS =====

-- goal_activities
ALTER TABLE public.goal_activities 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_activities_company_id 
  ON public.goal_activities(company_id);

-- goal_attachments
ALTER TABLE public.goal_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_attachments_company_id 
  ON public.goal_attachments(company_id);

-- goal_audit_log
ALTER TABLE public.goal_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_audit_log_company_id 
  ON public.goal_audit_log(company_id);

-- goal_comments
ALTER TABLE public.goal_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_comments_company_id 
  ON public.goal_comments(company_id);

-- goal_milestones
ALTER TABLE public.goal_milestones 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_company_id 
  ON public.goal_milestones(company_id);

-- goal_template_categories
ALTER TABLE public.goal_template_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_template_categories_company_id 
  ON public.goal_template_categories(company_id);

-- goal_template_usage
ALTER TABLE public.goal_template_usage 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_template_usage_company_id 
  ON public.goal_template_usage(company_id);

-- goal_templates
ALTER TABLE public.goal_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_goal_templates_company_id 
  ON public.goal_templates(company_id);

-- granular_permissions
ALTER TABLE public.granular_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_granular_permissions_company_id 
  ON public.granular_permissions(company_id);

-- ===== BATCH 17: GREEN & SUSTAINABILITY =====

-- green_challenges
ALTER TABLE public.green_challenges 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_challenges_company_id 
  ON public.green_challenges(company_id);

-- green_ideas
ALTER TABLE public.green_ideas 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_ideas_company_id 
  ON public.green_ideas(company_id);

-- green_initiative_progress
ALTER TABLE public.green_initiative_progress 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_initiative_progress_company_id 
  ON public.green_initiative_progress(company_id);

-- green_initiative_tasks
ALTER TABLE public.green_initiative_tasks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_initiative_tasks_company_id 
  ON public.green_initiative_tasks(company_id);

-- green_initiative_team_members
ALTER TABLE public.green_initiative_team_members 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_initiative_team_members_company_id 
  ON public.green_initiative_team_members(company_id);

-- green_initiatives
ALTER TABLE public.green_initiatives 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_green_initiatives_company_id 
  ON public.green_initiatives(company_id);

-- ===== BATCH 18: HELPDESK & HR =====

-- helpdesk_attachments
ALTER TABLE public.helpdesk_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_attachments_company_id 
  ON public.helpdesk_attachments(company_id);

-- helpdesk_audit_log
ALTER TABLE public.helpdesk_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_audit_log_company_id 
  ON public.helpdesk_audit_log(company_id);

-- helpdesk_comments
ALTER TABLE public.helpdesk_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_comments_company_id 
  ON public.helpdesk_comments(company_id);

-- helpdesk_surveys
ALTER TABLE public.helpdesk_surveys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_surveys_company_id 
  ON public.helpdesk_surveys(company_id);

-- holidays
ALTER TABLE public.holidays 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_holidays_company_id 
  ON public.holidays(company_id);

-- hr_dynamic_roles
ALTER TABLE public.hr_dynamic_roles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_dynamic_roles_company_id 
  ON public.hr_dynamic_roles(company_id);

-- hr_fleet_assignments
ALTER TABLE public.hr_fleet_assignments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_fleet_assignments_company_id 
  ON public.hr_fleet_assignments(company_id);

-- hr_fleet_vehicles
ALTER TABLE public.hr_fleet_vehicles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_fleet_vehicles_company_id 
  ON public.hr_fleet_vehicles(company_id);

-- hr_survey_responses
ALTER TABLE public.hr_survey_responses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_survey_responses_company_id 
  ON public.hr_survey_responses(company_id);

-- hr_surveys
ALTER TABLE public.hr_surveys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_surveys_company_id 
  ON public.hr_surveys(company_id);

-- hr_training_courses
ALTER TABLE public.hr_training_courses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_training_courses_company_id 
  ON public.hr_training_courses(company_id);

-- hr_validation_logs
ALTER TABLE public.hr_validation_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_hr_validation_logs_company_id 
  ON public.hr_validation_logs(company_id);

-- ===== BATCH 19: IMPERSONATION & INNOVATION =====

-- impersonation_audit_logs
ALTER TABLE public.impersonation_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_impersonation_audit_logs_company_id 
  ON public.impersonation_audit_logs(company_id);

-- impersonation_sessions
ALTER TABLE public.impersonation_sessions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_company_id 
  ON public.impersonation_sessions(company_id);

-- innovation_activities
ALTER TABLE public.innovation_activities 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_activities_company_id 
  ON public.innovation_activities(company_id);

-- innovation_ai_analysis
ALTER TABLE public.innovation_ai_analysis 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_ai_analysis_company_id 
  ON public.innovation_ai_analysis(company_id);

-- innovation_ai_insights
ALTER TABLE public.innovation_ai_insights 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_ai_insights_company_id 
  ON public.innovation_ai_insights(company_id);

-- innovation_approvals
ALTER TABLE public.innovation_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_approvals_company_id 
  ON public.innovation_approvals(company_id);

-- innovation_comments
ALTER TABLE public.innovation_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_comments_company_id 
  ON public.innovation_comments(company_id);

-- innovation_ideas
ALTER TABLE public.innovation_ideas 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_company_id 
  ON public.innovation_ideas(company_id);

-- innovation_ideas_inbox
ALTER TABLE public.innovation_ideas_inbox 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_inbox_company_id 
  ON public.innovation_ideas_inbox(company_id);

-- innovation_leaderboards
ALTER TABLE public.innovation_leaderboards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_leaderboards_company_id 
  ON public.innovation_leaderboards(company_id);

-- innovation_lifecycle_tracking
ALTER TABLE public.innovation_lifecycle_tracking 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_lifecycle_tracking_company_id 
  ON public.innovation_lifecycle_tracking(company_id);

-- innovation_settings
ALTER TABLE public.innovation_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_settings_company_id 
  ON public.innovation_settings(company_id);

-- innovation_team_discussions
ALTER TABLE public.innovation_team_discussions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_team_discussions_company_id 
  ON public.innovation_team_discussions(company_id);

-- innovation_votes
ALTER TABLE public.innovation_votes 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_company_id 
  ON public.innovation_votes(company_id);

-- innovation_workflows
ALTER TABLE public.innovation_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_innovation_workflows_company_id 
  ON public.innovation_workflows(company_id);

-- integration_settings
ALTER TABLE public.integration_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_integration_settings_company_id 
  ON public.integration_settings(company_id);

-- intelligent_notifications
ALTER TABLE public.intelligent_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_intelligent_notifications_company_id 
  ON public.intelligent_notifications(company_id);

-- ===== BATCH 20: INTERVIEWS & JOBS =====

-- interview_feedback
ALTER TABLE public.interview_feedback 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_company_id 
  ON public.interview_feedback(company_id);

-- interview_templates
ALTER TABLE public.interview_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_interview_templates_company_id 
  ON public.interview_templates(company_id);

-- interviews
ALTER TABLE public.interviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id 
  ON public.interviews(company_id);

-- job_applications
ALTER TABLE public.job_applications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id 
  ON public.job_applications(company_id);

-- job_postings
ALTER TABLE public.job_postings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_id 
  ON public.job_postings(company_id);

-- ===== BATCH 21: KNOWLEDGE & LEARNING =====

-- kb_usage_logs
ALTER TABLE public.kb_usage_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_kb_usage_logs_company_id 
  ON public.kb_usage_logs(company_id);

-- key_results
ALTER TABLE public.key_results 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_key_results_company_id 
  ON public.key_results(company_id);

-- ki_test_features
ALTER TABLE public.ki_test_features 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ki_test_features_company_id 
  ON public.ki_test_features(company_id);

-- knowledge_article_versions
ALTER TABLE public.knowledge_article_versions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_versions_company_id 
  ON public.knowledge_article_versions(company_id);

-- knowledge_articles
ALTER TABLE public.knowledge_articles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_company_id 
  ON public.knowledge_articles(company_id);

-- knowledge_attachments
ALTER TABLE public.knowledge_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_attachments_company_id 
  ON public.knowledge_attachments(company_id);

-- knowledge_categories
ALTER TABLE public.knowledge_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_company_id 
  ON public.knowledge_categories(company_id);

-- knowledge_comments
ALTER TABLE public.knowledge_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_comments_company_id 
  ON public.knowledge_comments(company_id);

-- knowledge_user_interactions
ALTER TABLE public.knowledge_user_interactions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_interactions_company_id 
  ON public.knowledge_user_interactions(company_id);

-- knowledge_workflow_instances
ALTER TABLE public.knowledge_workflow_instances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_workflow_instances_company_id 
  ON public.knowledge_workflow_instances(company_id);

-- knowledge_workflows
ALTER TABLE public.knowledge_workflows 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_knowledge_workflows_company_id 
  ON public.knowledge_workflows(company_id);

-- ===== BATCH 22: LOCATIONS & MARKETPLACE =====

-- language_preferences
ALTER TABLE public.language_preferences 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_language_preferences_company_id 
  ON public.language_preferences(company_id);

-- location_holidays
ALTER TABLE public.location_holidays 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_location_holidays_company_id 
  ON public.location_holidays(company_id);

-- location_overtime_settings
ALTER TABLE public.location_overtime_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_location_overtime_settings_company_id 
  ON public.location_overtime_settings(company_id);

-- mapbox_settings
ALTER TABLE public.mapbox_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_mapbox_settings_company_id 
  ON public.mapbox_settings(company_id);

-- marketplace_items
ALTER TABLE public.marketplace_items 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_company_id 
  ON public.marketplace_items(company_id);

-- ===== BATCH 23: MEETINGS & MENTORING =====

-- meeting_follow_ups
ALTER TABLE public.meeting_follow_ups 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_meeting_follow_ups_company_id 
  ON public.meeting_follow_ups(company_id);

-- meeting_participant_suggestions
ALTER TABLE public.meeting_participant_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_meeting_participant_suggestions_company_id 
  ON public.meeting_participant_suggestions(company_id);

-- meeting_rooms
ALTER TABLE public.meeting_rooms 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_meeting_rooms_company_id 
  ON public.meeting_rooms(company_id);

-- mentoring_relationships
ALTER TABLE public.mentoring_relationships 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_mentoring_relationships_company_id 
  ON public.mentoring_relationships(company_id);

-- ===== BATCH 24: MESSAGES =====

-- message_attachments
ALTER TABLE public.message_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_company_id 
  ON public.message_attachments(company_id);

-- message_bookmarks
ALTER TABLE public.message_bookmarks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_company_id 
  ON public.message_bookmarks(company_id);

-- message_reactions
ALTER TABLE public.message_reactions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_company_id 
  ON public.message_reactions(company_id);

-- message_read_receipts
ALTER TABLE public.message_read_receipts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_company_id 
  ON public.message_read_receipts(company_id);

-- message_translations
ALTER TABLE public.message_translations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_message_translations_company_id 
  ON public.message_translations(company_id);

-- messages
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_messages_company_id 
  ON public.messages(company_id);

-- mobile_providers
ALTER TABLE public.mobile_providers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_mobile_providers_company_id 
  ON public.mobile_providers(company_id);

-- modules
ALTER TABLE public.modules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_modules_company_id 
  ON public.modules(company_id);

-- ===== BATCH 25: NOTIFICATIONS & OBJECTIVES =====

-- notification_queue
ALTER TABLE public.notification_queue 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_company_id 
  ON public.notification_queue(company_id);

-- notifications
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id 
  ON public.notifications(company_id);

-- objective_approvals
ALTER TABLE public.objective_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_objective_approvals_company_id 
  ON public.objective_approvals(company_id);

-- objective_audit_trail
ALTER TABLE public.objective_audit_trail 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_objective_audit_trail_company_id 
  ON public.objective_audit_trail(company_id);

-- objective_comments
ALTER TABLE public.objective_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_objective_comments_company_id 
  ON public.objective_comments(company_id);

-- objective_suggestions
ALTER TABLE public.objective_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_objective_suggestions_company_id 
  ON public.objective_suggestions(company_id);

-- objective_templates
ALTER TABLE public.objective_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_objective_templates_company_id 
  ON public.objective_templates(company_id);

-- ===== BATCH 26: OFFBOARDING & ONBOARDING =====

-- offboarding_checklists
ALTER TABLE public.offboarding_checklists 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_offboarding_checklists_company_id 
  ON public.offboarding_checklists(company_id);

-- offboarding_exit_interviews
ALTER TABLE public.offboarding_exit_interviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_offboarding_exit_interviews_company_id 
  ON public.offboarding_exit_interviews(company_id);

-- office_locations
ALTER TABLE public.office_locations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_office_locations_company_id 
  ON public.office_locations(company_id);

-- onboarding_buddies
ALTER TABLE public.onboarding_buddies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_buddies_company_id 
  ON public.onboarding_buddies(company_id);

-- onboarding_checklists
ALTER TABLE public.onboarding_checklists 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_company_id 
  ON public.onboarding_checklists(company_id);

-- onboarding_documents
ALTER TABLE public.onboarding_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_documents_company_id 
  ON public.onboarding_documents(company_id);

-- onboarding_feedback
ALTER TABLE public.onboarding_feedback 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_feedback_company_id 
  ON public.onboarding_feedback(company_id);

-- onboarding_interviews
ALTER TABLE public.onboarding_interviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_interviews_company_id 
  ON public.onboarding_interviews(company_id);

-- onboarding_milestones
ALTER TABLE public.onboarding_milestones 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_milestones_company_id 
  ON public.onboarding_milestones(company_id);

-- onboarding_processes
ALTER TABLE public.onboarding_processes 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_company_id 
  ON public.onboarding_processes(company_id);

-- onboarding_tasks
ALTER TABLE public.onboarding_tasks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_company_id 
  ON public.onboarding_tasks(company_id);

-- onboarding_templates
ALTER TABLE public.onboarding_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_company_id 
  ON public.onboarding_templates(company_id);

-- ===== BATCH 27: ORGANIZATION =====

-- organisationseinheit_zuweisungen
ALTER TABLE public.organisationseinheit_zuweisungen 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_organisationseinheit_zuweisungen_company_id 
  ON public.organisationseinheit_zuweisungen(company_id);

-- organizational_config
ALTER TABLE public.organizational_config 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_organizational_config_company_id 
  ON public.organizational_config(company_id);

-- organizational_roles
ALTER TABLE public.organizational_roles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_organizational_roles_company_id 
  ON public.organizational_roles(company_id);

-- organizational_units
ALTER TABLE public.organizational_units 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_organizational_units_company_id 
  ON public.organizational_units(company_id);

-- overtime_entries
ALTER TABLE public.overtime_entries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_overtime_entries_company_id 
  ON public.overtime_entries(company_id);

-- overtime_payouts
ALTER TABLE public.overtime_payouts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_overtime_payouts_company_id 
  ON public.overtime_payouts(company_id);

-- overtime_thresholds
ALTER TABLE public.overtime_thresholds 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_overtime_thresholds_company_id 
  ON public.overtime_thresholds(company_id);

-- pausenregelungen
ALTER TABLE public.pausenregelungen 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pausenregelungen_company_id 
  ON public.pausenregelungen(company_id);

-- ===== BATCH 28: PAYROLL =====

-- payroll_calculations
ALTER TABLE public.payroll_calculations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payroll_calculations_company_id 
  ON public.payroll_calculations(company_id);

-- payroll_export_configs
ALTER TABLE public.payroll_export_configs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payroll_export_configs_company_id 
  ON public.payroll_export_configs(company_id);

-- payroll_exports
ALTER TABLE public.payroll_exports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_company_id 
  ON public.payroll_exports(company_id);

-- payroll_periods
ALTER TABLE public.payroll_periods 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_company_id 
  ON public.payroll_periods(company_id);

-- payroll_warnings
ALTER TABLE public.payroll_warnings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payroll_warnings_company_id 
  ON public.payroll_warnings(company_id);

-- payslips
ALTER TABLE public.payslips 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_payslips_company_id 
  ON public.payslips(company_id);

-- peer_rewards
ALTER TABLE public.peer_rewards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_peer_rewards_company_id 
  ON public.peer_rewards(company_id);

-- ===== BATCH 29: PERFORMANCE =====

-- performance_analytics
ALTER TABLE public.performance_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_company_id 
  ON public.performance_analytics(company_id);

-- performance_calibrations
ALTER TABLE public.performance_calibrations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_calibrations_company_id 
  ON public.performance_calibrations(company_id);

-- performance_comments
ALTER TABLE public.performance_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_comments_company_id 
  ON public.performance_comments(company_id);

-- performance_criteria
ALTER TABLE public.performance_criteria 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_criteria_company_id 
  ON public.performance_criteria(company_id);

-- performance_cycles
ALTER TABLE public.performance_cycles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_cycles_company_id 
  ON public.performance_cycles(company_id);

-- performance_goal_links
ALTER TABLE public.performance_goal_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_goal_links_company_id 
  ON public.performance_goal_links(company_id);

-- performance_nine_box
ALTER TABLE public.performance_nine_box 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_nine_box_company_id 
  ON public.performance_nine_box(company_id);

-- performance_notifications
ALTER TABLE public.performance_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_notifications_company_id 
  ON public.performance_notifications(company_id);

-- performance_reviews
ALTER TABLE public.performance_reviews 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_company_id 
  ON public.performance_reviews(company_id);

-- performance_templates
ALTER TABLE public.performance_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_performance_templates_company_id 
  ON public.performance_templates(company_id);

-- ===== BATCH 30: PERMISSIONS =====

-- permission_actions
ALTER TABLE public.permission_actions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_actions_company_id 
  ON public.permission_actions(company_id);

-- permission_audit_log
ALTER TABLE public.permission_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_company_id 
  ON public.permission_audit_log(company_id);

-- permission_hierarchy
ALTER TABLE public.permission_hierarchy 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_hierarchy_company_id 
  ON public.permission_hierarchy(company_id);

-- permission_modules
ALTER TABLE public.permission_modules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_modules_company_id 
  ON public.permission_modules(company_id);

-- permission_templates
ALTER TABLE public.permission_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_templates_company_id 
  ON public.permission_templates(company_id);

-- permission_ui_elements
ALTER TABLE public.permission_ui_elements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permission_ui_elements_company_id 
  ON public.permission_ui_elements(company_id);

-- permissions
ALTER TABLE public.permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_permissions_company_id 
  ON public.permissions(company_id);

-- personal_goals
ALTER TABLE public.personal_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_personal_goals_company_id 
  ON public.personal_goals(company_id);

-- pilot_projects
ALTER TABLE public.pilot_projects 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_pilot_projects_company_id 
  ON public.pilot_projects(company_id);

-- ===== BATCH 31: POLICIES =====

-- policy_acknowledgments
ALTER TABLE public.policy_acknowledgments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_company_id 
  ON public.policy_acknowledgments(company_id);

-- policy_conflicts
ALTER TABLE public.policy_conflicts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_policy_conflicts_company_id 
  ON public.policy_conflicts(company_id);

-- policy_enforcement_logs
ALTER TABLE public.policy_enforcement_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_policy_enforcement_logs_company_id 
  ON public.policy_enforcement_logs(company_id);

-- policy_sync_events
ALTER TABLE public.policy_sync_events 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_policy_sync_events_company_id 
  ON public.policy_sync_events(company_id);

-- policy_templates
ALTER TABLE public.policy_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_policy_templates_company_id 
  ON public.policy_templates(company_id);

-- profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id 
  ON public.profiles(company_id);

-- ===== BATCH 32: PROGRAMS & PROJECTS =====

-- program_projects
ALTER TABLE public.program_projects 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_program_projects_company_id 
  ON public.program_projects(company_id);

-- programs
ALTER TABLE public.programs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_programs_company_id 
  ON public.programs(company_id);

-- project_activities
ALTER TABLE public.project_activities 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_activities_company_id 
  ON public.project_activities(company_id);

-- project_approvals
ALTER TABLE public.project_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_approvals_company_id 
  ON public.project_approvals(company_id);

-- project_assignments
ALTER TABLE public.project_assignments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_company_id 
  ON public.project_assignments(company_id);

-- project_budget_details
ALTER TABLE public.project_budget_details 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_budget_details_company_id 
  ON public.project_budget_details(company_id);

-- project_budget_entries
ALTER TABLE public.project_budget_entries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_budget_entries_company_id 
  ON public.project_budget_entries(company_id);

-- project_categories
ALTER TABLE public.project_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_categories_company_id 
  ON public.project_categories(company_id);

-- project_channels
ALTER TABLE public.project_channels 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_channels_company_id 
  ON public.project_channels(company_id);

-- project_comments
ALTER TABLE public.project_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_comments_company_id 
  ON public.project_comments(company_id);

-- project_documents
ALTER TABLE public.project_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_documents_company_id 
  ON public.project_documents(company_id);

-- project_forecast_files
ALTER TABLE public.project_forecast_files 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_forecast_files_company_id 
  ON public.project_forecast_files(company_id);

-- project_key_results
ALTER TABLE public.project_key_results 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_key_results_company_id 
  ON public.project_key_results(company_id);

-- project_milestones
ALTER TABLE public.project_milestones 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_company_id 
  ON public.project_milestones(company_id);

-- project_module_links
ALTER TABLE public.project_module_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_module_links_company_id 
  ON public.project_module_links(company_id);

-- project_objectives
ALTER TABLE public.project_objectives 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_objectives_company_id 
  ON public.project_objectives(company_id);

-- project_predictions
ALTER TABLE public.project_predictions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_predictions_company_id 
  ON public.project_predictions(company_id);

-- project_roles
ALTER TABLE public.project_roles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_roles_company_id 
  ON public.project_roles(company_id);

-- project_tasks
ALTER TABLE public.project_tasks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_company_id 
  ON public.project_tasks(company_id);

-- project_templates
ALTER TABLE public.project_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_templates_company_id 
  ON public.project_templates(company_id);

-- project_time_blocks
ALTER TABLE public.project_time_blocks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_time_blocks_company_id 
  ON public.project_time_blocks(company_id);

-- project_views
ALTER TABLE public.project_views 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_project_views_company_id 
  ON public.project_views(company_id);

-- prompts
ALTER TABLE public.prompts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_prompts_company_id 
  ON public.prompts(company_id);

-- public_holidays
ALTER TABLE public.public_holidays 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_public_holidays_company_id 
  ON public.public_holidays(company_id);

-- ===== BATCH 33: RECRUITING & REPORTS =====

-- recruiting_reminders
ALTER TABLE public.recruiting_reminders 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_recruiting_reminders_company_id 
  ON public.recruiting_reminders(company_id);

-- report_attachments
ALTER TABLE public.report_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_report_attachments_company_id 
  ON public.report_attachments(company_id);

-- report_audit_log
ALTER TABLE public.report_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_report_audit_log_company_id 
  ON public.report_audit_log(company_id);

-- report_comments
ALTER TABLE public.report_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_report_comments_company_id 
  ON public.report_comments(company_id);

-- reports
ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_reports_company_id 
  ON public.reports(company_id);

-- ===== BATCH 34: REWARDS =====

-- reward_budget_tracking
ALTER TABLE public.reward_budget_tracking 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_reward_budget_tracking_company_id 
  ON public.reward_budget_tracking(company_id);

-- reward_campaigns
ALTER TABLE public.reward_campaigns 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_reward_campaigns_company_id 
  ON public.reward_campaigns(company_id);

-- reward_instances
ALTER TABLE public.reward_instances 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_reward_instances_company_id 
  ON public.reward_instances(company_id);

-- reward_templates
ALTER TABLE public.reward_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_reward_templates_company_id 
  ON public.reward_templates(company_id);

-- ===== BATCH 35: ROADMAPS =====

-- roadmap_approvals
ALTER TABLE public.roadmap_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_approvals_company_id 
  ON public.roadmap_approvals(company_id);

-- roadmap_audit_log
ALTER TABLE public.roadmap_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_audit_log_company_id 
  ON public.roadmap_audit_log(company_id);

-- roadmap_comments
ALTER TABLE public.roadmap_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_comments_company_id 
  ON public.roadmap_comments(company_id);

-- roadmap_goals
ALTER TABLE public.roadmap_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_goals_company_id 
  ON public.roadmap_goals(company_id);

-- roadmap_links
ALTER TABLE public.roadmap_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_links_company_id 
  ON public.roadmap_links(company_id);

-- roadmap_milestones
ALTER TABLE public.roadmap_milestones 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_company_id 
  ON public.roadmap_milestones(company_id);

-- roadmap_module_links
ALTER TABLE public.roadmap_module_links 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_module_links_company_id 
  ON public.roadmap_module_links(company_id);

-- roadmap_planning
ALTER TABLE public.roadmap_planning 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_company_id 
  ON public.roadmap_planning(company_id);

-- roadmap_planning_boards
ALTER TABLE public.roadmap_planning_boards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_boards_company_id 
  ON public.roadmap_planning_boards(company_id);

-- roadmap_planning_cards
ALTER TABLE public.roadmap_planning_cards 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_cards_company_id 
  ON public.roadmap_planning_cards(company_id);

-- roadmap_planning_comments
ALTER TABLE public.roadmap_planning_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_comments_company_id 
  ON public.roadmap_planning_comments(company_id);

-- roadmap_planning_containers
ALTER TABLE public.roadmap_planning_containers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_containers_company_id 
  ON public.roadmap_planning_containers(company_id);

-- roadmap_planning_sub_containers
ALTER TABLE public.roadmap_planning_sub_containers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_sub_containers_company_id 
  ON public.roadmap_planning_sub_containers(company_id);

-- roadmap_planning_subtasks
ALTER TABLE public.roadmap_planning_subtasks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_subtasks_company_id 
  ON public.roadmap_planning_subtasks(company_id);

-- roadmap_planning_tasks
ALTER TABLE public.roadmap_planning_tasks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_tasks_company_id 
  ON public.roadmap_planning_tasks(company_id);

-- roadmap_planning_team_members
ALTER TABLE public.roadmap_planning_team_members 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_planning_team_members_company_id 
  ON public.roadmap_planning_team_members(company_id);

-- roadmap_predictions
ALTER TABLE public.roadmap_predictions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_predictions_company_id 
  ON public.roadmap_predictions(company_id);

-- roadmap_risks
ALTER TABLE public.roadmap_risks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_risks_company_id 
  ON public.roadmap_risks(company_id);

-- roadmap_versions
ALTER TABLE public.roadmap_versions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmap_versions_company_id 
  ON public.roadmap_versions(company_id);

-- roadmaps
ALTER TABLE public.roadmaps 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_company_id 
  ON public.roadmaps(company_id);

-- ===== BATCH 36: ROLES =====

-- role_permission_matrix
ALTER TABLE public.role_permission_matrix 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_role_permission_matrix_company_id 
  ON public.role_permission_matrix(company_id);

-- role_permissions
ALTER TABLE public.role_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_company_id 
  ON public.role_permissions(company_id);

-- role_templates
ALTER TABLE public.role_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_role_templates_company_id 
  ON public.role_templates(company_id);

-- roles
ALTER TABLE public.roles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_roles_company_id 
  ON public.roles(company_id);

-- room_bookings
ALTER TABLE public.room_bookings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_company_id 
  ON public.room_bookings(company_id);

-- ===== BATCH 37: SALARY =====

-- salary_benchmarks
ALTER TABLE public.salary_benchmarks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_company_id 
  ON public.salary_benchmarks(company_id);

-- salary_benefits
ALTER TABLE public.salary_benefits 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_salary_benefits_company_id 
  ON public.salary_benefits(company_id);

-- salary_components
ALTER TABLE public.salary_components 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_salary_components_company_id 
  ON public.salary_components(company_id);

-- salary_reports
ALTER TABLE public.salary_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_salary_reports_company_id 
  ON public.salary_reports(company_id);

-- salary_simulations
ALTER TABLE public.salary_simulations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_salary_simulations_company_id 
  ON public.salary_simulations(company_id);

-- ===== BATCH 38: SECURITY =====

-- security_audit_logs
ALTER TABLE public.security_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_company_id 
  ON public.security_audit_logs(company_id);

-- security_notifications
ALTER TABLE public.security_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_security_notifications_company_id 
  ON public.security_notifications(company_id);

-- security_threats
ALTER TABLE public.security_threats 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_security_threats_company_id 
  ON public.security_threats(company_id);

-- sensitive_operations_log
ALTER TABLE public.sensitive_operations_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sensitive_operations_log_company_id 
  ON public.sensitive_operations_log(company_id);

-- ===== BATCH 39: SETTINGS =====

-- settings_audit_log
ALTER TABLE public.settings_audit_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_company_id 
  ON public.settings_audit_log(company_id);

-- settings_company
ALTER TABLE public.settings_company 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_company_company_id 
  ON public.settings_company(company_id);

-- settings_configurations
ALTER TABLE public.settings_configurations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_configurations_company_id 
  ON public.settings_configurations(company_id);

-- settings_definitions
ALTER TABLE public.settings_definitions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_definitions_company_id 
  ON public.settings_definitions(company_id);

-- settings_documents
ALTER TABLE public.settings_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_documents_company_id 
  ON public.settings_documents(company_id);

-- settings_integrations
ALTER TABLE public.settings_integrations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_integrations_company_id 
  ON public.settings_integrations(company_id);

-- settings_notifications
ALTER TABLE public.settings_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_notifications_company_id 
  ON public.settings_notifications(company_id);

-- settings_presets
ALTER TABLE public.settings_presets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_presets_company_id 
  ON public.settings_presets(company_id);

-- settings_recruitment
ALTER TABLE public.settings_recruitment 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_recruitment_company_id 
  ON public.settings_recruitment(company_id);

-- settings_values
ALTER TABLE public.settings_values 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_settings_values_company_id 
  ON public.settings_values(company_id);

-- ===== BATCH 40: SHIFTS =====

-- shift_changes_log
ALTER TABLE public.shift_changes_log 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_shift_changes_log_company_id 
  ON public.shift_changes_log(company_id);

-- shift_requirements
ALTER TABLE public.shift_requirements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_shift_requirements_company_id 
  ON public.shift_requirements(company_id);

-- shift_rules
ALTER TABLE public.shift_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_shift_rules_company_id 
  ON public.shift_rules(company_id);

-- shift_types
ALTER TABLE public.shift_types 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_shift_types_company_id 
  ON public.shift_types(company_id);

-- shifts
ALTER TABLE public.shifts 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_shifts_company_id 
  ON public.shifts(company_id);

-- ===== BATCH 41: SICK LEAVE =====

-- sick_leave_details
ALTER TABLE public.sick_leave_details 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sick_leave_details_company_id 
  ON public.sick_leave_details(company_id);

-- sick_leave_documents
ALTER TABLE public.sick_leave_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sick_leave_documents_company_id 
  ON public.sick_leave_documents(company_id);

-- sick_pay_events
ALTER TABLE public.sick_pay_events 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sick_pay_events_company_id 
  ON public.sick_pay_events(company_id);

-- ===== BATCH 42: SKILLS & SCHEDULING =====

-- skill_requirements
ALTER TABLE public.skill_requirements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_skill_requirements_company_id 
  ON public.skill_requirements(company_id);

-- skills
ALTER TABLE public.skills 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_skills_company_id 
  ON public.skills(company_id);

-- smart_scheduling_suggestions
ALTER TABLE public.smart_scheduling_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_smart_scheduling_suggestions_company_id 
  ON public.smart_scheduling_suggestions(company_id);

-- standorte
ALTER TABLE public.standorte 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_standorte_company_id 
  ON public.standorte(company_id);

-- subsidiaries
ALTER TABLE public.subsidiaries 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_subsidiaries_company_id 
  ON public.subsidiaries(company_id);

-- succession_planning
ALTER TABLE public.succession_planning 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_succession_planning_company_id 
  ON public.succession_planning(company_id);

-- ===== BATCH 43: SUPPLIERS & SUPPLY CHAIN =====

-- suppliers
ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id 
  ON public.suppliers(company_id);

-- supply_chain_sustainability
ALTER TABLE public.supply_chain_sustainability 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_sustainability_company_id 
  ON public.supply_chain_sustainability(company_id);

-- support_ticket_comments
ALTER TABLE public.support_ticket_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_company_id 
  ON public.support_ticket_comments(company_id);

-- ===== BATCH 44: SURVEYS =====

-- survey_responses
ALTER TABLE public.survey_responses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_company_id 
  ON public.survey_responses(company_id);

-- surveys
ALTER TABLE public.surveys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_surveys_company_id 
  ON public.surveys(company_id);

-- ===== BATCH 45: SUSTAINABILITY =====

-- sustainability_goals
ALTER TABLE public.sustainability_goals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_goals_company_id 
  ON public.sustainability_goals(company_id);

-- sustainability_projects
ALTER TABLE public.sustainability_projects 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_projects_company_id 
  ON public.sustainability_projects(company_id);

-- sustainability_report_templates
ALTER TABLE public.sustainability_report_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_report_templates_company_id 
  ON public.sustainability_report_templates(company_id);

-- sustainability_reports
ALTER TABLE public.sustainability_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_reports_company_id 
  ON public.sustainability_reports(company_id);

-- sustainability_suggestions
ALTER TABLE public.sustainability_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_suggestions_company_id 
  ON public.sustainability_suggestions(company_id);

-- sustainability_surveys
ALTER TABLE public.sustainability_surveys 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_sustainability_surveys_company_id 
  ON public.sustainability_surveys(company_id);

-- system_notifications
ALTER TABLE public.system_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_company_id 
  ON public.system_notifications(company_id);

-- ===== BATCH 46: TALENT & TASKS =====

-- talent_pool_status
ALTER TABLE public.talent_pool_status 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_status_company_id 
  ON public.talent_pool_status(company_id);

-- task_notifications
ALTER TABLE public.task_notifications 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_company_id 
  ON public.task_notifications(company_id);

-- team_members
ALTER TABLE public.team_members 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_team_members_company_id 
  ON public.team_members(company_id);

-- ===== BATCH 47: TICKETS =====

-- ticket_attachments
ALTER TABLE public.ticket_attachments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_company_id 
  ON public.ticket_attachments(company_id);

-- ticket_automation_rules
ALTER TABLE public.ticket_automation_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_automation_rules_company_id 
  ON public.ticket_automation_rules(company_id);

-- ticket_categories
ALTER TABLE public.ticket_categories 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_categories_company_id 
  ON public.ticket_categories(company_id);

-- ticket_comments
ALTER TABLE public.ticket_comments 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_company_id 
  ON public.ticket_comments(company_id);

-- ticket_escalations
ALTER TABLE public.ticket_escalations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_escalations_company_id 
  ON public.ticket_escalations(company_id);

-- ticket_metrics
ALTER TABLE public.ticket_metrics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_metrics_company_id 
  ON public.ticket_metrics(company_id);

-- ticket_sla_policies
ALTER TABLE public.ticket_sla_policies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_sla_policies_company_id 
  ON public.ticket_sla_policies(company_id);

-- ticket_templates
ALTER TABLE public.ticket_templates 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_company_id 
  ON public.ticket_templates(company_id);

-- ===== BATCH 48: TIME TRACKING =====

-- time_entry_audit_logs
ALTER TABLE public.time_entry_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_time_entry_audit_logs_company_id 
  ON public.time_entry_audit_logs(company_id);

-- time_entry_breaks
ALTER TABLE public.time_entry_breaks 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_time_entry_breaks_company_id 
  ON public.time_entry_breaks(company_id);

-- time_entry_corrections
ALTER TABLE public.time_entry_corrections 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_time_entry_corrections_company_id 
  ON public.time_entry_corrections(company_id);

-- time_off_in_lieu_requests
ALTER TABLE public.time_off_in_lieu_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_time_off_in_lieu_requests_company_id 
  ON public.time_off_in_lieu_requests(company_id);

-- ===== BATCH 49: TRAINING =====

-- training_documents
ALTER TABLE public.training_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_training_documents_company_id 
  ON public.training_documents(company_id);

-- training_recommendations
ALTER TABLE public.training_recommendations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_training_recommendations_company_id 
  ON public.training_recommendations(company_id);

-- training_requests
ALTER TABLE public.training_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_training_requests_company_id 
  ON public.training_requests(company_id);

-- training_sessions
ALTER TABLE public.training_sessions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_company_id 
  ON public.training_sessions(company_id);

-- translations
ALTER TABLE public.translations 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_translations_company_id 
  ON public.translations(company_id);

-- ===== BATCH 50: TRAVEL =====

-- travel_ai_suggestions
ALTER TABLE public.travel_ai_suggestions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_ai_suggestions_company_id 
  ON public.travel_ai_suggestions(company_id);

-- travel_analytics
ALTER TABLE public.travel_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_analytics_company_id 
  ON public.travel_analytics(company_id);

-- travel_approvals
ALTER TABLE public.travel_approvals 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_approvals_company_id 
  ON public.travel_approvals(company_id);

-- travel_documents
ALTER TABLE public.travel_documents 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_company_id 
  ON public.travel_documents(company_id);

-- travel_map_pins
ALTER TABLE public.travel_map_pins 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_map_pins_company_id 
  ON public.travel_map_pins(company_id);

-- travel_policies
ALTER TABLE public.travel_policies 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_policies_company_id 
  ON public.travel_policies(company_id);

-- travel_requests
ALTER TABLE public.travel_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_company_id 
  ON public.travel_requests(company_id);

-- travel_role_definitions
ALTER TABLE public.travel_role_definitions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_role_definitions_company_id 
  ON public.travel_role_definitions(company_id);

-- travel_role_permissions
ALTER TABLE public.travel_role_permissions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_travel_role_permissions_company_id 
  ON public.travel_role_permissions(company_id);

-- ===== BATCH 51: GERMAN TABLES =====

-- ueberstunden_regelungen
ALTER TABLE public.ueberstunden_regelungen 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ueberstunden_regelungen_company_id 
  ON public.ueberstunden_regelungen(company_id);

-- ueberstundenregelungen
ALTER TABLE public.ueberstundenregelungen 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_ueberstundenregelungen_company_id 
  ON public.ueberstundenregelungen(company_id);

-- ===== BATCH 52: USER TABLES =====

-- user_account_status
ALTER TABLE public.user_account_status 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_account_status_company_id 
  ON public.user_account_status(company_id);

-- user_achievements
ALTER TABLE public.user_achievements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_company_id 
  ON public.user_achievements(company_id);

-- user_calendar_settings
ALTER TABLE public.user_calendar_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_settings_company_id 
  ON public.user_calendar_settings(company_id);

-- user_dashboard_configs
ALTER TABLE public.user_dashboard_configs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_configs_company_id 
  ON public.user_dashboard_configs(company_id);

-- user_login_history
ALTER TABLE public.user_login_history 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_company_id 
  ON public.user_login_history(company_id);

-- user_mfa_settings
ALTER TABLE public.user_mfa_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_company_id 
  ON public.user_mfa_settings(company_id);

-- user_permission_overrides
ALTER TABLE public.user_permission_overrides 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_company_id 
  ON public.user_permission_overrides(company_id);

-- user_points
ALTER TABLE public.user_points 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_points_company_id 
  ON public.user_points(company_id);

-- user_policy_overrides
ALTER TABLE public.user_policy_overrides 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_policy_overrides_company_id 
  ON public.user_policy_overrides(company_id);

-- user_presence
ALTER TABLE public.user_presence 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_presence_company_id 
  ON public.user_presence(company_id);

-- user_role_preview_sessions
ALTER TABLE public.user_role_preview_sessions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_role_preview_sessions_company_id 
  ON public.user_role_preview_sessions(company_id);

-- user_security_settings
ALTER TABLE public.user_security_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_company_id 
  ON public.user_security_settings(company_id);

-- user_sessions
ALTER TABLE public.user_sessions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_company_id 
  ON public.user_sessions(company_id);

-- user_tenant_sessions
ALTER TABLE public.user_tenant_sessions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_sessions_company_id 
  ON public.user_tenant_sessions(company_id);

-- ===== BATCH 53: VACATION & VEHICLES =====

-- vacation_requests
ALTER TABLE public.vacation_requests 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_company_id 
  ON public.vacation_requests(company_id);

-- vacation_settings
ALTER TABLE public.vacation_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_vacation_settings_company_id 
  ON public.vacation_settings(company_id);

-- vehicles
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id 
  ON public.vehicles(company_id);

-- ===== BATCH 54: VOICE & VOICEMAIL =====

-- voice_messages
ALTER TABLE public.voice_messages 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_company_id 
  ON public.voice_messages(company_id);

-- voicemail_announcements
ALTER TABLE public.voicemail_announcements 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_announcements_company_id 
  ON public.voicemail_announcements(company_id);

-- voicemail_assets
ALTER TABLE public.voicemail_assets 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_assets_company_id 
  ON public.voicemail_assets(company_id);

-- voicemail_messages
ALTER TABLE public.voicemail_messages 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_messages_company_id 
  ON public.voicemail_messages(company_id);

-- voicemail_personal_data
ALTER TABLE public.voicemail_personal_data 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_personal_data_company_id 
  ON public.voicemail_personal_data(company_id);

-- voicemail_professional_voices
ALTER TABLE public.voicemail_professional_voices 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_professional_voices_company_id 
  ON public.voicemail_professional_voices(company_id);

-- voicemail_settings
ALTER TABLE public.voicemail_settings 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_settings_company_id 
  ON public.voicemail_settings(company_id);

-- voicemail_uploads
ALTER TABLE public.voicemail_uploads 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_voicemail_uploads_company_id 
  ON public.voicemail_uploads(company_id);

-- ===== BATCH 55: WASTE & WATER =====

-- waste_management
ALTER TABLE public.waste_management 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_waste_management_company_id 
  ON public.waste_management(company_id);

-- water_consumption
ALTER TABLE public.water_consumption 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_water_consumption_company_id 
  ON public.water_consumption(company_id);

-- ===== BATCH 56: WFM & WHISTLEBLOWER =====

-- wfm_employee_licenses
ALTER TABLE public.wfm_employee_licenses 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_wfm_employee_licenses_company_id 
  ON public.wfm_employee_licenses(company_id);

-- wfm_employee_skills
ALTER TABLE public.wfm_employee_skills 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_wfm_employee_skills_company_id 
  ON public.wfm_employee_skills(company_id);

-- wfm_preferences
ALTER TABLE public.wfm_preferences 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_wfm_preferences_company_id 
  ON public.wfm_preferences(company_id);

-- whistleblower_reports
ALTER TABLE public.whistleblower_reports 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_whistleblower_reports_company_id 
  ON public.whistleblower_reports(company_id);

-- ===== BATCH 57: WORKFLOWS =====

-- workflow_actions
ALTER TABLE public.workflow_actions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_company_id 
  ON public.workflow_actions(company_id);

-- workflow_approver_rules
ALTER TABLE public.workflow_approver_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workflow_approver_rules_company_id 
  ON public.workflow_approver_rules(company_id);

-- workflow_audit_logs
ALTER TABLE public.workflow_audit_logs 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_company_id 
  ON public.workflow_audit_logs(company_id);

-- workflow_conditions
ALTER TABLE public.workflow_conditions 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workflow_conditions_company_id 
  ON public.workflow_conditions(company_id);

-- workflow_steps
ALTER TABLE public.workflow_steps 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_company_id 
  ON public.workflow_steps(company_id);

-- workforce_analytics
ALTER TABLE public.workforce_analytics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_workforce_analytics_company_id 
  ON public.workforce_analytics(company_id);

-- working_time_rules
ALTER TABLE public.working_time_rules 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_working_time_rules_company_id 
  ON public.working_time_rules(company_id);

-- worktime_absence_settings_audit
ALTER TABLE public.worktime_absence_settings_audit 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
CREATE INDEX IF NOT EXISTS idx_worktime_absence_settings_audit_company_id 
  ON public.worktime_absence_settings_audit(company_id);
