
/**
 * Geocoding-Funktionen für die Standortermittlung
 */

/**
 * Führt ein Reverse Geocoding durch
 * Wandelt Koordinaten in eine Adresse um
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    console.log("Reverse Geocoding für Koordinaten:", latitude, longitude);
    
    // Füge Zufallsparameter und Timestamp für bessere Caching-Kontrolle hinzu
    const random = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&r=${random}&t=${timestamp}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'de',
        'User-Agent': 'MinuteApp Calendar (minuteapp@outlook.de)',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',   // Zusätzlicher Cache-Kontrolle-Header für ältere Browser
        'Expires': '0'          // Stellt sicher, dass die Antwort nicht gecacht wird
      },
      cache: 'no-store'         // Explizite Anweisung an Fetch, kein Caching zu verwenden
    });
    
    if (!response.ok) {
      throw new Error(`Fehler beim Reverse Geocoding: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Reverse Geocoding Ergebnis:", data);
    
    // Formatiere eine lesbare Adresse aus den Daten
    if (data && data.display_name) {
      return data.display_name;
    } else {
      console.warn("Reverse Geocoding: Unerwartetes Datenformat", data);
      return null;
    }
  } catch (error) {
    console.error("Fehler beim Reverse Geocoding:", error);
    return null;
  }
};

/**
 * Führt ein Geocoding durch (von Adresse zu Koordinaten)
 */
export const geocodeAddress = async (
  address: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    console.log("Geocoding für Adresse:", address);
    
    // Füge Zufallsparameter und Timestamp für bessere Caching-Kontrolle hinzu
    const random = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&r=${random}&t=${timestamp}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'de',
        'User-Agent': 'MinuteApp Calendar (minuteapp@outlook.de)',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',   // Zusätzlicher Header für ältere Browser
        'Expires': '0'          // Verhindert Caching
      },
      cache: 'no-store'         // Explizite Anweisung an Fetch API, kein Caching zu verwenden
    });
    
    if (!response.ok) {
      throw new Error(`Fehler beim Geocoding: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Geocoding Ergebnis:", data);
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    } else {
      console.warn("Geocoding: Keine Ergebnisse gefunden für", address);
      return null;
    }
  } catch (error) {
    console.error("Fehler beim Geocoding:", error);
    return null;
  }
};
