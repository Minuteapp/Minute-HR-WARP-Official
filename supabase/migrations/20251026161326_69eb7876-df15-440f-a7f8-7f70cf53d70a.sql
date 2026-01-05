-- Fix: Füge fehlende channel_members für existierende Channels hinzu
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  c.id, 
  c.created_by, 
  'owner'
FROM channels c
LEFT JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = c.created_by
WHERE cm.id IS NULL
  AND c.created_by IS NOT NULL
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Prüfe ob Trigger existiert und erstelle ihn neu
DROP TRIGGER IF EXISTS on_channel_created ON channels;

-- Erstelle Trigger-Funktion neu (falls nicht vorhanden)
CREATE OR REPLACE FUNCTION handle_new_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Füge Creator automatisch als Owner hinzu
  INSERT INTO channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (channel_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Erstelle Trigger
CREATE TRIGGER on_channel_created
  AFTER INSERT ON channels
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_channel();