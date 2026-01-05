
-- =====================================================
-- SECURITY FIX: Functions mit search_path versehen
-- (Korrigierte Signaturen)
-- =====================================================

-- Funktionen ohne Parameter
ALTER FUNCTION public.calculate_avg_processing_time() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_blackout_periods() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_approval_workflow_step() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_article_views() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_hr_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_team_manager() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_absence_changes() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_sick_leave_approval() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_absence_to_calendar() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_shift_to_calendar() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_absence_quota() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_training_recommendations_trigger() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Funktionen mit Parametern
ALTER FUNCTION public.calculate_absence_days(p_start_date date, p_end_date date) SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_template_usage(template_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_team_manager(user_id uuid, employee_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.log_security_event(p_user_id uuid, p_action text, p_resource_type text, p_resource_id text, p_ip_address text, p_user_agent text, p_success boolean, p_details jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.log_security_event(p_user_id uuid, p_action text, p_resource_type text, p_resource_id text, p_ip_address inet, p_user_agent text, p_success boolean, p_details jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.set_tenant_context(tenant_company_id text) SET search_path = public, pg_temp;
ALTER FUNCTION public.set_tenant_context(tenant_id uuid) SET search_path = public, pg_temp;
