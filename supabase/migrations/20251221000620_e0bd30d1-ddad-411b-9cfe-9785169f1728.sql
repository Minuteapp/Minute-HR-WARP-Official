-- Tabelle für Nachricht-Lesezeichen erstellen
CREATE TABLE public.message_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  channel_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Eindeutiger Index: Ein Benutzer kann eine Nachricht nur einmal als Lesezeichen speichern
CREATE UNIQUE INDEX idx_message_bookmarks_user_message ON public.message_bookmarks(user_id, message_id);

-- Index für schnelle Abfragen nach Benutzer
CREATE INDEX idx_message_bookmarks_user ON public.message_bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur ihre eigenen Lesezeichen sehen
CREATE POLICY "Users can view their own bookmarks" 
ON public.message_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Benutzer können ihre eigenen Lesezeichen erstellen
CREATE POLICY "Users can create their own bookmarks" 
ON public.message_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Lesezeichen löschen
CREATE POLICY "Users can delete their own bookmarks" 
ON public.message_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);