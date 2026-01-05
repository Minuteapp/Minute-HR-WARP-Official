-- Standard-Schichttypen hinzufügen (falls nicht vorhanden)
INSERT INTO public.shift_types (name, start_time, end_time, color, required_staff, is_active) VALUES
('Frühschicht', '06:00:00', '14:00:00', '#10B981', 2, true),
('Spätschicht', '14:00:00', '22:00:00', '#F59E0B', 2, true),
('Nachtschicht', '22:00:00', '06:00:00', '#6366F1', 1, true),
('Teilzeit Vormittag', '08:00:00', '12:00:00', '#8B5CF6', 1, true),
('Teilzeit Nachmittag', '13:00:00', '17:00:00', '#EC4899', 1, true)
ON CONFLICT (name) DO NOTHING;