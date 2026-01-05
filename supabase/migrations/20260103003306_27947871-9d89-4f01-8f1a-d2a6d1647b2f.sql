-- Vervollständigung ALLER fehlenden recommended_value Einträge
-- Basierend auf den tatsächlichen Keys in der Datenbank

-- Global Mobility (22 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.a1_certificate_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.approval_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"hr_manager"' WHERE module = 'global_mobility' AND key = 'global_mobility.approver_role' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '30' WHERE module = 'global_mobility' AND key = 'global_mobility.assignment_end_reminder_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.auto_renewal_reminders' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '15' WHERE module = 'global_mobility' AND key = 'global_mobility.default_cola_percentage' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '2000' WHERE module = 'global_mobility' AND key = 'global_mobility.default_housing_allowance' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.document_tracking' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'global_mobility' AND key = 'global_mobility.education_allowance_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '3' WHERE module = 'global_mobility' AND key = 'global_mobility.long_term_max_years' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.notify_before_assignment_end' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.notify_on_status_change' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.permanent_transfer_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.relocation_assistance' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '10000' WHERE module = 'global_mobility' AND key = 'global_mobility.relocation_budget' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.residence_tracking' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'global_mobility' AND key = 'global_mobility.rotational_assignment_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '6' WHERE module = 'global_mobility' AND key = 'global_mobility.short_term_max_months' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.social_security_tracking' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '150' WHERE module = 'global_mobility' AND key = 'global_mobility.tax_threshold_warning_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '30' WHERE module = 'global_mobility' AND key = 'global_mobility.temporary_housing_days' AND recommended_value IS NULL;

-- Offboarding (5 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'asset_return_tracking' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'auto_deactivation_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'exit_interview_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'offboarding' AND key = 'knowledge_transfer_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'notice_period_check' AND recommended_value IS NULL;

-- Onboarding (4 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'auto_task_assignment' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'equipment_request_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'pre_boarding_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"manager_hr"' WHERE module = 'onboarding' AND key = 'progress_notifications' AND recommended_value IS NULL;

-- Orgchart (4 fehlende)
UPDATE settings_definitions SET recommended_value = '5' WHERE module = 'orgchart' AND key = 'depth_limit' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"hr_only"' WHERE module = 'orgchart' AND key = 'edit_access' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'show_contact_info' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'show_vacant_positions' AND recommended_value IS NULL;

-- Payroll (6 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'auto_calculation_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'bonus_approval_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'overtime_auto_import' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"monthly"' WHERE module = 'payroll' AND key = 'pay_period' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"portal"' WHERE module = 'payroll' AND key = 'payslip_delivery' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"automatic"' WHERE module = 'payroll' AND key = 'tax_calculation_mode' AND recommended_value IS NULL;

-- Performance (4 fehlende)
UPDATE settings_definitions SET recommended_value = '"okr"' WHERE module = 'performance' AND key = 'goal_setting_mode' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'performance' AND key = 'peer_feedback_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"5_point"' WHERE module = 'performance' AND key = 'rating_scale' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'performance' AND key = 'self_assessment_required' AND recommended_value IS NULL;

-- Projects (5 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'budget_tracking_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'projects' AND key = 'external_visibility' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'projects' AND key = 'milestones_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"weekly"' WHERE module = 'projects' AND key = 'status_update_frequency' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'projects' AND key = 'time_tracking_required' AND recommended_value IS NULL;

-- Recruiting (6 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'approval_workflow_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'auto_response_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'recruiting' AND key = 'candidate_scoring_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '180' WHERE module = 'recruiting' AND key = 'gdpr_retention_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"manual"' WHERE module = 'recruiting' AND key = 'interview_scheduling_mode' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'self_application_allowed' AND recommended_value IS NULL;

-- Rewards (4 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'rewards' AND key = 'manager_approval_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '100' WHERE module = 'rewards' AND key = 'monthly_budget' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'rewards' AND key = 'points_system_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'rewards' AND key = 'public_recognition' AND recommended_value IS NULL;

-- Shifts (4 fehlende)
UPDATE settings_definitions SET recommended_value = '48' WHERE module = 'shifts' AND key = 'max_hours_per_week' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'overtime_warning' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"balanced"' WHERE module = 'shifts' AND key = 'preference_weight' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'swap_requests_enabled' AND recommended_value IS NULL;

-- Training (6 fehlende)
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'training' AND key = 'approval_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'budget_tracking_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'certification_tracking' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'external_provider_allowed' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '40' WHERE module = 'training' AND key = 'hours_per_year' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'manager_nomination_enabled' AND recommended_value IS NULL;

-- Users_roles (5 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'auto_provisioning' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'users_roles' AND key = 'delegated_admin' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'password_rotation' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '90' WHERE module = 'users_roles' AND key = 'password_rotation_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'role_inheritance' AND recommended_value IS NULL;

-- Workflows (3 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'auto_escalation' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '7' WHERE module = 'workflows' AND key = 'escalation_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'parallel_execution' AND recommended_value IS NULL;

-- Workforce_planning (3 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'attrition_prediction' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'gap_analysis' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'scenario_modeling' AND recommended_value IS NULL;