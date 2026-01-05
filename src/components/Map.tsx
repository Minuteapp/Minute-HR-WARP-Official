
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import MapRenderer from './map/MapRenderer';
import LocationErrorDisplay from './map/LocationErrorDisplay';
import { handleCommonErrors } from './map/mapUtils';

interface MapProps {
  token: string;
  initialLocation?: [number, number] | null;
  address?: string;
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
  onError?: (error: string) => void;
  retryCount?: number;
}

const Map = ({ 
  token, 
  initialLocation,
  address,
  onLocationUpdate,
  onError,
  retryCount = 0
}: MapProps) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastRetryCount, setLastRetryCount] = useState(retryCount);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Handler für Fehler bei der Standortermittlung
  const handleMapError = useCallback((error: string) => {
    console.error("Map error:", error);
    setLocationError(error);
    
    // Prüfen, ob es sich um eine Berechtigungsverweigerung handelt
    if (error.toLowerCase().includes('verweig') || 
        error.toLowerCase().includes('deny') || 
        error.toLowerCase().includes('permission')) {
      setPermissionDenied(true);
    }
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Funktion zum erneuten Versuch der Standortermittlung
  const handleRetryLocation = useCallback(() => {
    setLocationError(null);
    setLastRetryCount(prev => prev + 1);
    toast.info("Ermittle Standort...", { 
      id: "location-toast",
      description: "Bitte erlauben Sie den Standortzugriff, wenn Ihr Browser danach fragt."
    });
    
    // Bei Berechtigungsproblemen versuchen, den Browser zu überzeugen
    if (permissionDenied) {
      // Versuche, die Berechtigungen explizit anzufordern
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(status => {
            console.log("Aktueller Berechtigungsstatus:", status.state);
            
            if (status.state === 'denied') {
              toast.error("Standortzugriff ist in Ihrem Browser blockiert", {
                description: "Bitte ändern Sie die Einstellungen manuell in Ihrem Browser und laden Sie die Seite neu.",
                duration: 8000
              });
            }
          })
          .catch(e => console.warn("Fehler beim Prüfen der Berechtigungen:", e));
      }
      
      // Direkter Aufruf mit verzögerter Ausführung, um dem Browser Zeit zu geben
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionDenied(false);
            setLocationError(null);
          },
          () => {
            // Auch bei Fehler den Retry-Count erhöhen, um den Renderer zu aktualisieren
            setLastRetryCount(prev => prev + 1);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }, 500);
    }
  }, [permissionDenied]);

  return (
    <div className="w-full h-full rounded-lg relative">
      <MapRenderer 
        token={token}
        initialLocation={initialLocation}
        address={address}
        onLocationUpdate={onLocationUpdate}
        onError={handleMapError}
        retryCount={lastRetryCount}
      />
      
      {locationError && (
        <LocationErrorDisplay 
          errorMessage={locationError} 
          onRetry={handleRetryLocation} 
        />
      )}
    </div>
  );
};

export default Map;
