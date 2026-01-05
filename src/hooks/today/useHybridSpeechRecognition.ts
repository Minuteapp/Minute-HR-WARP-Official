import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useWhisperRecognition } from './useWhisperRecognition';
import { useToast } from '@/hooks/use-toast';

type SpeechMethod = 'web-speech' | 'whisper';

interface UseHybridSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string | null;
  error: string | null;
  currentMethod: SpeechMethod | null;
  availableMethods: {
    webSpeech: boolean;
    whisper: boolean;
  };
  toggleListening: () => void;
  setPreferredMethod: (method: SpeechMethod) => void;
  resetTranscript: () => void;
  audioLevel: number;
  remainingTime: number;
}

const STORAGE_KEY = 'preferred-speech-method';

export const useHybridSpeechRecognition = (): UseHybridSpeechRecognitionReturn => {
  const { toast } = useToast();
  const [currentMethod, setCurrentMethod] = useState<SpeechMethod | null>(null);
  const [preferredMethod, setPreferredMethodState] = useState<SpeechMethod>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as SpeechMethod;
      // Whisper als Standard (und Migration falls noch web-speech gespeichert war)
      return stored === 'web-speech' ? 'whisper' : (stored || 'whisper');
    }
    return 'whisper';
  });

  // Initialize both hooks
  const webSpeech = useSpeechRecognition();
  const whisper = useWhisperRecognition();

  // Check which methods are available
  const availableMethods = {
    webSpeech: !webSpeech.permissionError && typeof window !== 'undefined',
    whisper: true // Whisper API is always available if backend is configured
  };

  // Determine active transcript and error
  const activeTranscript = currentMethod === 'web-speech' 
    ? webSpeech.transcriptResult 
    : whisper.transcript;

  const activeError = currentMethod === 'web-speech' 
    ? webSpeech.permissionError 
    : whisper.error;

  const isListening = currentMethod === 'web-speech' 
    ? webSpeech.isListening 
    : (whisper.isRecording || whisper.isProcessing);

  // Handle fallback from Web Speech API to Whisper
  useEffect(() => {
    if (currentMethod === 'web-speech' && webSpeech.permissionError) {
      const error = webSpeech.permissionError.toLowerCase();
      
      // Auto-fallback for service-not-allowed errors
      if (error.includes('service-not-allowed') || error.includes('dienst nicht verfügbar')) {
        console.log('🔄 Web Speech API nicht verfügbar, wechsle zu Whisper API');
        setCurrentMethod('whisper');
        
        toast({
          title: 'Spracherkennung gewechselt',
          description: 'Web Speech API nicht verfügbar. Whisper API wird verwendet.',
        });
      }
    }
  }, [webSpeech.permissionError, currentMethod, toast]);

  // Handle Web Speech API transcript
  useEffect(() => {
    if (currentMethod === 'web-speech' && webSpeech.transcriptResult) {
      console.log('📝 Web Speech Transkript erhalten:', webSpeech.transcriptResult);
    }
  }, [webSpeech.transcriptResult, currentMethod]);

  // Handle Whisper API transcript
  useEffect(() => {
    if (currentMethod === 'whisper' && whisper.transcript) {
      console.log('📝 Whisper Transkript erhalten:', whisper.transcript);
    }
  }, [whisper.transcript, currentMethod]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop current method
      if (currentMethod === 'web-speech') {
        webSpeech.toggleListening();
      } else if (currentMethod === 'whisper') {
        whisper.stopRecording();
      }
      setCurrentMethod(null);
    } else {
      // Start with preferred method
      let methodToUse = preferredMethod;

      // If preferred method is not available, use fallback
      if (methodToUse === 'web-speech' && !availableMethods.webSpeech) {
        methodToUse = 'whisper';
        toast({
          title: 'Fallback aktiviert',
          description: 'Web Speech API nicht verfügbar, verwende Whisper API.',
        });
      }

      console.log(`🎤 Starte Spracherkennung mit ${methodToUse}`);
      setCurrentMethod(methodToUse);

      if (methodToUse === 'web-speech') {
        webSpeech.toggleListening();
      } else {
        whisper.startRecording();
      }
    }
  }, [isListening, currentMethod, preferredMethod, availableMethods, webSpeech, whisper, toast]);

  const setPreferredMethod = useCallback((method: SpeechMethod) => {
    setPreferredMethodState(method);
    localStorage.setItem(STORAGE_KEY, method);
    console.log(`✅ Bevorzugte Methode gesetzt: ${method}`);
  }, []);

  const resetTranscript = useCallback(() => {
    webSpeech.resetTranscript();
    whisper.resetTranscript();
  }, [webSpeech, whisper]);

  return {
    isListening,
    transcript: activeTranscript,
    error: activeError,
    currentMethod,
    availableMethods,
    toggleListening,
    setPreferredMethod,
    resetTranscript,
    audioLevel: whisper.audioLevel,
    remainingTime: whisper.remainingTime
  };
};
