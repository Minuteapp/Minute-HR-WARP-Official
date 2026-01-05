-- Letzte 14 fehlende recommended_value Einträge

-- Training (4 fehlende)
UPDATE settings_definitions SET recommended_value = '30' WHERE module = 'training' AND key = 'certificates_expiry_warning_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'external_providers_allowed' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'mandatory_training_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'training' AND key = 'self_enrollment_allowed' AND recommended_value IS NULL;

-- Users_roles (5 fehlende)
UPDATE settings_definitions SET recommended_value = '90' WHERE module = 'users_roles' AND key = 'auto_deactivation_days' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'false' WHERE module = 'users_roles' AND key = 'mfa_required' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '"medium"' WHERE module = 'users_roles' AND key = 'password_complexity' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '8' WHERE module = 'users_roles' AND key = 'password_min_length' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'users_roles' AND key = 'role_hierarchy_strict' AND recommended_value IS NULL;

-- Workflows (3 fehlende)
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'audit_trail_enabled' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = '24' WHERE module = 'workflows' AND key = 'auto_reminder_hours' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workflows' AND key = 'escalation_enabled' AND recommended_value IS NULL;

-- Workforce_planning (2 fehlende)
UPDATE settings_definitions SET recommended_value = '12' WHERE module = 'workforce_planning' AND key = 'forecast_horizon_months' AND recommended_value IS NULL;
UPDATE settings_definitions SET recommended_value = 'true' WHERE module = 'workforce_planning' AND key = 'headcount_approval' AND recommended_value IS NULL;