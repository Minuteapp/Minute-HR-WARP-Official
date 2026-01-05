import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SILENCE_THRESHOLD = 2000; // 2s Stille = automatisches Stoppen
const SILENCE_LEVEL = 35; // Höherer Schwellwert für weniger empfindliche Stille-Erkennung  
const MAX_RECORDING_TIME = 60000; // 60 Sekunden max

interface UseWhisperRecognitionReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
  permissionGranted: boolean;
  audioLevel: number;
  remainingTime: number;
}

export const useWhisperRecognition = (): UseWhisperRecognitionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [remainingTime, setRemainingTime] = useState(MAX_RECORDING_TIME / 1000);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // VAD (Voice Activity Detection) refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(Date.now());

  // Cleanup timers
  const cleanupTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Audio level monitoring with VAD
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    
    setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1
    
    // VAD: Check for silence
    if (average > SILENCE_LEVEL) {
      // Sound detected - reset silence timer
      lastSoundTimeRef.current = Date.now();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else {
      // Silence detected - start timer if not already running
      const silenceDuration = Date.now() - lastSoundTimeRef.current;
      if (silenceDuration >= SILENCE_THRESHOLD && !silenceTimerRef.current) {
        console.log('🔇 Stille erkannt nach', silenceDuration, 'ms, stoppe automatisch...');
        // Import toast dynamically to avoid circular deps
        import('sonner').then(({ toast }) => {
          toast.info('⏹️ Stille erkannt - Stoppe Aufnahme...');
        });
        silenceTimerRef.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            stopRecordingInternal();
          }
        }, 100);
      }
    }
    
    // Continue monitoring
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [isRecording]);

  const stopRecordingInternal = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('🛑 Stoppe Aufnahme...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      cleanupTimers();
    }
  }, [cleanupTimers]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setRemainingTime(MAX_RECORDING_TIME / 1000);
      lastSoundTimeRef.current = Date.now();
      console.log('🎙️ Starte Whisper-Aufnahme...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Setup AudioContext for VAD
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create MediaRecorder with optimal settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`📦 Audio-Chunk empfangen: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏸️ Aufnahme gestoppt, verarbeite Audio...');
        await processAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('✅ Aufnahme gestartet');

      // Start audio level monitoring (VAD)
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);

      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Max recording time auto-stop
      maxRecordingTimerRef.current = setTimeout(() => {
        console.log('⏰ Max. Aufnahmezeit erreicht, stoppe automatisch');
        stopRecordingInternal();
      }, MAX_RECORDING_TIME);

    } catch (err: any) {
      console.error('❌ Fehler beim Starten der Aufnahme:', err);
      let errorMessage = 'Fehler beim Zugriff auf das Mikrofon';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff.';
        setPermissionGranted(false);
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Audio-Aufnahme wird nicht unterstützt.';
      }
      
      setError(errorMessage);
    }
  }, [monitorAudioLevel, stopRecordingInternal]);

  const stopRecording = useCallback(() => {
    stopRecordingInternal();
  }, [stopRecordingInternal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  const processAudio = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log(`🎵 Verarbeite Audio-Datei: ${audioBlob.size} bytes`);

      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Call Whisper API via Edge Function
      console.log('📡 Sende Audio an Whisper API...');
      const { data, error: functionError } = await supabase.functions.invoke('chat-voice-to-text', {
        body: { 
          audio: base64Audio,
          user_locale: 'de'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data || !data.text) {
        throw new Error('Keine Transkription erhalten');
      }

      console.log('✅ Transkription erhalten:', data.text);
      setTranscript(data.text);
      audioChunksRef.current = [];
    } catch (err: any) {
      console.error('❌ Fehler bei der Verarbeitung:', err);
      let errorMessage = 'Fehler bei der Spracherkennung';
      
      if (err.message.includes('Rate limit')) {
        errorMessage = 'Zu viele Anfragen. Bitte warten Sie kurz.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Zeitüberschreitung. Bitte versuchen Sie es erneut.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const resetTranscript = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    permissionGranted,
    audioLevel,
    remainingTime
  };
};
