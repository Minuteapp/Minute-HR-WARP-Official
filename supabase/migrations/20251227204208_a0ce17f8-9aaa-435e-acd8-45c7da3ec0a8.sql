
-- =====================================================
-- SECURITY FIX: Views mit security_invoker = true
-- PostgreSQL 15+ verwendet ALTER VIEW ... SET
-- =====================================================

-- Die Views wurden bereits erstellt, aber security_invoker muss explizit gesetzt werden
ALTER VIEW public.absence_requests_with_employee SET (security_invoker = true);
ALTER VIEW public.customer_support_access_log SET (security_invoker = true);
ALTER VIEW public.employees_with_company SET (security_invoker = true);
ALTER VIEW public.helpdesk_tickets_with_sla SET (security_invoker = true);

-- =====================================================
-- SECURITY FIX: Restliche Functions mit search_path
-- =====================================================

-- Alle gefundenen Funktionen aktualisieren
ALTER FUNCTION public.approve_workflow_step(p_workflow_instance_id uuid, p_step_number integer, p_decision text, p_comments text) SET search_path = public, pg_temp;
ALTER FUNCTION public.assess_forecast_risks(p_forecast_instance_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.audit_trigger() SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_assign_company_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_link_documents() SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_set_company_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.bulk_update_employee_status(p_employee_ids uuid[], p_new_status text, p_updated_by uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_objective_progress() SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_payroll(p_user_id uuid, p_period_start date, p_period_end date) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_pulse_tenant_analytics(p_tenant_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_sla_due_date() SET search_path = public, pg_temp;
ALTER FUNCTION public.can_access_all_companies() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_absence_conflicts_on_shift_creation() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_budget_thresholds() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_document_duplicate() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_email_exists(email_to_check text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_policy_enforcement(p_user_id uuid, p_module_name text, p_action text, p_context jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.clear_role_preview() SET search_path = public, pg_temp;
ALTER FUNCTION public.clear_tenant_context() SET search_path = public, pg_temp;
ALTER FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.copy_template_questions_to_survey() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_admin_invitation(p_email text, p_company_id uuid, p_full_name text, p_phone text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_admin_invitation(p_email text, p_company_id uuid, p_full_name text, p_phone text, p_position text, p_salutation text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_admin_user_with_password(p_email text, p_password text, p_full_name text, p_company_id uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_admin_user_with_password(p_email text, p_password text, p_company_id uuid, p_full_name text, p_phone text, p_position text, p_salutation text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_approval_requests() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_approval_requests(p_workflow_instance_id uuid, p_approval_steps jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_article_version() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_budget_version() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_clean_company(p_name text, p_address text, p_billing_email text, p_phone text, p_website text, p_subscription_status text, p_tax_id text, p_vat_id text, p_contact_person text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_company(p_name text, p_address text, p_billing_email text, p_phone text, p_website text, p_subscription_status text, p_tax_id text, p_vat_id text, p_contact_person text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_employee_bypass_rls(p_name text, p_email text, p_department text, p_position text, p_company_id uuid) SET search_path = public, pg_temp;
