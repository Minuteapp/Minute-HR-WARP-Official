-- Fix active_tenant_sessions: allow multiple historical rows per user
-- and enforce only ONE active session per user.

-- 1) Drop overly-restrictive uniqueness on session_user_id (prevents re-impersonation)
ALTER TABLE public.active_tenant_sessions
DROP CONSTRAINT IF EXISTS active_tenant_sessions_session_user_id_key;

-- If an index with the same name exists (from previous constraint), remove it defensively
DROP INDEX IF EXISTS public.active_tenant_sessions_session_user_id_key;

-- 2) Ensure the old composite uniqueness is gone (defensive)
ALTER TABLE public.active_tenant_sessions
DROP CONSTRAINT IF EXISTS active_tenant_sessions_session_user_id_impersonated_company_key;

DROP INDEX IF EXISTS public.active_tenant_sessions_session_user_id_impersonated_company_key;

-- 3) Cleanup: if any user has multiple active rows, deactivate all but the newest
WITH ranked AS (
  SELECT
    id,
    session_user_id,
    row_number() OVER (
      PARTITION BY session_user_id
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.active_tenant_sessions
  WHERE is_active = true
)
UPDATE public.active_tenant_sessions ats
SET is_active = false,
    expires_at = COALESCE(ats.expires_at, now())
FROM ranked r
WHERE ats.id = r.id
  AND r.rn > 1;

-- 4) Enforce: only one ACTIVE session per user
CREATE UNIQUE INDEX IF NOT EXISTS active_tenant_sessions_one_active_per_user
ON public.active_tenant_sessions (session_user_id)
WHERE is_active = true;