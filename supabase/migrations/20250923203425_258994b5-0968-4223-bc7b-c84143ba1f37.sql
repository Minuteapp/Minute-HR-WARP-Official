-- KRITISCHER SICHERHEITSFIX: Security Definer Functions ohne search_path sichern
-- Problem: 31+ SECURITY DEFINER Funktionen haben keinen sicheren search_path
-- Das ist eine schwerwiegende Sicherheitslücke die SQL Injection ermöglichen kann

-- PHASE 1: Kritische Funktionen mit search_path sichern (erste 10)
-- Jede Funktion wird mit ALTER FUNCTION ... SET search_path = 'public' gesichert

-- 1. approve_workflow_step
ALTER FUNCTION public.approve_workflow_step(p_workflow_instance_id uuid, p_step_number integer, p_decision text, p_comments text) 
SET search_path = 'public';

-- 2. auto_assign_company_id (Trigger)
ALTER FUNCTION public.auto_assign_company_id() 
SET search_path = 'public';

-- 3. auto_link_documents (Trigger)
ALTER FUNCTION public.auto_link_documents() 
SET search_path = 'public';

-- 4. bulk_update_employee_status
ALTER FUNCTION public.bulk_update_employee_status(p_employee_ids uuid[], p_new_status text, p_updated_by uuid) 
SET search_path = 'public';

-- 5. check_budget_thresholds (Trigger)
ALTER FUNCTION public.check_budget_thresholds() 
SET search_path = 'public';

-- 6. check_policy_enforcement
ALTER FUNCTION public.check_policy_enforcement(p_user_id uuid, p_module_name text, p_action text, p_context jsonb) 
SET search_path = 'public';

-- 7. clear_tenant_context
ALTER FUNCTION public.clear_tenant_context() 
SET search_path = 'public';

-- 8. create_approval_requests (Trigger)
ALTER FUNCTION public.create_approval_requests() 
SET search_path = 'public';

-- 9. create_budget_version (Trigger)
ALTER FUNCTION public.create_budget_version() 
SET search_path = 'public';

-- 10. debug_superadmin_status
ALTER FUNCTION public.debug_superadmin_status() 
SET search_path = 'public';

-- Log der Sicherheitsreparatur Phase 1
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_search_path_fix_phase1', 
  'database_functions', 
  'security_definer_functions',
  jsonb_build_object(
    'description', 'Phase 1: Fixed search_path for first 10 critical SECURITY DEFINER functions',
    'functions_secured', ARRAY[
      'approve_workflow_step', 'auto_assign_company_id', 'auto_link_documents', 
      'bulk_update_employee_status', 'check_budget_thresholds', 'check_policy_enforcement',
      'clear_tenant_context', 'create_approval_requests', 'create_budget_version', 'debug_superadmin_status'
    ],
    'security_improvement', 'Prevented SQL injection via search_path manipulation',
    'phase', '1 of 4'
  ),
  'critical'
);