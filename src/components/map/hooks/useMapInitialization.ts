
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapboxToken } from '../../../hooks/map/useMapboxToken';

interface UseMapInitializationProps {
  token?: string;
  container: React.RefObject<HTMLDivElement>;
  initialLocation?: [number, number] | null;
  mapSettings: {
    style: string;
    defaultLocation: [number, number];
    zoom: number;
  };
  onMapLoad: (map: mapboxgl.Map) => void;
  onError?: (error: string) => void;
}

export const useMapInitialization = ({
  token,
  container,
  initialLocation,
  mapSettings,
  onMapLoad,
  onError
}: UseMapInitializationProps) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: secureToken, loading: tokenLoading, error: tokenError } = useMapboxToken();

  useEffect(() => {
    if (!container.current || tokenLoading) return;

    const finalToken = token || secureToken;
    if (!finalToken) {
      onError?.(tokenError || 'Mapbox token not available');
      return;
    }

    try {
      mapboxgl.accessToken = finalToken;
      
      // Anti-Flimmer-Maßnahmen
      const mapOptions: mapboxgl.MapOptions = {
        container: container.current,
        style: mapSettings.style,
        center: initialLocation || mapSettings.defaultLocation,
        zoom: mapSettings.zoom,
        fadeDuration: 0,
        renderWorldCopies: false,
        preserveDrawingBuffer: true,
        trackResize: false,
        attributionControl: false, // Entferne Attributions für weniger visuelle Elemente
        logoPosition: 'bottom-right', // Logo in die Ecke verschieben
        pitchWithRotate: false, // Verhindern von 3D-Effekten
        dragRotate: false, // Verhindern von Rotationen
        touchPitch: false, // Keine Touch-Gesten für Neigungen
        minPitch: 0, // Flache Karte erzwingen
        maxPitch: 0,  // Flache Karte erzwingen
        antialias: false // Scharfe Kanten für weniger Flimmern
      };
      
      map.current = new mapboxgl.Map(mapOptions);
      
      // Deaktiviere ALLE Animationen und Übergänge
      map.current.scrollZoom.disable(); // Deaktiviere Zoom mit Scrollrad
      
      // Vereinfachte Navigation ohne Animationen
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false, // Kompass ausblenden für weniger Elemente
        showZoom: true,
        visualizePitch: false
      }), 'top-right');
      
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        
        if (map.current && onMapLoad) {
          onMapLoad(map.current);
        }
      });
      
    } catch (error) {
      console.error("Map initialization error:", error);
      if (onError) {
        onError(`Fehler beim Initialisieren der Karte: ${error}`);
      }
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, secureToken, tokenLoading, initialLocation, onMapLoad, onError, mapSettings, container]);

  return { map, tokenError, tokenLoading };
};
