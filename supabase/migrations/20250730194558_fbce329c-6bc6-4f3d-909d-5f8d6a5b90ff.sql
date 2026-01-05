-- Fix the tenant context functions to ensure proper isolation

-- First, let's check the current user_tenant_sessions table to make sure it exists and has the right structure
CREATE TABLE IF NOT EXISTS public.user_tenant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_company_id UUID,
  is_tenant_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_tenant_sessions if not already enabled
ALTER TABLE public.user_tenant_sessions ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for user_tenant_sessions
DROP POLICY IF EXISTS "Users can manage their own tenant sessions" ON public.user_tenant_sessions;
CREATE POLICY "Users can manage their own tenant sessions"
  ON public.user_tenant_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update the is_in_tenant_context function to be more reliable
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tenant_mode BOOLEAN := false;
BEGIN
  -- Check if user has an active tenant session
  SELECT COALESCE(uts.is_tenant_mode, false)
  INTO tenant_mode
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL;
  
  RETURN COALESCE(tenant_mode, false);
END;
$function$;

-- Update the get_tenant_company_id_safe function to be more reliable
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tenant_company_id UUID;
BEGIN
  -- Only return tenant company ID if we're actually in tenant mode
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL;
  
  RETURN tenant_company_id;
END;
$function$;

-- Update the set_tenant_context function to ensure proper session management
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_company_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Benutzer nicht authentifiziert'
    );
  END IF;
  
  -- Check if company exists and is active
  SELECT EXISTS (
    SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true
  ) INTO v_company_exists;
  
  IF NOT v_company_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Firma nicht gefunden oder nicht aktiv'
    );
  END IF;
  
  -- Set tenant session with explicit tenant mode
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (v_user_id, p_company_id, true, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = p_company_id,
    is_tenant_mode = true,
    updated_at = now();
  
  -- Log the context switch for debugging
  RAISE NOTICE 'Tenant context set: user_id=%, company_id=%, timestamp=%', v_user_id, p_company_id, now();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tenant-Kontext erfolgreich gesetzt',
    'tenant_company_id', p_company_id,
    'user_id', v_user_id
  );
END;
$function$;

-- Update the clear_tenant_context function
CREATE OR REPLACE FUNCTION public.clear_tenant_context()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Benutzer nicht authentifiziert'
    );
  END IF;
  
  -- Clear tenant session
  UPDATE user_tenant_sessions 
  SET 
    tenant_company_id = NULL,
    is_tenant_mode = false,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Also delete the session entirely to be sure
  DELETE FROM user_tenant_sessions WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tenant-Kontext erfolgreich gelöscht'
  );
END;
$function$;