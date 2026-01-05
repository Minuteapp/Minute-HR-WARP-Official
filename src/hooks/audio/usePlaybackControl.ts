
import { useToast } from "@/components/ui/use-toast";

export const usePlaybackControl = (
  audio: HTMLAudioElement | null,
  musicAudio: HTMLAudioElement | null,
  setIsPlaying: (playing: boolean) => void
) => {
  const { toast } = useToast();

  const handlePlayPause = async () => {
    if (!audio) return;
    
    try {
      if (audio.paused) {
        audio.currentTime = 0;
        if (musicAudio) {
          musicAudio.currentTime = 0;
        }

        if (musicAudio) {
          try {
            await musicAudio.play();
          } catch (musicError) {
            console.error('Fehler beim Abspielen der Hintergrundmusik:', musicError);
          }
        }

        await audio.play();
        
        audio.onended = () => {
          setIsPlaying(false);
          if (musicAudio) {
            musicAudio.pause();
            musicAudio.currentTime = 0;
          }
        };

        setIsPlaying(true);
      } else {
        audio.pause();
        if (musicAudio) {
          musicAudio.pause();
        }
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Abspielen der Vorschau",
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  return { handlePlayPause };
};
