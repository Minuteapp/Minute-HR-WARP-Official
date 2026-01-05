
export const createAudioElement = async (url: string, options: {
  loop?: boolean;
  volume?: number;
  preload?: HTMLAudioElement['preload'];
} = {}): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    const onCanPlayThrough = () => {
      console.log('Audio can play through:', url);
      cleanup();
      resolve(audio);
    };

    const onLoadedMetadata = () => {
      console.log('Audio metadata loaded:', url);
    };

    const onError = (error: Event) => {
      const audioElement = error.target as HTMLAudioElement;
      let errorMessage = 'Unbekannter Fehler';
      
      if (audioElement.error) {
        console.error('MediaError code:', audioElement.error.code);
        console.error('MediaError message:', audioElement.error.message);
        
        // Detaillierte Fehlermeldung basierend auf dem MediaError Code
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Die Wiedergabe wurde abgebrochen';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Ein Netzwerkfehler ist aufgetreten';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Die Audiodatei konnte nicht dekodiert werden';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Das Audioformat wird nicht unterstützt. Bitte verwenden Sie MP3, WAV oder OGG Dateien.';
            break;
          default:
            errorMessage = audioElement.error.message || 'Unbekannter Fehler';
        }
      }

      console.error('Audio loading error:', {
        url,
        error,
        errorMessage,
        audioElementError: audioElement.error
      });

      cleanup();
      reject(new Error(errorMessage));
    };

    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };

    // Event Listener hinzufügen
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    // Audio Eigenschaften setzen
    audio.loop = options.loop ?? false;
    audio.volume = options.volume ?? 1;
    audio.preload = options.preload ?? 'auto';
    
    // URL setzen und Laden starten
    console.log('Setting audio source URL:', url);
    audio.src = url;
    
    // Timeout für den Fall, dass das Audio nicht geladen werden kann
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout beim Laden der Audio-Datei'));
    }, 30000);

    // Wenn das Audio geladen wird, Timeout löschen
    audio.oncanplaythrough = () => {
      clearTimeout(timeoutId);
    };
  });
};

export const cleanupAudio = (audio: HTMLAudioElement | null) => {
  if (audio) {
    try {
      // Stoppen und zurücksetzen
      audio.pause();
      audio.currentTime = 0;
      
      // Event Listener entfernen
      audio.oncanplaythrough = null;
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.onended = null;
      
      // Quelle entfernen und neu laden
      audio.src = '';
      audio.load();
    } catch (error) {
      console.error('Error during audio cleanup:', error);
    }
  }
};
