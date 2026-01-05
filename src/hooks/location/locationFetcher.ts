
import { reverseGeocode } from './geocoding';

interface PositionResult {
  latitude: number;
  longitude: number;
  address: string | null;
}

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

/**
 * Kapselt die Logik zum Abrufen der aktuellen Position
 */
export const getCurrentPosition = (
  options: GeolocationOptions,
  timeoutDuration: number
): Promise<PositionResult> => {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Geolokalisierung wird von Ihrem Browser nicht unterstützt'));
  }

  // Browser- und OS-spezifische Informationen sammeln
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  
  console.log("Browser-Info in getCurrentPosition:", { isSafari, isIOS });

  // Timeout für die Standortabfrage
  let locationTimeout: NodeJS.Timeout | null = null;

  // Zeitüberschreitungs-Promise erstellen
  const timeoutPromise = new Promise<GeolocationPosition>((_, reject) => {
    locationTimeout = setTimeout(() => {
      reject(new Error('Zeitüberschreitung bei der Standortabfrage'));
    }, timeoutDuration);
  });

  // Safari-spezifische Bereinigung
  if (isSafari) {
    try {
      // Lösche potenzielle Cache-Einträge für Safari
      localStorage.removeItem('geolocation_permission');
      sessionStorage.removeItem('safari_permission_attempts');
      
      // Bei Safari versuchen wir, alle vorherigen Permission-Status zurückzusetzen
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(status => {
            console.log("Aktueller Geolocation-Berechtigungsstatus:", status.state);
          })
          .catch(e => {
            console.warn("Fehler beim Abfragen der Berechtigungen:", e);
          });
      }
    } catch (e) {
      console.warn("Cache konnte nicht gelöscht werden:", e);
    }
  }

  // Tatsächliche Geolocation Promise erstellen
  const geolocationPromise = new Promise<GeolocationPosition>((resolve, reject) => {
    try {
      console.log("Starte Standortabfrage mit Optionen:", options);
      
      // Safari-spezifische Anpassungen
      const newOptions = { ...options };
      if (isSafari) {
        console.log("Safari erkannt, passe Optionen an");
        newOptions.timeout = Math.max(options.timeout, 5000); // Längeres Timeout für Safari
        newOptions.maximumAge = 0; // Immer frischen Standort für Safari anfordern
      }
      
      // Direkter, einfacher Aufruf für alle Browser
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Position erhalten:", position.coords.latitude, position.coords.longitude);
          resolve(position);
        },
        (error) => {
          console.error("Geolocation Fehler:", error.code, error.message);
          
          // Spezifischer Fehlerhandling für Safari
          if (isSafari && error.code === 1) {
            console.log("Safari Berechtigungsproblem erkannt, versuche Cache zu löschen");
            try {
              localStorage.removeItem('geolocation_permission');
              sessionStorage.removeItem('safari_permission_attempts');
            } catch (e) {
              console.warn("Cache konnte nicht gelöscht werden:", e);
            }
          }
          
          reject(error);
        },
        newOptions
      );
    } catch (e) {
      console.error("Unerwarteter Fehler bei der Standortabfrage:", e);
      reject(new Error('Unbekannter Fehler bei der Standortabfrage'));
    }
  });

  // Mit Race wird der schnellere der beiden gewinnen
  return Promise.race([geolocationPromise, timeoutPromise])
    .then(async (position) => {
      if (locationTimeout) clearTimeout(locationTimeout);

      console.log("Standort erfolgreich ermittelt:", position.coords);
      const { latitude, longitude } = position.coords;

      // Reverse Geocoding durchführen
      try {
        const address = await reverseGeocode(latitude, longitude);
        return { latitude, longitude, address };
      } catch (error) {
        console.error('Fehler beim Reverse Geocoding:', error);
        return { latitude, longitude, address: null };
      }
    })
    .finally(() => {
      if (locationTimeout) clearTimeout(locationTimeout);
    });
};

/**
 * Analysiert Geolocation-Fehler und bereitet eine Fehlermeldung auf
 */
