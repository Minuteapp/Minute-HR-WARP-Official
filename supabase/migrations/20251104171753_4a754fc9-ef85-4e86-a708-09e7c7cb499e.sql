-- Insert test data for Test Employee
-- Employee ID: dddddddd-3333-4444-5555-cccccccccccc
-- Auth User ID: cccccccc-2222-3333-4444-bbbbbbbbbbbb

-- Insert time_entries test data (using auth.user_id)
INSERT INTO time_entries (user_id, start_time, end_time, location, project, status, break_minutes)
VALUES 
  -- Letzte Woche (28.10 - 01.11)
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-10-28 08:30:00+00', '2025-10-28 17:30:00+00', 'office', 'Digitalisierung Q4', 'completed', 60),
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-10-29 08:15:00+00', '2025-10-29 17:45:00+00', 'office', 'Budget Planning 2026', 'completed', 60),
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-10-30 09:00:00+00', '2025-10-30 17:00:00+00', 'home', 'Digitalisierung Q4', 'completed', 60),
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-10-31 08:30:00+00', '2025-10-31 17:30:00+00', 'office', 'Budget Planning 2026', 'completed', 60),
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-11-01 08:00:00+00', '2025-11-01 16:00:00+00', 'home', 'Administrative Aufgaben', 'completed', 60),
  -- Aktuelle Woche (03.11 - 04.11)
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-11-03 08:30:00+00', '2025-11-03 17:30:00+00', 'office', 'Digitalisierung Q4', 'completed', 60),
  ('cccccccc-2222-3333-4444-bbbbbbbbbbbb', '2025-11-04 08:15:00+00', '2025-11-04 17:45:00+00', 'office', 'Budget Planning 2026', 'completed', 60);

-- Insert overtime_entries test data (using correct constraint values)
INSERT INTO overtime_entries (employee_id, overtime_hours, notes, overtime_type, compensation_method, status, created_at)
VALUES 
  ('dddddddd-3333-4444-5555-cccccccccccc', 2.5, 'Projektabschluss Digitalisierung', 'daily', 'payout', 'approved', '2025-10-03 10:00:00+00'),
  ('dddddddd-3333-4444-5555-cccccccccccc', -6.0, 'Abbau durch Freizeitausgleich', 'daily', 'time_off', 'processed', '2025-09-27 10:00:00+00'),
  ('dddddddd-3333-4444-5555-cccccccccccc', 3.0, 'Dringender Bugfix', 'emergency', 'payout', 'approved', '2025-09-20 10:00:00+00');