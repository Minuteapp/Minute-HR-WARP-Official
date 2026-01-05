-- Erstelle einen Trigger, der automatisch den Channel-Ersteller als Mitglied hinzufügt
CREATE OR REPLACE FUNCTION public.handle_new_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Füge den Ersteller automatisch als Owner hinzu
  INSERT INTO public.channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$;

-- Trigger für neue Channels
DROP TRIGGER IF EXISTS on_channel_created ON public.channels;
CREATE TRIGGER on_channel_created
  AFTER INSERT ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_channel();