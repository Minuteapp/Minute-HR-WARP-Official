
import { supabase } from "@/integrations/supabase/client";

interface VoicemailData {
  type: string;
  voice: string;
  text: string;
  music: string | null;
  audioContent: string;
  audioUrl: string;
}

export const createVoicemailAnnouncement = async (data: VoicemailData) => {
  try {
    // Hole zuerst die persönlichen Daten des Benutzers
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Nicht eingeloggt');
    }

    const { data: personalData, error: personalDataError } = await supabase
      .from('voicemail_personal_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (personalDataError) {
      console.error('Error fetching personal data:', personalDataError);
      throw personalDataError;
    }

    const { data: result, error } = await supabase
      .from('voicemail_messages')
      .insert([
        {
          title: data.type === "custom" ? "Benutzerdefinierte Ansage" : `${data.type} Ansage`,
          message_type: data.type,
          voice_id: data.voice,
          message_text: data.text,
          music_title: data.music,
          status: 'active',
          audio_content: data.audioContent,
          audio_url: data.audioUrl,
          message: data.text,
          user_id: user.id,
          personal_data: personalData ? {
            mobile_number: personalData.mobile_number,
            mobile_provider: personalData.mobile_provider
          } : null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }

    return result;
  } catch (error: any) {
    console.error('Error in createVoicemailAnnouncement:', error);
    throw error;
  }
};

