import { useMapboxToken } from '@/hooks/map/useMapboxToken';
import Map from '../Map';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Map as MapIcon } from 'lucide-react';

interface MapWithTokenProps {
  address?: string;
  initialLocation?: [number, number] | null;
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
  onError?: (error: string) => void;
  retryCount?: number;
}

const MapWithToken = ({ address, initialLocation, onLocationUpdate, onError }: MapWithTokenProps) => {
  const { token: mapboxToken, loading, error } = useMapboxToken();

  if (loading) {
    return (
      <div className="h-[200px] w-full rounded-md border bg-muted flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapIcon className="h-4 w-4 animate-pulse" />
          <span>Karte wird geladen...</span>
        </div>
      </div>
    );
  }

  if (error || !mapboxToken) {
    // Benachrichtige über Fehler wenn Callback verfügbar
    if (onError) {
      onError(error || 'Mapbox token not configured. Please contact administrator.');
    }
    
    return (
      <div className="h-[200px] w-full rounded-md border">
        <Alert className="h-full flex items-center justify-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error || 'Mapbox token not configured. Please contact administrator.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Map
      token={mapboxToken}
      address={address}
      initialLocation={initialLocation}
      onLocationUpdate={onLocationUpdate}
    />
  );
};

export default MapWithToken;