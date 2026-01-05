import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface OfficeLocation {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_meters?: number | null;
}

// Haversine formula to calculate distance between two GPS coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation wird von Ihrem Browser nicht unterstützt',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht ermittelt werden';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff wurde verweigert';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standortinformationen nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'Zeitüberschreitung bei Standortabfrage';
            break;
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  }, []);

  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  const isWithinOfficeRadius = useCallback(
    (office: OfficeLocation): boolean => {
      // If office has no GPS coordinates, allow selection
      if (!office.latitude || !office.longitude) {
        return true;
      }

      // If user location is not available, don't restrict
      if (state.latitude === null || state.longitude === null) {
        return true;
      }

      const distance = calculateDistance(
        state.latitude,
        state.longitude,
        office.latitude,
        office.longitude
      );

      const radius = office.radius_meters || 100;
      return distance <= radius;
    },
    [state.latitude, state.longitude]
  );

  const getDistanceToOffice = useCallback(
    (office: OfficeLocation): number | null => {
      if (!office.latitude || !office.longitude) {
        return null;
      }

      if (state.latitude === null || state.longitude === null) {
        return null;
      }

      return calculateDistance(
        state.latitude,
        state.longitude,
        office.latitude,
        office.longitude
      );
    },
    [state.latitude, state.longitude]
  );

  return {
    ...state,
    requestPosition,
    isWithinOfficeRadius,
    getDistanceToOffice,
  };
};
