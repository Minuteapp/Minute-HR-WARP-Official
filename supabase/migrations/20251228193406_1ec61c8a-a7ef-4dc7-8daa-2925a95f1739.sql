-- Helper function: Get tables without RLS enabled
CREATE OR REPLACE FUNCTION public.get_tables_without_rls()
RETURNS TABLE(tablename text) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.relname::text as tablename
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname NOT LIKE 'pg_%'
  AND c.relrowsecurity = false;
$$;

-- Helper function: Check if specific table has RLS
CREATE OR REPLACE FUNCTION public.check_table_has_rls(p_table_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT c.relrowsecurity 
     FROM pg_class c
     JOIN pg_namespace n ON c.relnamespace = n.oid
     WHERE n.nspname = 'public' AND c.relname = p_table_name),
    false
  );
$$;

-- Helper function: Get tables missing specific policy type
CREATE OR REPLACE FUNCTION public.get_tables_missing_policy_type(policy_type text)
RETURNS TABLE(tablename text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.tablename::text
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE '__%'
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.tablename = t.tablename
    AND p.schemaname = 'public'
    AND (p.cmd = policy_type OR p.cmd = '*')
  );
$$;

-- Helper function: Count tenant domain data
CREATE OR REPLACE FUNCTION public.count_tenant_domain_data(p_company_id uuid)
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t text;
  domain_tables text[] := ARRAY['employees', 'departments', 'teams', 'locations', 'absence_requests', 'time_entries', 'documents'];
BEGIN
  FOREACH t IN ARRAY domain_tables LOOP
    BEGIN
      RETURN QUERY EXECUTE format('SELECT %L::text, COUNT(*)::bigint FROM %I WHERE company_id = $1', t, t) USING p_company_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN
      RETURN QUERY SELECT t::text, 0::bigint;
    END;
  END LOOP;
END;
$$;