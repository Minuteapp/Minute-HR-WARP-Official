-- Security linter fix: set an explicit search_path on functions missing it

BEGIN;

ALTER FUNCTION public.update_settings_module_permissions_updated_at()
SET search_path = public;

COMMIT;