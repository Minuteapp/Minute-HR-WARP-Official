
import { useState, useEffect } from "react";

export const useLocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const getLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation wird von Ihrem Browser nicht unterstützt");
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      setLocation(position);
      
      // Reverse Geocoding mit OpenStreetMap Nominatim
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'de' } }
      );
      
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Adressinformationen");
      }
      
      const data = await response.json();
      
      // Strukturiere Adresse
      const addressParts = [];
      if (data.address.road) addressParts.push(data.address.road);
      if (data.address.house_number) addressParts.push(data.address.house_number);
      if (data.address.postcode) addressParts.push(data.address.postcode);
      if (data.address.city || data.address.town) addressParts.push(data.address.city || data.address.town);
      
      setAddress(addressParts.join(', '));
    } catch (err: any) {
      console.error('Standortfehler:', err);
      
      if (err.code === 1) { // PermissionDeniedError
        setPermissionDenied(true);
        setError("Standortzugriff verweigert. Bitte erteilen Sie die Berechtigung in Ihren Browsereinstellungen.");
      } else {
        setError(err.message || "Fehler beim Ermitteln des Standorts");
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getLocation();
  }, []);
  
  return {
    location,
    address,
    loading,
    error,
    permissionDenied,
    refresh: getLocation
  };
};
