-- Test-Daten für Deutsche Abwesenheits-Implementierung

-- Erst die Abwesenheitsarten einfügen (falls noch nicht vorhanden)
INSERT INTO public.de_abwesenheitsarten (
  name, code, kategorie, ist_urlaubstag, ist_arbeitstag, 
  lohnfortzahlung, lohnfortzahlung_prozent, sozialversicherung, 
  steuerlich_relevant, nachweis_erforderlich, nachweis_ab_tag,
  genehmigung_erforderlich, vorlaufzeit_tage, max_tage_pro_jahr,
  uebertragbar, auszahlung_erlaubt, farbe, icon
) VALUES 
('Jahresurlaub', 'URLAUB', 'urlaub', true, false, true, 100, true, false, false, null, true, 14, 30, true, true, '#10B981', 'calendar'),
('Krankheit', 'KRANK', 'krankheit', false, false, true, 100, true, false, true, 3, false, 0, null, false, false, '#EF4444', 'heart'),
('Bildungsurlaub', 'BILDUNG', 'urlaub', true, false, true, 100, true, false, false, null, true, 30, 5, false, false, '#3B82F6', 'book')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  kategorie = EXCLUDED.kategorie;

-- Test-Abwesenheitsanträge erstellen
INSERT INTO public.de_abwesenheitsantraege (
  mitarbeiter_id, abwesenheitsart_id, start_datum, ende_datum,
  grund, status, tage_gesamt, halber_tag
) 
SELECT 
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' as mitarbeiter_id,
  da.id as abwesenheitsart_id,
  CURRENT_DATE + interval '1 week' as start_datum,
  CURRENT_DATE + interval '1 week' + interval '2 days' as ende_datum,
  'Test-Antrag für ' || da.name as grund,
  'eingereicht' as status,
  3 as tage_gesamt,
  false as halber_tag
FROM public.de_abwesenheitsarten da
WHERE da.code = 'URLAUB'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Ein genehmigter Antrag
INSERT INTO public.de_abwesenheitsantraege (
  mitarbeiter_id, abwesenheitsart_id, start_datum, ende_datum,
  grund, status, tage_gesamt, halber_tag,
  erster_genehmiger_id, erster_genehmiger_datum
) 
SELECT 
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' as mitarbeiter_id,
  da.id as abwesenheitsart_id,
  CURRENT_DATE - interval '1 week' as start_datum,
  CURRENT_DATE - interval '4 days' as ende_datum,
  'Bereits genehmigter Urlaub' as grund,
  'genehmigt' as status,
  4 as tage_gesamt,
  false as halber_tag,
  'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' as erster_genehmiger_id,
  CURRENT_DATE - interval '1 week' - interval '1 day' as erster_genehmiger_datum
FROM public.de_abwesenheitsarten da
WHERE da.code = 'URLAUB'
LIMIT 1
ON CONFLICT DO NOTHING;