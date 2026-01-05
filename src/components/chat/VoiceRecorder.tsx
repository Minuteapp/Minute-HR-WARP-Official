import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X, Play, Pause } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleStart = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Mikrofon-Zugriff verweigert. Bitte Berechtigung erteilen.');
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    }
  };

  const handleCancel = () => {
    cancelRecording();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    onCancel();
  };

  const handlePlayPause = () => {
    if (!audioBlob) return;

    if (!audioUrl) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording && !audioBlob) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleStart}
        className="h-9 w-9"
      >
        <Mic className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
      {isRecording ? (
        <>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleStop}
            className="h-9 w-9 rounded-full animate-pulse"
          >
            <Square className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-destructive rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-mono text-destructive">
              {formatDuration(duration)}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            className="h-9 w-9"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <span className="text-sm font-mono">{formatDuration(duration)}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={handleSend}
            className="h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
