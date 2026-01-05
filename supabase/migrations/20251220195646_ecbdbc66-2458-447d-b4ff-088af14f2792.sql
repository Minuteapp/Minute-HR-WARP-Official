-- RLS SELECT-Policies für alle 73 Tabellen ohne Policies

-- Batch 1: A-C Tabellen
CREATE POLICY "Authenticated users can view auto_approval_rules" ON public.auto_approval_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view budget_plans" ON public.budget_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view calendar_conflicts" ON public.calendar_conflicts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view compliance_requirements" ON public.compliance_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view compliance_tracking" ON public.compliance_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view course_enrollments" ON public.course_enrollments FOR SELECT TO authenticated USING (true);

-- Batch 2: DE Tabellen
CREATE POLICY "Authenticated users can view de_abwesenheitsantraege" ON public.de_abwesenheitsantraege FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view de_abwesenheitsarten" ON public.de_abwesenheitsarten FOR SELECT TO authenticated USING (true);

-- Batch 3: Document Tabellen
CREATE POLICY "Authenticated users can view document_automations" ON public.document_automations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view document_category_settings" ON public.document_category_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view document_folder_links" ON public.document_folder_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view document_links" ON public.document_links FOR SELECT TO authenticated USING (true);

-- Batch 4: E Tabellen
CREATE POLICY "Authenticated users can view emission_sources" ON public.emission_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view escalation_rules" ON public.escalation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view esg_import_templates" ON public.esg_import_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view esg_kpis" ON public.esg_kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view esg_workflow_tasks" ON public.esg_workflow_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view event_resources" ON public.event_resources FOR SELECT TO authenticated USING (true);

-- Batch 5: F Tabellen
CREATE POLICY "Authenticated users can view faq_articles" ON public.faq_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view faq_categories" ON public.faq_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forecast_audit_logs" ON public.forecast_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forecast_escalation_rules" ON public.forecast_escalation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forecast_permissions" ON public.forecast_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forecast_reports" ON public.forecast_reports FOR SELECT TO authenticated USING (true);

-- Batch 6: Helpdesk Tabellen
CREATE POLICY "Authenticated users can view helpdesk_attachments" ON public.helpdesk_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_audit_log" ON public.helpdesk_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_escalation_rules" ON public.helpdesk_escalation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_knowledge_base" ON public.helpdesk_knowledge_base FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_sla_configs" ON public.helpdesk_sla_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_surveys" ON public.helpdesk_surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_teams" ON public.helpdesk_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_templates" ON public.helpdesk_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view helpdesk_workflows" ON public.helpdesk_workflows FOR SELECT TO authenticated USING (true);

-- Batch 7: HR & Innovation Tabellen
CREATE POLICY "Authenticated users can view hr_cases" ON public.hr_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view innovation_activities" ON public.innovation_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view innovation_ai_insights" ON public.innovation_ai_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view innovation_approvals" ON public.innovation_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view innovation_leaderboards" ON public.innovation_leaderboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view innovation_lifecycle_tracking" ON public.innovation_lifecycle_tracking FOR SELECT TO authenticated USING (true);

-- Batch 8: I-K Tabellen
CREATE POLICY "Authenticated users can view interviews" ON public.interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view job_applications" ON public.job_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view kb_usage_logs" ON public.kb_usage_logs FOR SELECT TO authenticated USING (true);

-- Batch 9: L-M Tabellen
CREATE POLICY "Authenticated users can view location_holidays" ON public.location_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view location_zones" ON public.location_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view mentoring_relationships" ON public.mentoring_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view modules" ON public.modules FOR SELECT TO authenticated USING (true);

-- Batch 10: N-P Tabellen
CREATE POLICY "Authenticated users can view notification_queue" ON public.notification_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view permission_ui_elements" ON public.permission_ui_elements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view pulse_survey_questions" ON public.pulse_survey_questions FOR SELECT TO authenticated USING (true);

-- Batch 11: R-S Tabellen
CREATE POLICY "Authenticated users can view recruiting_reminders" ON public.recruiting_reminders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settings_company" ON public.settings_company FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settings_documents" ON public.settings_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settings_recruitment" ON public.settings_recruitment FOR SELECT TO authenticated USING (true);

-- Batch 12: T-U Tabellen
CREATE POLICY "Authenticated users can view ticket_escalations" ON public.ticket_escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own presence" ON public.user_presence FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own preview sessions" ON public.user_role_preview_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Batch 13: WF Tabellen
CREATE POLICY "Authenticated users can view wf_assignment" ON public.wf_assignment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_audit_log" ON public.wf_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_constraint" ON public.wf_constraint FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_demand" ON public.wf_demand FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_forecast" ON public.wf_forecast FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_gap" ON public.wf_gap FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_request" ON public.wf_request FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_scenario" ON public.wf_scenario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_skills_matrix" ON public.wf_skills_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view wf_supply" ON public.wf_supply FOR SELECT TO authenticated USING (true);

-- Batch 14: Workflow Tabellen
CREATE POLICY "Authenticated users can view workflow_audit_logs" ON public.workflow_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workflow_steps" ON public.workflow_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workflow_templates" ON public.workflow_templates FOR SELECT TO authenticated USING (true);