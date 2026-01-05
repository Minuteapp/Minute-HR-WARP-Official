-- Setze company_id auf NULL für SuperAdmin, damit er nicht automatisch getunnelt wird
UPDATE public.user_roles 
SET company_id = NULL 
WHERE user_id = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' 
AND role = 'superadmin';