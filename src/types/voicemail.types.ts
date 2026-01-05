
export interface VoicemailMessage {
  id: string;
  title: string;
  status: string;
  created_at: string;
  message_text: string;
  message: string;
  music_title: string | null;
  message_type: string;
  voice_id: string;
  audio_url: string | null;
  duration: string | null;
  speaker_name: string | null;
  language: string | null;
  message_id: string;
  music_id: string;
  voice_type: string;
  system_id: string;
}
