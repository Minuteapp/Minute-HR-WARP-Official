
/**
 * Hilfsfunktionen für die Standortanzeige
 */

/**
 * Ermittelt den Browsertyp des Benutzers
 */
export const detectBrowserType = (): string => {
  const userAgent = navigator.userAgent;
  if (/^((?!chrome|android).)*safari/i.test(userAgent)) {
    return "safari";
  } else if (/chrome|chromium/i.test(userAgent)) {
    return "chrome";
  } else if (/firefox/i.test(userAgent)) {
    return "firefox";
  }
  return "";
};

/**
 * Generiert einen Hilfstext für Fehlermeldungen basierend auf dem Fehlertyp und Browser
 */
export const getErrorHelpText = (
  error: string | null, 
  permissionDenied: boolean, 
  browserType: string
): string => {
  if (permissionDenied) {
    if (browserType === "safari") {
      return "Safari blockiert den Standortzugriff. Bitte auf 'Erlauben', wenn Safari nachfragt, oder überprüfen Sie die Einstellungen: Safari > Einstellungen > Websites > Standort.";
    } else if (browserType === "chrome") {
      return "Chrome blockiert den Standortzugriff. Bitte auf das Schlosssymbol in der Adressleiste klicken und Standort erlauben.";
    } else if (browserType === "firefox") {
      return "Firefox blockiert den Standortzugriff. Bitte auf das Schlosssymbol in der Adressleiste klicken und Standort erlauben.";
    }
    
    return "Standortzugriff nicht erteilt. Bitte auf das Symbol klicken, um es erneut zu versuchen.";
  }
  
  if (error?.includes("verfügbar")) {
    return "Ihr Gerät kann den Standort aktuell nicht bestimmen. Bitte prüfen Sie Ihre GPS/Standort-Einstellungen.";
  }
  
  if (error?.includes("Zeitüberschreitung")) {
    return "Die Standortermittlung hat zu lange gedauert. Bitte versuchen Sie es erneut.";
  }
  
  return error || "Ein Fehler ist aufgetreten.";
};

/**
 * Safari-spezifischer Cache-Workaround
 */
export const clearSafariLocationCache = (): void => {
  try {
    localStorage.removeItem('geolocation_permission');
    sessionStorage.removeItem('safari_permission_attempts');
    
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('geo') || key.includes('location') || key.includes('position')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn("Cache konnte nicht gelöscht werden:", e);
  }
};
