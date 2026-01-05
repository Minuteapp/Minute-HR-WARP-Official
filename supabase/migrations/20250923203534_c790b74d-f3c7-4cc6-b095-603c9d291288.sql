-- KRITISCHER SICHERHEITSFIX: Security Definer Functions ohne search_path sichern - PHASE 2
-- Fortsetzung der Sicherung aller SECURITY DEFINER Funktionen

-- PHASE 2: Weitere kritische Funktionen mit search_path sichern (nächste 10)

-- 11. generate_forecast_ai_recommendations  
ALTER FUNCTION public.generate_forecast_ai_recommendations(p_forecast_instance_id uuid) 
SET search_path = 'public';

-- 12. generate_training_recommendations
ALTER FUNCTION public.generate_training_recommendations(p_employee_id uuid) 
SET search_path = 'public';

-- 13. get_current_tenant_company_id
ALTER FUNCTION public.get_current_tenant_company_id() 
SET search_path = 'public';

-- 14. get_employees_paginated
ALTER FUNCTION public.get_employees_paginated(p_company_id uuid, p_limit integer, p_offset integer, p_search text) 
SET search_path = 'public';

-- 15. has_permission
ALTER FUNCTION public.has_permission(user_id uuid, permission_name text) 
SET search_path = 'public';

-- 16. increment_template_usage (Trigger)
ALTER FUNCTION public.increment_template_usage() 
SET search_path = 'public';

-- 17. is_channel_member
ALTER FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid) 
SET search_path = 'public';

-- 18. is_hr_staff
ALTER FUNCTION public.is_hr_staff(user_id uuid) 
SET search_path = 'public';

-- 19. is_in_superadmin_context
ALTER FUNCTION public.is_in_superadmin_context() 
SET search_path = 'public';

-- 20. is_manager
ALTER FUNCTION public.is_manager(user_id uuid) 
SET search_path = 'public';

-- Log der Sicherheitsreparatur Phase 2
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_definer_search_path_fix_phase2', 
  'database_functions', 
  'security_definer_functions',
  jsonb_build_object(
    'description', 'Phase 2: Fixed search_path for next 10 critical SECURITY DEFINER functions',
    'functions_secured', ARRAY[
      'generate_forecast_ai_recommendations', 'generate_training_recommendations', 'get_current_tenant_company_id',
      'get_employees_paginated', 'has_permission', 'increment_template_usage',
      'is_channel_member', 'is_hr_staff', 'is_in_superadmin_context', 'is_manager'
    ],
    'security_improvement', 'Prevented SQL injection via search_path manipulation',
    'phase', '2 of 4'
  ),
  'critical'
);