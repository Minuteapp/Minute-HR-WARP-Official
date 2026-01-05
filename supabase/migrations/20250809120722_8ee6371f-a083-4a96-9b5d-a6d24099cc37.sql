-- Teil-Test: Erstellung und Ablehnung prüfen (ohne Genehmigung, da FK-Fehler in sync_approved_absence_to_absences)

-- 1) Zwei Anträge anlegen (pending)
INSERT INTO public.absence_requests (
  id, user_id, employee_name, department, type, absence_type,
  start_date, end_date, half_day, status, reason, created_at, updated_at
) VALUES 
  ('d1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f', 'c0cfa510-10c2-432b-87fa-4c06171d9250', 'Daniel Häuslein', 'IT', 'vacation', 'vacation',
   '2025-08-20', '2025-08-21', false, 'pending', 'TEST: Urlaub (Pending)', now(), now()),
  ('e2f3a4b5-c6d7-4e8f-9012-2b3c4d5e6f7a', 'c0cfa510-10c2-432b-87fa-4c06171d9250', 'Daniel Häuslein', 'IT', 'vacation', 'vacation',
   '2025-08-22', '2025-08-22', false, 'pending', 'TEST: Urlaub (Ablehnung)', now(), now());

-- 2) Einen Antrag ablehnen (triggert Notifications)
UPDATE public.absence_requests
SET status = 'rejected', 
    rejection_reason = 'TEST: Kapazitätsengpass', 
    rejected_by = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 
    rejected_at = now(), 
    updated_at = now()
WHERE id = 'e2f3a4b5-c6d7-4e8f-9012-2b3c4d5e6f7a';