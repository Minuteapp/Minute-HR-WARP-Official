
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createAudioElement } from "@/utils/audioUtils";

export const usePreviewGeneration = (
  setLoading: (loading: boolean) => void,
  setIsGenerating: (generating: boolean) => void,
  setAudioContent: (content: string | null) => void,
  setAudioUrl: (url: string | null) => void,
  setAudio: (audio: HTMLAudioElement | null) => void,
) => {
  const { toast } = useToast();

  const generatePreview = async (text: string, voiceId: string) => {
    if (!voiceId || !text) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Stimme aus und geben Sie einen Text ein.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    setIsGenerating(true);

    try {
      console.log('Generating preview with:', { text, voice_id: voiceId });
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice_id: voiceId }
      });

      if (error) throw error;

      if (!data?.audioContent || !data?.audioUrl) {
        throw new Error('Keine Audio-Daten von der API erhalten');
      }

      setAudioContent(data.audioContent);
      setAudioUrl(data.audioUrl);
      
      const newAudio = await createAudioElement(data.audioUrl);
      setAudio(newAudio);
      
      toast({
        title: "Erfolg",
        description: "Vorschau wurde generiert"
      });

      return {
        content: data.audioContent,
        url: data.audioUrl
      };
    } catch (error: any) {
      console.error('Error generating preview:', error);
      let errorMessage = "Fehler bei der Generierung der Vorschau";
      
      if (error.message?.includes('too_many_concurrent_requests')) {
        errorMessage = "Zu viele gleichzeitige Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return { generatePreview };
};
