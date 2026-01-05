
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getUserLocation, handleCommonErrors } from '../mapUtils';

interface UseUserLocationProps {
  addMarker: (lat: number, lng: number, map: mapboxgl.Map | null) => void;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
  onError?: (error: string) => void;
  retryCount: number;
}

export const useUserLocation = ({
  addMarker,
  map,
  onLocationUpdate,
  onError,
  retryCount
}: UseUserLocationProps) => {
  
  const attemptGetUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolokalisierung wird von Ihrem Browser nicht unterstützt.";
      if (onError) {
        onError(errorMsg);
      }
      return;
    }
    
    console.log("Map: Versuche Standort direkt zu ermitteln");
    toast({
      description: "Ermittle Standort...", 
      id: "location-toast"  // Feste ID für Deduplizierung
    });
    
    // Browser- und Gerätetyp erkennen für spezifisches Handling
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    // Angepasste Optionen je nach Browser/Gerät
    let options = {
      enableHighAccuracy: true, 
      timeout: isSafari || isIOS ? 8000 : 10000, 
      maximumAge: 0 
    };
    
    // Zugriff maximal einmal wiederholen
    const maxRetries = 1;
    let currentRetry = 0;
    
    const tryGetLocation = () => {
      getUserLocation(
        (position) => {
          toast({
            description: "Standort erfolgreich ermittelt",
            id: "location-toast"  // Gleiche ID verwenden
          });
          console.log("Geolocation erfolgreich:", position.coords);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          addMarker(lat, lng, map.current);
          
          if (onLocationUpdate) {
            onLocationUpdate({ lat, lng });
          }
        },
        (error) => {
          const isDenied = handleCommonErrors(error, onError);
          
          // Fehlermeldung nur einmal anzeigen mit fester ID
          if (isDenied) {
            toast({
              title: "Standortzugriff verweigert", 
              description: "Bitte erlauben Sie den Standortzugriff in Ihren Browsereinstellungen.",
              variant: "destructive",
              id: "location-permission-error"  // Feste ID für Deduplizierung
            });
          } else if (currentRetry < maxRetries) {
            // Bei Timeout oder anderen Fehlern einmal versuchen
            currentRetry++;
            
            // Parameter anpassen und erneut versuchen
            options.enableHighAccuracy = !options.enableHighAccuracy;
            options.timeout += 2000;
            
            setTimeout(tryGetLocation, 1000);
          }
        },
        options
      );
    };
    
    // Ersten Versuch starten
    tryGetLocation();
    
  }, [addMarker, onError, onLocationUpdate, retryCount, map]);

  return { attemptGetUserLocation };
};
