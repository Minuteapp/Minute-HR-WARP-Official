-- RLS Policies für Chat-Modul

-- Policies für channels Tabelle
CREATE POLICY "Benutzer können öffentliche Kanäle sehen"
ON public.channels
FOR SELECT
USING (is_public = true OR id IN (
  SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
));

CREATE POLICY "Benutzer können Kanäle erstellen"
ON public.channels
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Ersteller können ihre Kanäle aktualisieren"
ON public.channels
FOR UPDATE
USING (auth.uid() = created_by);

-- Policies für channel_members Tabelle
CREATE POLICY "Benutzer können Channel-Mitglieder in ihren Kanälen sehen"
ON public.channel_members
FOR SELECT
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Benutzer können Kanälen beitreten"
ON public.channel_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können Kanäle verlassen"
ON public.channel_members
FOR DELETE
USING (auth.uid() = user_id);

-- Policies für messages Tabelle
CREATE POLICY "Benutzer können Nachrichten in ihren Kanälen sehen"
ON public.messages
FOR SELECT
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Benutzer können Nachrichten in ihren Kanälen senden"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  channel_id IN (
    SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Benutzer können ihre eigenen Nachrichten aktualisieren"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Benutzer können ihre eigenen Nachrichten löschen"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);