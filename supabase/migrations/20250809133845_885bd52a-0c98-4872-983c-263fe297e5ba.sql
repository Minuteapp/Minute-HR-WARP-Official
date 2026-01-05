-- Seed: Standard-Abwesenheitstypen einfügen, falls nicht vorhanden
-- Hinweis: Tabelle public.absence_types existiert bereits laut Schema

-- Urlaub
INSERT INTO public.absence_types (name, color, icon)
SELECT 'Urlaub', '#10B981', 'Sun'
WHERE NOT EXISTS (
  SELECT 1 FROM public.absence_types WHERE lower(name) = lower('Urlaub')
);

-- Krankheit
INSERT INTO public.absence_types (name, color, icon)
SELECT 'Krankheit', '#EF4444', 'HeartPulse'
WHERE NOT EXISTS (
  SELECT 1 FROM public.absence_types WHERE lower(name) = lower('Krankheit')
);

-- Homeoffice
INSERT INTO public.absence_types (name, color, icon)
SELECT 'Homeoffice', '#6366F1', 'Home'
WHERE NOT EXISTS (
  SELECT 1 FROM public.absence_types WHERE lower(name) = lower('Homeoffice')
);

-- Dienstreise
INSERT INTO public.absence_types (name, color, icon)
SELECT 'Dienstreise', '#F59E0B', 'Briefcase'
WHERE NOT EXISTS (
  SELECT 1 FROM public.absence_types WHERE lower(name) = lower('Dienstreise')
);

-- Fortbildung
INSERT INTO public.absence_types (name, color, icon)
SELECT 'Fortbildung', '#8B5CF6', 'GraduationCap'
WHERE NOT EXISTS (
  SELECT 1 FROM public.absence_types WHERE lower(name) = lower('Fortbildung')
);
