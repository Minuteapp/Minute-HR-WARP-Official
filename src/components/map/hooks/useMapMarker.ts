
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseMapMarkerProps {
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
}

export const useMapMarker = ({ onLocationUpdate }: UseMapMarkerProps) => {
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Funktion zum Hinzufügen eines Markers
  const addMarker = useCallback((lat: number, lng: number, map: mapboxgl.Map | null) => {
    if (!map) return;
    
    // Entferne vorhandenen Marker
    if (marker.current) {
      marker.current.remove();
    }
    
    // Erstelle neuen Marker
    marker.current = new mapboxgl.Marker({ color: '#3B44F6', draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    
    // Optional: Ermögliche Verschieben des Markers  
    marker.current.on('dragend', () => {
      if (marker.current && onLocationUpdate) {
        const position = marker.current.getLngLat();
        onLocationUpdate({ 
          lat: position.lat, 
          lng: position.lng 
        });
      }
    });
    
    // Zentriere die Karte auf den neuen Marker - OHNE Animationen
    if (map) {
      // Jump direkt ohne Animation
      map.jumpTo({
        center: [lng, lat]
      });
    }
  }, [onLocationUpdate]);

  return { marker, addMarker };
};
