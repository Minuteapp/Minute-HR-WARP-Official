import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Check microphone permission first
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setHasPermission(true);
      setPermissionError(null);
      console.log('✅ Mikrofon-Berechtigung gewährt');
      return true;
    } catch (error: any) {
      console.error('❌ Mikrofon-Berechtigung verweigert:', error);
      setHasPermission(false);
      
      let errorMessage = 'Mikrofon-Berechtigung erforderlich';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Berechtigung wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden. Bitte überprüfen Sie Ihre Hardware.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Ihr Browser unterstützt die Spracherkennung nicht.';
      }
      
      setPermissionError(errorMessage);
      return false;
    }
  }, []);

  // Erweiterte Browser-Kompatibilitätsprüfung mit detaillierter Browser-Erkennung
  const checkBrowserSupport = useCallback(() => {
    if (typeof window === 'undefined') {
      return { supported: false, reason: 'Server-seitige Umgebung erkannt.' };
    }

    // Detaillierte Browser-Erkennung
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isEdge = /edg/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isOpera = /opr/.test(userAgent) || /opera/.test(userAgent);

    // Firefox unterstützt Web Speech API nicht
    if (isFirefox) {
      return {
        supported: false,
        reason: 'Firefox unterstützt die Web Speech API nicht. Bitte verwenden Sie Chrome, Edge oder Safari.'
      };
    }

    // Prüfe window.isSecureContext für moderne Browser
    if (typeof window.isSecureContext !== 'undefined' && !window.isSecureContext) {
      return {
        supported: false,
        reason: 'Spracherkennung erfordert eine sichere Verbindung (HTTPS). Bitte verwenden Sie HTTPS.'
      };
    }

    // Legacy HTTPS-Prüfung für ältere Browser
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      return { 
        supported: false, 
        reason: 'Spracherkennung ist nur über HTTPS verfügbar. Bitte verwenden Sie eine sichere Verbindung.' 
      };
    }

    // Prüfe Browser-Support für Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      let browserName = 'Ihr Browser';
      if (isOpera) browserName = 'Opera';
      else if (isSafari) browserName = 'Safari';
      
      return { 
        supported: false, 
        reason: `${browserName} unterstützt die Web Speech API nicht vollständig. Verwenden Sie Chrome oder Edge für die beste Erfahrung.` 
      };
    }

    // Zusätzliche Version-Checks für bekannte problematische Versionen
    if (isChrome) {
      const chromeVersion = userAgent.match(/chrome\/(\d+)/);
      if (chromeVersion && parseInt(chromeVersion[1]) < 25) {
        return {
          supported: false,
          reason: 'Ihre Chrome-Version ist zu alt. Bitte aktualisieren Sie Chrome auf Version 25 oder höher.'
        };
      }
    }

    if (isSafari) {
      const safariVersion = userAgent.match(/version\/(\d+)/);
      if (safariVersion && parseInt(safariVersion[1]) < 14) {
        return {
          supported: false,
          reason: 'Ihre Safari-Version ist zu alt. Bitte aktualisieren Sie Safari auf Version 14 oder höher.'
        };
      }
    }

    console.log('✅ Browser-Kompatibilität bestätigt:', {
      isChrome,
      isEdge,
      isSafari,
      isOpera,
      isSecure: window.isSecureContext
    });

    return { supported: true, reason: null };
  }, []);

  // Initialisierung der Spracherkennung
  useEffect(() => {
    const browserCheck = checkBrowserSupport();
    
    if (!browserCheck.supported) {
      console.warn('⚠️ Browser-Kompatibilitätsproblem:', browserCheck.reason);
      setPermissionError(browserCheck.reason!);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'de-DE';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('✅ Erkannter Text:', transcript);
        setTranscriptResult(transcript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('❌ Spracherkennungsfehler:', event.error, event);
        setIsListening(false);
        
        let errorMessage = 'Fehler bei der Spracherkennung';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Berechtigung wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.';
            setHasPermission(false);
            break;
          case 'service-not-allowed':
            errorMessage = 'Spracherkennungsdienst nicht verfügbar. Versuchen Sie es mit einem anderen Browser (Chrome, Edge, Safari) oder überprüfen Sie Ihre Internetverbindung.';
            break;
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt. Bitte versuchen Sie es erneut und sprechen Sie deutlicher.';
            break;
          case 'audio-capture':
            errorMessage = 'Mikrofon konnte nicht gestartet werden. Bitte überprüfen Sie Ihre Hardware-Einstellungen.';
            break;
          case 'network':
            errorMessage = 'Netzwerkfehler bei der Spracherkennung. Bitte überprüfen Sie Ihre Internetverbindung.';
            console.log('⚠️ Network error - könnte zu Whisper API fallback führen');
            break;
          case 'aborted':
            errorMessage = 'Spracherkennung wurde abgebrochen.';
            break;
          default:
            errorMessage = `Spracherkennungsfehler: ${event.error}`;
        }
        
        setPermissionError(errorMessage);
      };
      
      recognitionInstance.onend = () => {
        console.log('🔄 Spracherkennung beendet');
        setIsListening(false);
      };
      
      recognitionInstance.onstart = () => {
        console.log('🎤 Spracherkennung gestartet');
        setPermissionError(null);
        setIsListening(true);
      };
      
      setRecognition(recognitionInstance);
      console.log('✅ Spracherkennung erfolgreich initialisiert');
      
    } catch (error) {
      console.error('❌ Fehler bei der Initialisierung der Spracherkennung:', error);
      setPermissionError('Fehler beim Laden der Spracherkennung. Laden Sie die Seite neu oder verwenden Sie einen anderen Browser.');
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [checkBrowserSupport]);

  const toggleListening = useCallback(async () => {
    // Prüfe Browser-Support erneut
    const browserCheck = checkBrowserSupport();
    if (!browserCheck.supported) {
      setPermissionError(browserCheck.reason!);
      return;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        return;
      }
    }

    if (!recognition) {
      setPermissionError('Spracherkennung ist nicht verfügbar. Laden Sie die Seite neu.');
      return;
    }

    if (isListening) {
      // Stoppe die Spracherkennung
      try {
        recognition.stop();
        console.log('⏹️ Spracherkennung gestoppt');
      } catch (error) {
        console.error('❌ Fehler beim Stoppen der Spracherkennung:', error);
      }
    } else {
      // Starte die Spracherkennung
      try {
        recognition.start();
        console.log('🎤 Spracherkennung wird gestartet...');
      } catch (error: any) {
        console.error('❌ Fehler beim Starten der Spracherkennung:', error);
        let errorMessage = 'Fehler beim Starten der Spracherkennung.';
        
        if (error.name === 'InvalidStateError') {
          errorMessage = 'Spracherkennung ist bereits aktiv. Warten Sie einen Moment und versuchen Sie es erneut.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage = 'Mikrofon-Berechtigung wurde verweigert. Überprüfen Sie Ihre Browser-Einstellungen.';
          setHasPermission(false);
        }
        
        setPermissionError(errorMessage);
        setIsListening(false);
      }
    }
  }, [recognition, hasPermission, requestMicrophonePermission, isListening, checkBrowserSupport]);

  const resetTranscript = useCallback(() => {
    setTranscriptResult(null);
  }, []);

  return {
    isListening,
    toggleListening,
    transcriptResult,
    resetTranscript,
    hasPermission,
    permissionError,
    requestMicrophonePermission
  };
};