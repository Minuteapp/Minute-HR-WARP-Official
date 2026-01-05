
import { useToast } from "@/components/ui/use-toast";
import { loadBackgroundMusicFile } from "@/services/backgroundMusicService";
import { createAudioElement, cleanupAudio } from "@/utils/audioUtils";

export const useBackgroundMusic = (
  musicAudio: HTMLAudioElement | null,
  setMusicAudio: (audio: HTMLAudioElement | null) => void
) => {
  const { toast } = useToast();

  const loadBackgroundMusic = async (musicFileName: string) => {
    try {
      // Wenn keine Musik ausgewählt oder 'none' gewählt wurde
      if (!musicFileName || musicFileName === 'none') {
        cleanupAudio(musicAudio);
        setMusicAudio(null);
        return;
      }

      console.log('Loading background music:', musicFileName);
      const url = await loadBackgroundMusicFile(musicFileName);
      
      if (!url) {
        throw new Error('Keine URL für die Musikdatei erhalten');
      }

      console.log('Loading background music from URL:', url);
      
      // Bestehende Audio-Instanz bereinigen
      cleanupAudio(musicAudio);

      // Neue Audio-Instanz erstellen und laden
      const audio = await createAudioElement(url, {
        loop: true,
        volume: 0.3,
        preload: 'auto'
      });

      // Wiedergabe versuchen
      try {
        await audio.play();
        console.log('Background music started playing successfully');
        setMusicAudio(audio);
      } catch (playError) {
        console.error('Play error:', playError);
        if (playError instanceof Error) {
          throw new Error(`Fehler beim Abspielen: ${playError.message}`);
        }
        throw new Error('Fehler beim Abspielen der Musik');
      }

    } catch (error) {
      console.error('Error in loadBackgroundMusic:', error);
      
      // Detaillierte Fehlermeldung für den Benutzer
      let errorMessage = "Fehler beim Laden der Hintergrundmusik";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive"
      });
      
      setMusicAudio(null);
    }
  };

  return { loadBackgroundMusic };
};
