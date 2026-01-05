-- Testdaten für Abwesenheitsmodul anlegen und Aktionen simulieren
-- Mitarbeiter-ID (Daniel Häuslein) aus Datenbestand
-- Benutzer (Genehmiger/Ablehner): aktueller Superadmin

-- 1) Drei Anträge anlegen
INSERT INTO public.absence_requests (
  id, user_id, employee_name, department, type, absence_type,
  start_date, end_date, half_day, status, reason, created_at, updated_at
) VALUES 
  ('a7b2a5e0-1c3f-4e6b-9d12-1a2b3c4d5e6f', 'c0cfa510-10c2-432b-87fa-4c06171d9250', 'Daniel Häuslein', 'IT', 'vacation', 'vacation',
   '2025-08-10', '2025-08-12', false, 'pending', 'TEST: Urlaub', now(), now()),
  ('b8c3d6f1-2d4e-5f7a-8e23-2b3c4d5e6f7a', 'c0cfa510-10c2-432b-87fa-4c06171d9250', 'Daniel Häuslein', 'IT', 'sick_leave', 'sick_leave',
   '2025-08-09', '2025-08-09', true, 'pending', 'TEST: Krank', now(), now()),
  ('c9d4e7f2-3e5f-6a8b-9f34-3c4d5e6f7a8b', 'c0cfa510-10c2-432b-87fa-4c06171d9250', 'Daniel Häuslein', 'IT', 'vacation', 'vacation',
   '2025-08-15', '2025-08-16', false, 'pending', 'TEST: Urlaub Ablehnung', now(), now());

-- 2) Ersten Antrag genehmigen (triggert Notifications/Absences/Edge Function)
UPDATE public.absence_requests
SET status = 'approved', 
    approved_by = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 
    approved_at = now(), 
    updated_at = now()
WHERE id = 'a7b2a5e0-1c3f-4e6b-9d12-1a2b3c4d5e6f';

-- 3) Dritten Antrag ablehnen (triggert Notifications)
UPDATE public.absence_requests
SET status = 'rejected', 
    rejection_reason = 'TEST: Unzureichende Kapazität', 
    rejected_by = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2', 
    rejected_at = now(), 
    updated_at = now()
WHERE id = 'c9d4e7f2-3e5f-6a8b-9f34-3c4d5e6f7a8b';