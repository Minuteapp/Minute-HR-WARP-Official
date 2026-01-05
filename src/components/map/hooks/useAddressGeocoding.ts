
import { useEffect } from 'react';
import { geocodeAddress } from '../mapUtils';

interface UseAddressGeocodingProps {
  address?: string;
  token: string;
  addMarker: (lat: number, lng: number, map: mapboxgl.Map | null) => void;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  onLocationUpdate?: (coords: { lat: number; lng: number; address?: string }) => void;
  onError?: (error: string) => void;
  mounted: boolean;
}

export const useAddressGeocoding = ({
  address,
  token,
  addMarker,
  map,
  onLocationUpdate,
  onError,
  mounted
}: UseAddressGeocodingProps) => {
  
  // Adressänderungen verarbeiten
  useEffect(() => {
    if (address && map.current && mounted) {
      geocodeAddress(address, token, (lat, lng) => {
        addMarker(lat, lng, map.current);
        if (onLocationUpdate) {
          onLocationUpdate({ lat, lng, address });
        }
      }, onError);
    }
  }, [address, mounted, token, addMarker, map, onLocationUpdate, onError]);
};
