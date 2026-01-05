import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, RotateCcw, AlertCircle } from 'lucide-react';

interface VoiceMessagePlayerProps {
  fileUrl: string;
  duration: number;
}

export const VoiceMessagePlayer = ({
  fileUrl,
  duration,
}: VoiceMessagePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Try to convert WebM to MP3 via Edge Function if needed
  const tryConvertToMp3 = useCallback(async (originalUrl: string) => {
    console.log('🎤 Attempting WebM to MP3 conversion...');
    try {
      // For now, just try the original URL - conversion would require Edge Function
      // This is a fallback that logs the issue
      console.log('🎤 MP3 conversion not available - using original URL');
      return null;
    } catch (error) {
      console.error('🎤 MP3 conversion failed:', error);
      return null;
    }
  }, []);

  const loadAudio = useCallback(async () => {
    const urlToUse = convertedUrl || fileUrl;
    
    // URL-Validierung vor dem Laden
    if (!urlToUse || urlToUse === '' || !urlToUse.startsWith('https://')) {
      console.log('🎤 VoiceMessagePlayer: Invalid or missing fileUrl:', urlToUse);
      setErrorMessage('Audio-URL fehlt oder ist ungültig');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    console.log('🎤 VoiceMessagePlayer: Loading audio from:', urlToUse.substring(0, 100) + '...');
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio();
    
    audio.addEventListener('canplay', () => {
      console.log('🎤 Audio ready to play');
      setIsLoading(false);
    });

    audio.addEventListener('error', async (e) => {
      const audioElement = e.target as HTMLAudioElement;
      const errorCode = audioElement.error?.code;
      
      // Prüfe ob es ein Blob-URL ist (dann ist Format-Support anders)
      const isBlobUrl = urlToUse.startsWith('blob:');
      
      const errorMessages: Record<number, string> = {
        1: 'Audio wurde abgebrochen',
        2: 'Netzwerkfehler - Bitte Internetverbindung prüfen',
        3: 'Audio-Dekodierung fehlgeschlagen',
        4: isBlobUrl 
          ? 'Audio-Format wird vom Browser nicht unterstützt. Bitte einen anderen Browser verwenden (z.B. Chrome oder Firefox).'
          : 'Audio-Format wird nicht unterstützt'
      };
      
      const errorMsg = errorMessages[errorCode || 0] || 'Unbekannter Audio-Fehler';
      console.error('🎤 Audio error code:', errorCode, errorMsg);
      console.error('🎤 Audio error message:', audioElement.error?.message);
      console.error('🎤 URL type:', isBlobUrl ? 'Blob-URL' : 'Remote-URL');
      
      // If format not supported and we haven't tried conversion yet
      if (errorCode === 4 && !convertedUrl && retryCount === 0 && !isBlobUrl) {
        console.log('🎤 Format not supported, attempting conversion...');
        const mp3Url = await tryConvertToMp3(fileUrl);
        if (mp3Url) {
          setConvertedUrl(mp3Url);
          setRetryCount(prev => prev + 1);
          return;
        }
      }
      
      setErrorMessage(errorMsg);
      setHasError(true);
      setIsLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime || 0);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Set source after adding listeners
    audio.src = urlToUse;
    audioRef.current = audio;
  }, [fileUrl, convertedUrl, retryCount, tryConvertToMp3]);

  useEffect(() => {
    loadAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [loadAudio, retryCount]);

  const handleRetry = () => {
    console.log('🎤 Retrying audio load...');
    setRetryCount(prev => prev + 1);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg max-w-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Audio nicht verfügbar</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {errorMessage || 'Unbekannter Fehler beim Laden'}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetry}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Erneut
          </Button>
          {fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-sm">
        <span className="text-sm text-muted-foreground">Wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-sm">
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayPause}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!fileUrl}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current" />
        )}
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-8 flex items-center gap-0.5">
          {[...Array(40)].map((_, i) => {
            const barProgress = (i / 40) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  isActive ? 'bg-primary' : 'bg-primary/20'
                }`}
                style={{
                  height: `${Math.random() * 100}%`,
                  minHeight: '20%',
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
