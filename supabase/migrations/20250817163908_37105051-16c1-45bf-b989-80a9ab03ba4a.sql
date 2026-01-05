-- Fix: Migration für Ziele-Modul ohne falsche Trigger-Referenz

-- 1. Trigger für updated_at korrigieren
CREATE TRIGGER update_goal_links_updated_at
  BEFORE UPDATE ON public.goal_links
  FOR EACH ROW EXECUTE FUNCTION update_goal_updated_at();