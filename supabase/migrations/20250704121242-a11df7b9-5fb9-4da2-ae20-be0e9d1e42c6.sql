-- Standard-Schichttypen hinzufügen (nur falls Tabelle leer ist)
INSERT INTO public.shift_types (name, start_time, end_time, color, required_staff, is_active)
SELECT 'Frühschicht', '06:00:00'::time, '14:00:00'::time, '#10B981', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Frühschicht')

UNION ALL

SELECT 'Spätschicht', '14:00:00'::time, '22:00:00'::time, '#F59E0B', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Spätschicht')

UNION ALL

SELECT 'Nachtschicht', '22:00:00'::time, '06:00:00'::time, '#6366F1', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Nachtschicht')

UNION ALL

SELECT 'Teilzeit Vormittag', '08:00:00'::time, '12:00:00'::time, '#8B5CF6', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Teilzeit Vormittag')

UNION ALL

SELECT 'Teilzeit Nachmittag', '13:00:00'::time, '17:00:00'::time, '#EC4899', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Teilzeit Nachmittag');