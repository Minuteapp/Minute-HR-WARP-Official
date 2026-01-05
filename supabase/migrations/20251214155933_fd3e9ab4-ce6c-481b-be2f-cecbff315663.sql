-- Create storage policies for voice-messages bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for message-attachments bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own voice messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can view voice messages in their channels" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments in their channels" ON storage.objects;

-- Voice Messages: Users can upload to their own folder
CREATE POLICY "Users can upload their own voice messages"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'voice-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Voice Messages: Users can view files in channels they're members of
CREATE POLICY "Users can view voice messages in their channels"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'voice-messages'
  AND (
    -- User owns the file
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- File is associated with a message in a channel the user is member of
    EXISTS (
      SELECT 1 FROM public.voice_messages vm
      JOIN public.messages m ON vm.message_id = m.id
      JOIN public.channel_members cm ON cm.channel_id = m.channel_id
      WHERE vm.file_path = name
      AND cm.user_id = auth.uid()
    )
  )
);

-- Message Attachments: Users can upload to their own folder
CREATE POLICY "Users can upload their own attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Message Attachments: Users can view files in channels they're members of
CREATE POLICY "Users can view attachments in their channels"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND (
    -- User owns the file
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- File is associated with a message in a channel the user is member of
    EXISTS (
      SELECT 1 FROM public.message_attachments ma
      JOIN public.messages m ON ma.message_id = m.id
      JOIN public.channel_members cm ON cm.channel_id = m.channel_id
      WHERE ma.file_path = name
      AND cm.user_id = auth.uid()
    )
  )
);