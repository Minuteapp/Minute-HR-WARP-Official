import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from '@/hooks/use-toast';
import type { GeofenceLocation } from '@/types/location-tracking.types';
import type { LocationState } from '@/hooks/location/location.types';

interface UseLocationTrackingProps {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  geofenceLocations?: GeofenceLocation[];
}

export const useLocationTracking = ({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 300000, // 5 Minuten
  geofenceLocations = []
}: UseLocationTrackingProps = {}) => {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    error: null,
    loading: false,
    permissionDenied: false
  });

  const [currentGeofence, setCurrentGeofence] = useState<GeofenceLocation | null>(null);
  const [isInAllowedArea, setIsInAllowedArea] = useState(false);
  const { toast } = useToast();

  const checkGeofence = (lat: number, lon: number): GeofenceLocation | null => {
    for (const location of geofenceLocations) {
      const distance = calculateDistance(lat, lon, location.latitude, location.longitude);
      if (distance <= location.radius_meters) {
        return location;
      }
    }
    return null;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Erdradius in Metern
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number } | null> => {
    try {
      setLocationState(prev => ({ ...prev, loading: true, error: null }));

      // Prüfe Berechtigung
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location === 'denied') {
        setLocationState(prev => ({ 
          ...prev, 
          loading: false, 
          permissionDenied: true,
          error: 'Standortzugriff verweigert. Bitte aktivieren Sie die Standortberechtigung in den Einstellungen.' 
        }));
        return null;
      }

      if (permissions.location === 'prompt') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location === 'denied') {
          setLocationState(prev => ({ 
            ...prev, 
            loading: false, 
            permissionDenied: true,
            error: 'Standortzugriff verweigert. Die App benötigt Standortzugriff für zeitbasierte Erfassung.' 
          }));
          return null;
        }
      }

      // Hole aktuelle Position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Prüfe Geofencing
      const geofence = checkGeofence(latitude, longitude);
      setCurrentGeofence(geofence);
      setIsInAllowedArea(geofence !== null);

      // Reverse Geocoding (vereinfacht)
      let address = null;
      try {
        // In einer echten Implementierung würde hier ein Geocoding-Service aufgerufen
        address = geofence ? geofence.address || geofence.name : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      } catch (e) {
        console.warn('Reverse geocoding fehlgeschlagen:', e);
      }

      setLocationState({
        latitude,
        longitude,
        address,
        error: null,
        loading: false,
        permissionDenied: false
      });

      return { latitude, longitude, accuracy: accuracy || 0 };

    } catch (error: any) {
      console.error('Standorterfassung fehlgeschlagen:', error);
      
      let errorMessage = 'Standort konnte nicht ermittelt werden.';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Zeitüberschreitung bei der Standortermittlung. Bitte versuchen Sie es erneut.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Standortzugriff nicht erlaubt. Bitte aktivieren Sie die Berechtigung in den Einstellungen.';
        setLocationState(prev => ({ ...prev, permissionDenied: true }));
      } else if (error.message?.includes('unavailable')) {
        errorMessage = 'Standortdienst nicht verfügbar. Bitte aktivieren Sie GPS/Standort auf Ihrem Gerät.';
      }

      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Standortfehler",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  const watchPosition = () => {
    return Geolocation.watchPosition(
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      },
      (position) => {
        if (position) {
          const { latitude, longitude } = position.coords;
          
          // Prüfe Geofencing
          const geofence = checkGeofence(latitude, longitude);
          setCurrentGeofence(geofence);
          setIsInAllowedArea(geofence !== null);

          setLocationState(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false,
            error: null
          }));
        }
      }
    ).catch((error) => {
      console.error('Position watching error:', error);
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    });
  };

  return {
    locationState,
    currentGeofence,
    isInAllowedArea,
    getCurrentLocation,
    watchPosition,
    refresh: getCurrentLocation
  };
};