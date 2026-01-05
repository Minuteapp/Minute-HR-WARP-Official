-- Allow frontend (anon) to read *global* role permission matrix rows (company_id IS NULL)
-- This fixes empty results when the app is not using Supabase Auth in the current session.

CREATE POLICY "anon can read global role permission matrix"
ON public.role_permission_matrix
FOR SELECT
TO anon
USING (company_id IS NULL);
