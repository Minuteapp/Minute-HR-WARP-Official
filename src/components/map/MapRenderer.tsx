
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapMarker } from './hooks/useMapMarker';
import { useUserLocation } from './hooks/useUserLocation';
import { useAddressGeocoding } from './hooks/useAddressGeocoding';
import { useMapResize } from './hooks/useMapResize';

interface MapRendererProps {
  token?: string;
  initialLocation?: [number, number] | null;
  address?: string;
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
  onError?: (error: string) => void;
  retryCount?: number;
}

const MapRenderer = ({
  token,
  initialLocation,
  address,
  onLocationUpdate,
  onError,
  retryCount = 0
}: MapRendererProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Stabile Map-Einstellungen mit useMemo
  const mapSettings = useMemo(() => ({
    style: 'mapbox://styles/mapbox/streets-v11',
    defaultLocation: [13.404954, 52.520008] as [number, number], // Berlin als Standard
    zoom: 13
  }), []);

  // ALLE HOOKS MÜSSEN VOR BEDINGTEN RETURNS STEHEN
  // Marker-Hook
  const { addMarker } = useMapMarker({ onLocationUpdate });

  // Map-Initialisierungs-Hook
  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMounted(true);
    
    // Markiere den initialen Standort, falls vorhanden
    if (initialLocation) {
      addMarker(initialLocation[1], initialLocation[0], mapInstance);
      if (onLocationUpdate) {
        onLocationUpdate({ 
          lat: initialLocation[1], 
          lng: initialLocation[0] 
        });
      }
    } else {
      // Versuche den aktuellen Standort zu ermitteln
      attemptGetUserLocation();
    }

    // Click-Handler hinzufügen
    mapInstance.on('click', (e) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;
      
      addMarker(lat, lng, mapInstance);
      
      if (onLocationUpdate) {
        onLocationUpdate({ lat, lng });
      }
    });
  }, [initialLocation, onLocationUpdate, addMarker]);

  const { map, tokenError, tokenLoading } = useMapInitialization({
    token,
    container: mapContainer,
    initialLocation,
    mapSettings,
    onMapLoad: handleMapLoad,
    onError
  });

  // User-Location-Hook
  const { attemptGetUserLocation } = useUserLocation({
    addMarker,
    map,
    onLocationUpdate,
    onError,
    retryCount
  });

  // Erneuter Versuch bei Änderung des retry-Counters
  useEffect(() => {
    if (mounted && retryCount > 0) {
      console.log(`Map: Versuche erneut den Standort zu ermitteln (Versuch #${retryCount})`);
      attemptGetUserLocation();
    }
  }, [retryCount, mounted, attemptGetUserLocation]);

  // Adress-Geokodierungs-Hook
  useAddressGeocoding({
    address,
    token,
    addMarker,
    map,
    onLocationUpdate,
    onError,
    mounted
  });

  // Map-Resize-Hook
  useMapResize({ map, mounted });

  // Fehlerbehandlung für Token-Probleme
  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">{tokenError}</p>
        </div>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Lade Kartenkonfiguration...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapRenderer;
