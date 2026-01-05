-- Mitarbeiter soll Einstellungen sehen dürfen (Navigation prüft "view")
UPDATE public.role_permission_matrix
SET allowed_actions =
  CASE
    WHEN allowed_actions IS NULL THEN ARRAY['view']::text[]
    WHEN 'view' = ANY(allowed_actions) THEN allowed_actions
    ELSE array_append(allowed_actions, 'view')
  END
WHERE role = 'employee'
  AND lower(module_name) = 'settings';