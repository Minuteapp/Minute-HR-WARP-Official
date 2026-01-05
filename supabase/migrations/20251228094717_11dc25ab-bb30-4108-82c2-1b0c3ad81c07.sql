-- Alle doppelten Einträge entfernen und nur einen behalten

-- Schritt 1: Temporäre Tabelle mit eindeutigen Einträgen erstellen
CREATE TEMP TABLE temp_unique_events AS
SELECT DISTINCT ON (source_module, source_id) *
FROM public.cross_module_events
ORDER BY source_module, source_id, created_at DESC;

-- Schritt 2: Alle Daten löschen
TRUNCATE public.cross_module_events;

-- Schritt 3: Eindeutige Daten zurück einfügen
INSERT INTO public.cross_module_events 
SELECT * FROM temp_unique_events;

-- Schritt 4: Temporäre Tabelle löschen
DROP TABLE temp_unique_events;

-- Schritt 5: UNIQUE-Index hinzufügen
CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_module_events_source_unique 
ON public.cross_module_events (source_module, source_id);