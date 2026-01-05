-- Vervollständigung aller fehlenden recommended_value Einträge (113 Einträge)
-- Strings müssen als JSON-Strings formatiert werden (mit doppelten Anführungszeichen)

-- Assets (6 Einträge)
UPDATE settings_definitions SET recommended_value = '500' WHERE module = 'assets' AND key = 'approval_required_over';
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'assets' AND key = 'auto_assignment';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'assets' AND key = 'depreciation_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'assets' AND key = 'maintenance_scheduling';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'assets' AND key = 'qr_code_enabled';
UPDATE settings_definitions SET recommended_value = '7' WHERE module = 'assets' AND key = 'return_reminder_days';

-- Expenses (5 Einträge)
UPDATE settings_definitions SET recommended_value = '50' WHERE module = 'expenses' AND key = 'auto_approval_limit';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'expenses' AND key = 'currency_conversion';
UPDATE settings_definitions SET recommended_value = '0.3' WHERE module = 'expenses' AND key = 'mileage_rate';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'expenses' AND key = 'per_diem_enabled';
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'expenses' AND key = 'project_allocation_required';

-- Global Mobility (25 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'cost_tracking_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.assignment_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.compliance_alerts';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.contract_templates';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.cost_projections';
UPDATE settings_definitions SET recommended_value = '"EUR"' WHERE module = 'global_mobility' AND key = 'global_mobility.default_currency';
UPDATE settings_definitions SET recommended_value = '90' WHERE module = 'global_mobility' AND key = 'global_mobility.document_expiry_warning_days';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.document_management';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.dual_payroll_support';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.emergency_contacts';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.expat_support_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.family_support';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.health_insurance_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.housing_allowance';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.immigration_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.language_training';
UPDATE settings_definitions SET recommended_value = '3' WHERE module = 'global_mobility' AND key = 'global_mobility.max_assignment_years';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.relocation_packages';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.repatriation_planning';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.tax_equalization';
UPDATE settings_definitions SET recommended_value = '183' WHERE module = 'global_mobility' AND key = 'global_mobility.tax_residency_days';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.travel_policy_integration';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.vendor_management';
UPDATE settings_definitions SET recommended_value = '60' WHERE module = 'global_mobility' AND key = 'global_mobility.visa_expiry_warning_days';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'global_mobility' AND key = 'global_mobility.work_permit_tracking';

-- Helpdesk (5 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'helpdesk' AND key = 'auto_assignment';
UPDATE settings_definitions SET recommended_value = '4' WHERE module = 'helpdesk' AND key = 'first_response_hours';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'helpdesk' AND key = 'knowledge_base_suggestions';
UPDATE settings_definitions SET recommended_value = '24' WHERE module = 'helpdesk' AND key = 'resolution_hours';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'helpdesk' AND key = 'sla_enabled';

-- Innovation (1 Eintrag)
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'innovation' AND key = 'reward_points_enabled';

-- Knowledge (5 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'knowledge' AND key = 'ai_summaries';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'knowledge' AND key = 'edit_suggestions';
UPDATE settings_definitions SET recommended_value = '30' WHERE module = 'knowledge' AND key = 'expiry_warning_days';
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'knowledge' AND key = 'public_access';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'knowledge' AND key = 'review_required';

-- Notifications (2 Einträge)
UPDATE settings_definitions SET recommended_value = '"08:00"' WHERE module = 'notifications' AND key = 'quiet_hours_end';
UPDATE settings_definitions SET recommended_value = '"18:00"' WHERE module = 'notifications' AND key = 'quiet_hours_start';

-- Offboarding (5 Einträge)
UPDATE settings_definitions SET recommended_value = '14' WHERE module = 'offboarding' AND key = 'access_revocation_days';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'asset_return_required';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'exit_interview';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'offboarding' AND key = 'knowledge_transfer';
UPDATE settings_definitions SET recommended_value = '30' WHERE module = 'offboarding' AND key = 'notice_period_days';

-- Onboarding (5 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'buddy_program';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'checklist_enabled';
UPDATE settings_definitions SET recommended_value = '90' WHERE module = 'onboarding' AND key = 'default_duration_days';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'feedback_surveys';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'onboarding' AND key = 'welcome_email';

-- Orgchart (4 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'auto_update';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'show_photos';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'show_positions';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'orgchart' AND key = 'show_vacancies';

-- Payroll (6 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'auto_tax_calculation';
UPDATE settings_definitions SET recommended_value = '"EUR"' WHERE module = 'payroll' AND key = 'default_currency';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'overtime_tracking';
UPDATE settings_definitions SET recommended_value = '25' WHERE module = 'payroll' AND key = 'payment_day';
UPDATE settings_definitions SET recommended_value = '"monthly"' WHERE module = 'payroll' AND key = 'payment_frequency';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'payroll' AND key = 'payslip_notifications';

-- Performance (4 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'performance' AND key = '360_feedback';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'performance' AND key = 'goal_tracking';
UPDATE settings_definitions SET recommended_value = '"quarterly"' WHERE module = 'performance' AND key = 'review_frequency';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'performance' AND key = 'self_assessment';

-- Projects (6 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'budget_tracking';
UPDATE settings_definitions SET recommended_value = '"agile"' WHERE module = 'projects' AND key = 'default_methodology';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'milestone_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'resource_allocation';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'risk_management';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'projects' AND key = 'time_tracking';

-- Recruiting (6 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'application_acknowledgement';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'candidate_portal';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'interview_scheduling';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'job_board_integration';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'referral_program';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'recruiting' AND key = 'resume_parsing';

-- Rewards (4 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'rewards' AND key = 'badges_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'rewards' AND key = 'leaderboard_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'rewards' AND key = 'peer_recognition';
UPDATE settings_definitions SET recommended_value = '100' WHERE module = 'rewards' AND key = 'points_per_month';

-- Shifts (5 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'auto_scheduling';
UPDATE settings_definitions SET recommended_value = '11' WHERE module = 'shifts' AND key = 'min_rest_hours';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'overtime_alerts';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'shift_swap_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'shifts' AND key = 'time_clock_enabled';

-- Training (6 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'certificates_enabled';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'completion_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'external_courses';
UPDATE settings_definitions SET recommended_value = '20' WHERE module = 'training' AND key = 'mandatory_hours_per_year';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'progress_tracking';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'quiz_enabled';

-- Users_roles (6 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'audit_logging';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'auto_deactivation';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'permission_inheritance';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'role_templates';
UPDATE settings_definitions SET recommended_value = '90' WHERE module = 'users_roles' AND key = 'session_timeout_minutes';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'sso_enabled';

-- Workflows (4 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'approval_chains';
UPDATE settings_definitions SET recommended_value = '48' WHERE module = 'workflows' AND key = 'auto_escalation_hours';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'parallel_approvals';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'reminders_enabled';

-- Workforce_planning (3 Einträge)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'capacity_planning';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'headcount_forecasting';
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'succession_planning';