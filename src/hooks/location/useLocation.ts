
import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationState, UseLocationReturn } from './location.types';
import { getCurrentPosition, handleGeolocationError, getLocationWithFallbacks } from './locationFetcher';
import { checkGeolocationPermission, watchPermissionChanges, requestGeolocationPermission, attemptPermissionWorkaround } from './permissionHandler';
import { toast } from 'sonner';

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    error: null,
    loading: false,
    permissionDenied: false
  });
  const [attempts, setAttempts] = useState(0);
  const [permissionAttempted, setPermissionAttempted] = useState(false);
  const lastSuccessRef = useRef<number | null>(null);
  const permissionErrorsRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const getLocation = useCallback(async (forceRefresh = false) => {
    // Vermeide mehrfache parallele Anfragen oder erlaube forciertes Refresh
    if (location.loading && !forceRefresh) return;
    if (isRefreshingRef.current && !forceRefresh) return;
    
    isRefreshingRef.current = true;
    
    // Setze Loading-Status
    setLocation(prev => ({
      ...prev,
      loading: true,
      error: forceRefresh ? null : prev.error // Fehler nur löschen bei erzwungenem Refresh
    }));

    // Versuche zurücksetzen bei manueller Aktualisierung oder erzwungenem Refresh
    if (forceRefresh) {
      setAttempts(prev => prev + 1);
    }
    
    try {
      if (!navigator.geolocation) {
        setLocation(prev => ({
          ...prev,
          error: 'Geolokalisierung wird von Ihrem Browser nicht unterstützt',
          loading: false
        }));
        isRefreshingRef.current = false;
        return;
      }

      // Prüfe zunächst den aktuellen Berechtigungsstatus
      const permissionResult = await checkGeolocationPermission();
      console.log("Berechtigungsstatus:", permissionResult);
      
      // Wenn die Berechtigung bereits verweigert wurde, versuchen wir einen Workaround
      if (permissionResult.state === 'denied') {
        console.log("Standortberechtigung verweigert, versuche Workaround...");
        
        // Zähle Fehler
        permissionErrorsRef.current += 1;
        
        // Bei wiederholten Fehlern mit verweigerten Berechtigungen
        // zeigen wir einen Toast mit einer Anleitung
        if (permissionErrorsRef.current >= 2 && !permissionAttempted) {
          toast.error(
            "Standortzugriff blockiert",
            {
              description: "Bitte überprüfen Sie Ihre Browser-Einstellungen für den Standortzugriff oder wechseln Sie zu einem anderen Browser.",
              duration: 7000,
              id: "location-permission-error"
            }
          );
          setPermissionAttempted(true);
        }
        
        // Versuche den Browser-spezifischen Workaround
        const workaroundSuccessful = await attemptPermissionWorkaround();
        
        if (!workaroundSuccessful) {
          // Versuche explizit nach Berechtigung zu fragen
          const permissionGranted = await requestGeolocationPermission();
          
          if (!permissionGranted) {
            setLocation(prev => ({
              ...prev,
              error: 'Standortzugriff wird vom Browser blockiert. Bitte überprüfen Sie Ihre Browsereinstellungen oder verwenden Sie einen anderen Browser.',
              loading: false,
              permissionDenied: true
            }));
            isRefreshingRef.current = false;
            return;
          }
        }
      }
      
      try {
        // Feste, niedrigere Timeout-Werte für bessere Benutzererfahrung
        // Kürzeres Timeout damit Nutzer nicht zu lange warten muss
        console.log(`Versuche Standort zu ermitteln (Versuch ${attempts + 1})...`);
        
        // Mehrere Strategien mit kürzeren Timeouts ausprobieren
        const positionResult = await getLocationWithFallbacks(5000);
        
        // Erfolgreichen Versuch speichern
        lastSuccessRef.current = Date.now();
        permissionErrorsRef.current = 0; // Fehler zurücksetzen
        
        setLocation({
          latitude: positionResult.latitude,
          longitude: positionResult.longitude,
          address: positionResult.address || 'Adresse konnte nicht ermittelt werden',
          error: null,
          loading: false,
          permissionDenied: false
        });
        
      } catch (error) {
        console.error("Alle Geolocation Strategien fehlgeschlagen:", error);
        
        const { errorMessage, permissionDenied } = handleGeolocationError(error as GeolocationPositionError);
        
        // Wenn der Fehler auf verweigerten Zugriff hindeutet, aber wir hatten vorher "granted"
        // dann kann es sein, dass der Browser inkonsistent ist
        if (permissionDenied && permissionResult.state === 'granted') {
          console.warn("Inkonsistenter Berechtigungsstatus: Browser meldet 'granted', aber verweigert Zugriff");
          
          // Versuche einen letzten Workaround
          const lastAttempt = await attemptPermissionWorkaround();
          
          if (lastAttempt) {
            // Wenn erfolgreich, neuer Versuch
            isRefreshingRef.current = false;
            getLocation(true);
            return;
          }
        }
        
        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionDenied: permissionDenied
        }));
      }
    } catch (error) {
      console.error('Unerwarteter Fehler bei der Standortermittlung:', error);
      setLocation(prev => ({
        ...prev,
        error: 'Fehler bei der Standortermittlung. Bitte versuchen Sie es erneut oder verwenden Sie einen anderen Browser.',
        loading: false
      }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [attempts, location.loading, permissionAttempted]);

  // Bei der Initialisierung die Standortabfrage starten
  useEffect(() => {
    getLocation();
    
    // Berechtigungsänderungen überwachen
    const cleanup = watchPermissionChanges((newState) => {
      console.log("Berechtigungsstatus geändert:", newState);
      
      if (newState === 'granted') {
        // Automatische Aktualisierung, wenn Berechtigung erteilt wurde
        getLocation(true);
      } else if (newState === 'denied') {
        // Status auf 'denied' setzen
        setLocation(prev => ({
          ...prev,
          error: 'Standortzugriff wurde verweigert',
          permissionDenied: true,
          loading: false
        }));
      }
    });
    
    return cleanup;
  }, [getLocation]);

  // Versuche automatisch neu, nur wenn Fehler aufgetreten ist und nicht zu viele Versuche
  useEffect(() => {
    if (location.error && !location.permissionDenied) {
      // Nur automatisch wiederholen, wenn es kein Berechtigungsproblem ist und weniger als 3 Versuche gemacht wurden
      if (attempts < 3) {
        const retryTimer = setTimeout(() => {
          console.log("Automatischer Wiederholungsversuch der Standortermittlung...");
          getLocation(true);
        }, 15000); // Längeres Intervall, um Nutzer Zeit für manuelle Aktionen zu geben
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [location.error, location.permissionDenied, getLocation, attempts]);

  return {
    ...location,
    refresh: useCallback(() => {
      if (isRefreshingRef.current) {
        toast.info("Standortermittlung läuft bereits...");
        return;
      }
      
      console.log("Manuelles Aktualisieren des Standorts...");
      // Reset-Zähler für Berechtigungsfehler
      permissionErrorsRef.current = 0;
      setPermissionAttempted(false);
      setAttempts(prev => prev + 1); // Erhöht automatisch die Versuche
      
      toast.info("Standort wird ermittelt...", { id: "location-refresh-toast" });
      getLocation(true); // Erzwinge Neuanfrage
      
      // Wenn der Benutzer wiederholt auf Refresh klickt bei Berechtigungsproblemen
      if (location.permissionDenied) {
        attemptPermissionWorkaround().then(successful => {
          if (successful) {
            console.log("Workaround nach manuellem Refresh erfolgreich");
            toast.success("Standortberechtigungen aktualisiert", { id: "location-refresh-toast" });
            getLocation(true);
          }
        });
      }
    }, [getLocation, location.permissionDenied])
  };
};
