
import { toast } from 'sonner';
import { requestGeolocationPermission, getLocationPermissionHelp } from '@/hooks/location/permissionHandler';

/**
 * Verarbeitet häufige Geolocations-Fehler
 * Gibt zurück, ob der Fehler ein Berechtigungsproblem ist
 */
export const handleCommonErrors = (error: GeolocationPositionError | Error, onError?: (message: string) => void): boolean => {
  let errorMessage = 'Unbekannter Fehler bei der Standortermittlung';
  let permissionDenied = false;

  // GeolocationPositionError hat einen code
  if ('code' in error) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage = 'Standortzugriff wurde verweigert. Bitte überprüfen Sie Ihre Browsereinstellungen.';
        permissionDenied = true;
        // Nur eine Informationsmeldung anzeigen mit fester ID
        toast.error("Standortzugriff verweigert", {
          id: "location-permission-error",
          description: "Bitte aktivieren Sie den Standortzugriff in Ihren Browsereinstellungen.",
          duration: 10000
        });
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = 'Standortinformationen sind nicht verfügbar.';
        break;
      case 3: // TIMEOUT
        errorMessage = 'Zeitüberschreitung bei der Standortabfrage.';
        break;
    }
  } else if (error.message) {
    errorMessage = error.message;
    
    if (error.message.includes('time') || error.message.includes('Zeit')) {
      errorMessage = 'Zeitüberschreitung bei der Standortabfrage.';
    }
    
    if (error.message.includes('denied') || error.message.includes('verweigert')) {
      permissionDenied = true;
      // Nur eine detaillierte Information anzeigen mit fester ID
      toast.error("Standortzugriff verweigert", {
        id: "location-permission-error",
        duration: 10000
      });
    }
  }

  console.error("Geolocation Fehler:", error);
  
  if (onError) {
    onError(errorMessage);
  }

  return permissionDenied;
};

/**
 * Führt ein Geocoding für eine gegebene Adresse durch
 */
export const geocodeAddress = (
  address: string, 
  mapboxToken: string,
  onSuccess: (lat: number, lng: number) => void,
  onError?: (errorMessage: string) => void
) => {
  // Mapbox Geocoding API verwenden
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Geocoding fehlgeschlagen: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        onSuccess(lat, lng);
      } else {
        const errorMsg = "Keine Ergebnisse für diese Adresse gefunden";
        console.warn(errorMsg);
        if (onError) onError(errorMsg);
      }
    })
    .catch(error => {
      console.error("Geocoding Fehler:", error);
      if (onError) onError(`Fehler beim Geocoding: ${error.message}`);
    });
};

/**
 * Versucht, den Standort des Benutzers zu ermitteln
 * mit verschiedenen Fallback-Strategien
 */
export const getUserLocation = async (
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError | Error) => void,
  options: PositionOptions
): Promise<void> => {
  if (!navigator.geolocation) {
    onError(new Error("Geolokalisierung wird von Ihrem Browser nicht unterstützt"));
    return;
  }

  // Nutze verschiedene Strategien für verschiedene Browser
  // Erkennung des Browser-Typs
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  console.log("Browser-Info:", { isSafari, isIOS, isAndroid, options });

  try {
    // Explizit um Berechtigung bitten
    try {
      const permissionStatus = await requestGeolocationPermission();
      console.log("Berechtigungsstatus:", permissionStatus);
    } catch (e) {
      console.warn("Fehler beim Anfordern der Standortberechtigung:", e);
    }
    
    console.log("Versuche Standort zu ermitteln mit folgenden Optionen:", options);
    
    // Spezielle Behandlung für Safari (bekannte Probleme)
    if (isSafari) {
      // Cache-Einträge löschen, die Probleme verursachen können
      try {
        localStorage.removeItem('geolocation_permission');
        sessionStorage.removeItem('safari_permission_attempts');
        
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
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Standort erfolgreich ermittelt:", position.coords);
        onSuccess(position);
      },
      (error) => {
        console.error("Fehler bei Standortanfrage:", error.code, error.message);
        onError(error);
      },
      options
    );
  } catch (e) {
    console.error("Unerwarteter Fehler bei getUserLocation:", e);
    onError(new Error("Unerwarteter Fehler bei der Standortermittlung"));
  }
};

/**
 * Führt ein Reverse Geocoding durch (von Koordinaten zu Adresse)
 * Nutzt Nominatim von OpenStreetMap
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    // Füge Zufallsparameter für bessere Caching-Kontrolle hinzu
    const random = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now(); // Timestamp hinzufügen um Cache zu umgehen
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&r=${random}&t=${timestamp}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'de',
        'User-Agent': 'MinuteApp Calendar (minuteapp@outlook.de)',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Fehler beim Reverse Geocoding: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error("Fehler beim Reverse Geocoding:", error);
    return null;
  }
};
