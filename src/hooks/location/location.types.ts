
/**
 * Standort-Zustand
 */
export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

/**
 * Rückgabewert des useLocation Hooks
 */
export interface UseLocationReturn extends LocationState {
  refresh: () => void;
}

/**
 * Optionen für Geolocation-Anfragen
 */
export interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

/**
 * Ergebnis einer Standortabfrage
 */
export interface PositionResult {
  latitude: number;
  longitude: number;
  address: string | null;
}
