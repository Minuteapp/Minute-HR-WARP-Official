
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { loadBackgroundMusicFile } from "@/services/backgroundMusicService";
import { createAudioElement, cleanupAudio } from "@/utils/audioUtils";
import { VoicemailMessage } from "@/types/voicemail.types";

export const useVoicemailPlayer = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentMusicAudio, setCurrentMusicAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Cleanup-Funktion für Blob-URLs
  useEffect(() => {
    return () => {
      if (currentMusicAudio?.src) {
        URL.revokeObjectURL(currentMusicAudio.src);
      }
    };
  }, [currentMusicAudio]);

  const handlePlay = async (message: VoicemailMessage) => {
    try {
      // If already playing this message, stop it
      if (isPlaying === message.id) {
        currentAudio?.pause();
        currentMusicAudio?.pause();
        setIsPlaying(null);
        return;
      }

      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentMusicAudio?.pause();
      }

      // Check if we have an audio URL
      if (!message.audio_url) {
        throw new Error('Keine Audio-Daten verfügbar für diese Nachricht');
      }

      // Create new audio element with the URL
      const audio = await createAudioElement(message.audio_url);

      // Setup music if available
      let musicAudio = null;
      if (message.music_title) {
        try {
          const musicUrl = await loadBackgroundMusicFile(message.music_title);
          if (musicUrl) {
            musicAudio = await createAudioElement(musicUrl, {
              loop: true,
              volume: 0.3,
              preload: 'auto'
            });
            setCurrentMusicAudio(musicAudio);
            await musicAudio.play();
          }
        } catch (musicError) {
          console.error('Error loading background music:', musicError);
          // Wir setzen fort ohne Hintergrundmusik, wenn sie nicht geladen werden kann
        }
      }

      // Play the voice message
      await audio.play();
      setCurrentAudio(audio);
      setIsPlaying(message.id);

      // Handle audio ending
      audio.onended = () => {
        setIsPlaying(null);
        if (musicAudio) {
          musicAudio.pause();
          musicAudio.currentTime = 0;
          URL.revokeObjectURL(musicAudio.src);
        }
      };

    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Abspielen der Ansage",
        variant: "destructive"
      });
      setIsPlaying(null);
    }
  };

  return {
    isPlaying,
    handlePlay
  };
};
