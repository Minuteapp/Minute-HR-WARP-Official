-- Remove all mock/sample data from absence-related tables
DELETE FROM public.absence_requests WHERE created_at < now();
DELETE FROM public.absences WHERE created_at < now();
DELETE FROM public.absence_notifications WHERE created_at < now();
DELETE FROM public.absence_auto_notifications WHERE created_at < now();
DELETE FROM public.absence_documents WHERE uploaded_at < now();