-- Füge die fehlende last_read_at Spalte zur channel_members Tabelle hinzu
ALTER TABLE public.channel_members 
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Aktualisiere bestehende Einträge mit einem Standard-Zeitstempel
UPDATE public.channel_members 
SET last_read_at = NOW() 
WHERE last_read_at IS NULL;