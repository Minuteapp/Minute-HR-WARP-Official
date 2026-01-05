-- Tabelle für Kanal-Mitglied-Einstellungen erstellen
CREATE TABLE IF NOT EXISTS public.channel_member_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  notify_all BOOLEAN DEFAULT false,
  notify_mentions BOOLEAN DEFAULT true,
  pinned BOOLEAN DEFAULT false,
  thread_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- RLS aktivieren
ALTER TABLE public.channel_member_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own settings"
  ON public.channel_member_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.channel_member_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.channel_member_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.channel_member_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index für schnelle Abfragen
CREATE INDEX idx_channel_member_settings_user_channel ON public.channel_member_settings(user_id, channel_id);