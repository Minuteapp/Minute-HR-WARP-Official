
import { useState } from "react";
import { cleanupAudio } from "@/utils/audioUtils";

export const useAudioState = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [musicAudio, setMusicAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioContent, setAudioContent] = useState<string | null>(null);

  const resetAudio = () => {
    cleanupAudio(audio);
    cleanupAudio(musicAudio);
    setAudio(null);
    setMusicAudio(null);
    setAudioUrl(null);
    setAudioContent(null);
    setIsPlaying(false);
  };

  return {
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
  };
};