export const handleGeolocationError = (error: GeolocationPositionError | Error): {
  errorMessage: string;
  permissionDenied: boolean;
} => {
  let errorMessage = 'Unbekannter Fehler bei der Standortermittlung';
  let permissionDenied = false;

  // Browser- und OS-spezifische Informationen sammeln
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  console.log("Browser-Info:", { isSafari, isIOS, isAndroid });

  // GeolocationPositionError hat einen code
  if ('code' in error) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        permissionDenied = true;
        // Spezifischere Meldungen je nach Browser/Betriebssystem
        if (isSafari && isIOS) {
          errorMessage = 'Standortzugriff verweigert. Bitte überprüfen Sie Ihre iOS-Einstellungen unter "Einstellungen > Safari > Standortzugriff".';
        } else if (isIOS) {
          errorMessage = 'Standortzugriff verweigert. Bitte überprüfen Sie Ihre iOS-Einstellungen unter "Datenschutz > Ortungsdienste".';
        } else if (isAndroid) {
          errorMessage = 'Standortzugriff verweigert. Bitte überprüfen Sie Ihre Android-Einstellungen unter "Einstellungen > Standort".';
        } else if (isSafari) {
          errorMessage = 'Standortzugriff verweigert. Bitte überprüfen Sie in Safari unter "Safari > Einstellungen > Websites > Standort" und erlauben Sie den Zugriff für diese Website. Sie müssen eventuell die Seite neu laden.';
        } else {
          errorMessage = 'Standortzugriff wurde verweigert. Bitte überprüfen Sie die Standortberechtigungen in Ihrem Browser.';
        }
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = 'Standortinformationen sind nicht verfügbar. GPS-Signal könnte fehlen.';
        break;
      case 3: // TIMEOUT
        errorMessage = 'Zeitüberschreitung bei der Standortabfrage. Bitte versuchen Sie es erneut mit einem stabileren Netzwerk.';
        break;
    }
  } else if (error.message) {
    errorMessage = error.message;
    
    if (error.message.includes('Zeitüberschreitung')) {
      errorMessage = 'Zeitüberschreitung bei der Standortabfrage. Bitte erneut versuchen.';
    }
    
    // Prüfen auf Berechtigungsprobleme in der Fehlermeldung
    if (error.message.toLowerCase().includes('permission') || 
        error.message.toLowerCase().includes('denied') || 
        error.message.toLowerCase().includes('verweigert')) {
      permissionDenied = true;
    }
  }

  // Debugging-Informationen
  console.log("Geolocation Fehler analysiert:", { error, errorMessage, permissionDenied });

  return { errorMessage, permissionDenied };
};

/**
 * Versucht mehrere Strategien, um den Standort zu erhalten
 */
export const getLocationWithFallbacks = async (timeoutBase: number = 5000): Promise<PositionResult> => {
  // Browser- und OS-spezifische Informationen
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  
  console.log("Browser-Info in getLocationWithFallbacks:", { isSafari, isIOS });

  // Wenn es sich um Safari handelt, versuchen wir, den Cache zurückzusetzen
  if (isSafari) {
    try {
      console.log("Safari erkannt, versuche Cache zu löschen");
      localStorage.removeItem('geolocation_permission');
      sessionStorage.removeItem('safari_permission_attempts');
      
      // Cache für Standortabfragen im localStorage löschen
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.includes('geo') || key.includes('location') || key.includes('position')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Cache konnte nicht gelöscht werden:", e);
    }
  }

  // Angepasste Strategien je nach Browser
  const strategies = [
    // Safari-spezifische Strategien
    ...(isSafari ? [
      // Safari Strategie 1: Sehr niedriges Timeout, niedrige Genauigkeit
      {
        options: { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 },
        timeoutDuration: 3500
      },
      // Safari Strategie 2: Mittleres Timeout, Cache-Verwendung erlauben
      {
        options: { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 },
        timeoutDuration: 5500
      }
    ] : []),
    
    // Allgemeine Strategien
    // Strategie 1: Kurzes Timeout, niedrige Genauigkeit für schnelle Antwort
    {
      options: { enableHighAccuracy: false, timeout: 4000, maximumAge: 0 },
      timeoutDuration: 4500
    },
    
    // Strategie 2: Mittleres Timeout, höhere Genauigkeit
    {
      options: { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 },
      timeoutDuration: 6500
    },
    
    // Strategie 3: Längeres Timeout, Cache-Nutzung erlaubt
    {
      options: { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      timeoutDuration: 8500
    }
  ];

  let lastError: any = null;

  for (const strategy of strategies) {
    try {
      console.log("Versuche Standortstrategie:", strategy);
      return await getCurrentPosition(strategy.options, strategy.timeoutDuration);
    } catch (error) {
      console.warn("Strategie fehlgeschlagen:", error);
      lastError = error;
      
      // Spezielles Handling für Berechtigungsfehler
      if (error instanceof GeolocationPositionError && error.code === 1) {
        // Bei Safari versuchen wir trotz Berechtigungsproblemen weiterzumachen
        if (isSafari) {
          console.log("Safari: Versuche trotz Berechtigungsproblem weitere Strategien");
          continue;
        }
        
        console.error("Berechtigungsproblem erkannt - breche weitere Versuche ab");
        break;
      }
    }
  }

  // Wenn alle Strategien fehlschlagen
  throw lastError || new Error("Standort konnte nicht ermittelt werden");
};
