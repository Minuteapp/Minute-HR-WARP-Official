
import { useEffect } from "react";
import { useAudioState } from "./audio/useAudioState";
import { usePreviewGeneration } from "./audio/usePreviewGeneration";
import { useBackgroundMusic } from "./audio/useBackgroundMusic";
import { usePlaybackControl } from "./audio/usePlaybackControl";

export const useVoicemailAudio = () => {
  const {
    audio,
    setAudio,
    musicAudio,
    setMusicAudio,
    isPlaying,
    setIsPlaying,
    loading,
    setLoading,
    isGenerating,
    setIsGenerating,
    audioUrl,
    setAudioUrl,
    audioContent,
    setAudioContent,
    resetAudio
  } = useAudioState();

  const { generatePreview } = usePreviewGeneration(
    setLoading,
    setIsGenerating,
    setAudioContent,
    setAudioUrl,
    setAudio
  );

  const { loadBackgroundMusic } = useBackgroundMusic(musicAudio, setMusicAudio);
  const { handlePlayPause } = usePlaybackControl(audio, musicAudio, setIsPlaying);

  useEffect(() => {
    return () => {
      resetAudio();
    };
  }, []);

  return {
    audio,
    audioUrl,
    audioContent,
    isPlaying,
    loading,
    isGenerating,
    generatePreview,
    loadBackgroundMusic,
    handlePlayPause,
    resetAudio
  };
};
