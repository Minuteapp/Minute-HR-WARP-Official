-- 1) 2FA für Act-as: Spalte hinzufügen
ALTER TABLE impersonation_sessions 
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN impersonation_sessions.two_factor_verified_at IS 'Zeitpunkt der 2FA-Bestätigung für Act-as Modus';

-- 2) Kunden-Transparenz-Modus: Spalte und View
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS support_access_transparency BOOLEAN DEFAULT false;

COMMENT ON COLUMN companies.support_access_transparency IS 'Wenn aktiviert, können Kunden-Admins Support-Zugriffe sehen';

-- Customer Support Access Log View
CREATE OR REPLACE VIEW public.customer_support_access_log AS
SELECT 
  s.id,
  s.started_at,
  s.ended_at,
  s.mode,
  s.justification_type,
  s.is_pre_tenant,
  s.target_tenant_id,
  CASE 
    WHEN c.support_access_transparency THEN s.justification 
    ELSE 'Support-Zugriff' 
  END as reason,
  EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at))/60 as duration_minutes
FROM impersonation_sessions s
JOIN companies c ON c.id = s.target_tenant_id
WHERE s.status IN ('ended', 'expired');

-- 3) Permission Trace RPC-Funktion
CREATE OR REPLACE FUNCTION public.get_user_permission_trace(
  p_user_id UUID,
  p_tenant_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', p_user_id,
    'tenant_id', p_tenant_id,
    'roles', (
      SELECT COALESCE(json_agg(json_build_object(
        'role', role,
        'company_id', company_id,
        'assigned_at', created_at
      )), '[]'::json)
      FROM user_roles 
      WHERE user_id = p_user_id 
      AND (company_id = p_tenant_id OR company_id IS NULL)
    ),
    'permissions', (
      SELECT COALESCE(json_agg(DISTINCT json_build_object(
        'module_key', pm.module_key,
        'module_name', pm.name,
        'allowed_actions', rpm.allowed_actions,
        'role', rpm.role_name,
        'granted', true
      )), '[]'::json)
      FROM permission_modules pm
      JOIN role_permission_matrix rpm ON pm.module_key = rpm.module_name
      WHERE rpm.role_name IN (
        SELECT role FROM user_roles 
        WHERE user_id = p_user_id 
        AND (company_id = p_tenant_id OR company_id IS NULL)
      )
      AND pm.is_active = true
    ),
    'feature_flags', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', ff.name,
        'description', ff.description,
        'enabled', COALESCE(cff.is_enabled, ff.default_value),
        'source', CASE WHEN cff.id IS NOT NULL THEN 'company' ELSE 'default' END
      )), '[]'::json)
      FROM feature_flags ff
      LEFT JOIN company_feature_flags cff ON ff.id = cff.feature_flag_id AND cff.company_id = p_tenant_id
      WHERE ff.is_active = true
    ),
    'location_rules', (
      SELECT json_build_object(
        'country', COALESCE(c.country, 'DE'),
        'timezone', COALESCE(c.timezone, 'Europe/Berlin'),
        'holiday_region', c.holiday_region,
        'language', c.language,
        'currency', c.currency
      )
      FROM companies c 
      WHERE c.id = p_tenant_id
    ),
    'effective_profile', (
      SELECT json_build_object(
        'full_name', p.full_name,
        'email', p.username,
        'avatar_url', p.avatar_url,
        'department', e.department,
        'position', e.position,
        'location', e.location
      )
      FROM profiles p
      LEFT JOIN employees e ON e.id = p_user_id
      WHERE p.id = p_user_id
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_permission_trace(UUID, UUID) TO authenticated;