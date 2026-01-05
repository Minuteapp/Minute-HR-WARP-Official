-- Fix PGRST203: remove overloaded start_impersonation_session variant so NULL p_ip_address resolves unambiguously
-- Keep the text-typed version (it already casts to inet internally) and drop the inet-typed overload.

DROP FUNCTION IF EXISTS public.start_impersonation_session(
  uuid,  -- p_target_user_id
  uuid,  -- p_target_tenant_id
  text,  -- p_mode
  text,  -- p_justification
  text,  -- p_justification_type
  integer, -- p_duration_minutes
  boolean, -- p_is_pre_tenant
  inet,    -- p_ip_address
  text     -- p_user_agent
);
