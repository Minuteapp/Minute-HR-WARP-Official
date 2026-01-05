
-- =====================================================
-- SECURITY FIX: Letzte 11 Functions mit search_path
-- =====================================================

ALTER FUNCTION public.create_policy_sync_event() SET search_path = public, pg_temp;
ALTER FUNCTION public.enqueue_au_for_ocr() SET search_path = public, pg_temp;
ALTER FUNCTION public.expire_old_impersonation_sessions() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_tenant_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_company_role_configurations_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_employee_corporate_cards_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_global_mobility_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_account_status_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_wf_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.validate_position_assignment() SET search_path = public, pg_temp;
