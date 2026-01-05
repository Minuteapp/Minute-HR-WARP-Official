-- Fix Chat System Migration - Drop existing policy first

-- Drop the conflicting policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.chat_notifications;

-- Create the policy again
CREATE POLICY "Users can view their own notifications" ON public.chat_notifications
  FOR ALL USING (user_id = auth.uid());

-- Add missing message seed data 
INSERT INTO public.messages (id, content, sender_id, channel_id, message_type, created_at, metadata) VALUES
  (gen_random_uuid(), 'Willkommen bei MINUTE! Bitte neue Richtlinie lesen.', (SELECT id FROM auth.users LIMIT 1), 'c1', 'text', '2025-08-16T08:00:00Z', '{"pinned": true}'),
  (gen_random_uuid(), 'Unterdeckung heute 14–22 Uhr. Wer kann übernehmen?', (SELECT id FROM auth.users LIMIT 1), 'c3', 'text', '2025-08-16T08:05:00Z', '{}')
ON CONFLICT (id) DO NOTHING;