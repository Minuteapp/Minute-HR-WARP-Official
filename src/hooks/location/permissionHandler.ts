
/**
 * Überprüft den aktuellen Berechtigungsstatus für den Standortzugriff
 */
export const checkGeolocationPermission = async (): Promise<{ 
  state: 'granted' | 'denied' | 'prompt' | 'unknown',
  hasPermissionsAPI: boolean 
}> => {
  if (!navigator.geolocation) {
    console.warn("Geolocation wird von Ihrem Browser nicht unterstützt");
    return { state: 'unknown', hasPermissionsAPI: false };
  }

  // Erkennen des Browser-Typs für spezifisches Handling
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  
  console.log("Browser-Info:", { isSafari, isIOS });

  // Wenn navigator.permissions nicht verfügbar ist,
  // versuchen wir es mit einem direkten Test-Aufruf
  if (!navigator.permissions) {
    console.warn("Berechtigungs-API nicht verfügbar, versuche direkten Test");
    
    try {
      // Direkte Überprüfung durch Aufruf der Geolocation-API
      const permissionResult = await new Promise<'granted' | 'denied' | 'unknown'>((resolve) => {
        const testTimeout = setTimeout(() => {
          console.warn("Berechtigungstest-Timeout, Status unbekannt");
          resolve('unknown');
        }, 1000);
        
        // Safari benötigt spezielles Handling
        const options = {
          enableHighAccuracy: false,
          timeout: isSafari ? 2000 : 1000,
          maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
          () => {
            clearTimeout(testTimeout);
            console.log("Geolocation-Test erfolgreich, Zugriff erteilt");
            resolve('granted');
          },
          (error) => {
            clearTimeout(testTimeout);
            console.warn("Geolocation-Test fehlgeschlagen:", error.code, error.message);
            
            // Code 1 bedeutet PERMISSION_DENIED
            if (error.code === 1) {
              resolve('denied');
            } else {
              // Andere Fehler (Timeout, Position nicht verfügbar) bedeuten nicht, dass die Erlaubnis verweigert wurde
              resolve('unknown');
            }
          },
          options
        );
      });
      
      return { state: permissionResult, hasPermissionsAPI: false };
    } catch (e) {
      console.error("Fehler beim direkten Berechtigungstest:", e);
      return { state: 'unknown', hasPermissionsAPI: false };
    }
  }

  // Standardweg über die Permissions API
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    console.log("Aktueller Berechtigungsstatus:", permissionStatus.state);
    
    // Safari-spezifischer Fix: Safari meldet manchmal 'granted', obwohl die Berechtigung verweigert wurde
    if (permissionStatus.state === 'granted' && isSafari) {
      try {
        // Test-Aufruf zur Überprüfung der tatsächlichen Verfügbarkeit
        const testPromise = new Promise<boolean>((resolve, reject) => {
          const testTimeout = setTimeout(() => {
            console.log("Safari: Test-Standortabfrage überschritten die Zeit");
            resolve(false);
          }, 2000); // Längerer Timeout für Safari
          
          navigator.geolocation.getCurrentPosition(
            () => {
              clearTimeout(testTimeout);
              console.log("Safari: Test-Standortabfrage erfolgreich");
              resolve(true);
            },
            (error) => {
              clearTimeout(testTimeout);
              console.log("Safari: Test-Standortabfrage fehlgeschlagen:", error.code, error.message);
              
              // Bei Berechtigungsproblemen
              if (error.code === 1) {
                // Cache-Reset für Safari
                try {
                  localStorage.removeItem('geolocation_permission');
                  sessionStorage.removeItem('safari_permission_attempts');
                } catch (e) {
                  console.warn("Cache konnte nicht gelöscht werden:", e);
                }
              }
              
              resolve(false);
            },
            { maximumAge: 0, timeout: 1500, enableHighAccuracy: false }
          );
        });
        
        const testResult = await testPromise;
        if (!testResult && isSafari) {
          console.warn("Safari: Berechtigungen anscheinend erteilt, aber Standort kann nicht abgerufen werden");
          
          // Safari-spezifischer Workaround: Status auf 'prompt' setzen, um erneut zu fragen
          return { state: 'prompt', hasPermissionsAPI: true };
        }
      } catch (e) {
        console.warn("Fehler beim Testen der Standortabfrage:", e);
      }
    }
    
    return { 
      state: permissionStatus.state as 'granted' | 'denied' | 'prompt', 
      hasPermissionsAPI: true 
    };
  } catch (err) {
    console.warn("Konnte Berechtigungsstatus nicht abfragen:", err);
    return { state: 'unknown', hasPermissionsAPI: false };
  }
};

/**
 * Überwacht Änderungen am Berechtigungsstatus
 * Gibt eine Cleanup-Funktion zurück
 */
export const watchPermissionChanges = (callback: (state: string) => void): (() => void) => {
  if (!navigator.permissions) {
    console.warn("Berechtigungs-API nicht verfügbar, kann Änderungen nicht überwachen");
    return () => {}; // Noop-Cleanup-Funktion
  }

  let permissionStatus: PermissionStatus | null = null;

  navigator.permissions.query({ name: 'geolocation' as PermissionName })
    .then(status => {
      permissionStatus = status;
      
      // Initial callback mit aktuellem Status
      callback(status.state);
      
      // Handler für Statusänderungen
      const handleChange = () => {
        console.log("Berechtigungsstatus geändert zu:", status.state);
        callback(status.state);
      };
      
      // Statusänderungen überwachen
      status.addEventListener('change', handleChange);
      
      // Cleanup-Funktion aktualisieren
      cleanup = () => {
        status.removeEventListener('change', handleChange);
      };
    })
    .catch(err => {
      console.warn("Fehler beim Überwachen des Berechtigungsstatus:", err);
    });

  // Initialer Cleanup (wird später überschrieben)
  let cleanup = () => {};
  
  // Cleanup-Funktion zurückgeben
  return () => cleanup();
};

/**
 * Versucht, Standortberechtigungen anzufordern, indem ein direkter API-Aufruf gemacht wird
 * Enthält zusätzliche Browser-spezifische Workarounds
 */
export const requestGeolocationPermission = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation wird nicht unterstützt");
      resolve(false);
      return;
    }
    
    console.log("Versuche Standortberechtigung direkt anzufordern...");
    
    // Erkennen des Browser-Typs für spezifische Workarounds
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    console.log("Browser erkannt:", { isSafari, isIOS });
    
    // Optimierte Einstellungen für bessere Ergebnisse:
    // - Timeout je nach Browser anpassen
    const options = {
      enableHighAccuracy: false,
      timeout: isSafari ? 5000 : 3000, // Längeres Timeout für Safari
      maximumAge: 0
    };
    
    // Spezielle Behandlung für Safari
    if (isSafari) {
      console.log("Safari erkannt, verwende speziellen Workaround");
      
      // Versuche, den Cache zu löschen
      try {
        localStorage.removeItem('geolocation_permission_prompted');
        localStorage.removeItem('geolocation_permission');
        sessionStorage.removeItem('safari_permission_attempts');
      } catch (e) {
        console.warn("Lokaler Speicher konnte nicht gelöscht werden:", e);
      }
      
      // Safari benötigt manchmal einen zweiten Versuch
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          () => {
            console.log("Safari: Zweiter Versuch erfolgreich");
            resolve(true);
          },
          (error) => {
            console.warn("Safari: Zweiter Versuch fehlgeschlagen", error);
            resolve(false);
          },
          options
        );
      }, 200);
    }
    
    // Erster Versuch für alle Browser
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Standortberechtigung erfolgreich erteilt");
        resolve(true);
      },
      (error) => {
        console.warn("Standortberechtigung nicht erteilt:", error.code, error.message);
        
        // Bei Timeout oder POSITION_UNAVAILABLE, nicht als Fehler werten
        if (error.code === 3 || error.code === 2) {
          console.log("Fehler war kein Berechtigungsproblem, sondern technisch");
          resolve(true); // Technische Fehler nicht als Berechtigungsproblem werten
        } else if (isSafari) {
          // Für Safari lassen wir den zweiten Versuch entscheiden
          console.log("Safari: Erster Versuch fehlgeschlagen, warte auf zweiten Versuch");
        } else {
          resolve(false);
        }
      },
      options
    );
    
    // Sicherheits-Timeout, um sicherzustellen, dass wir nicht unendlich warten
    setTimeout(() => {
      console.warn("Timeout beim Anfordern der Standortberechtigung");
      resolve(false);
    }, 6000); // Längeres Timeout für den gesamten Prozess
  });
};

/**
 * Prüft, ob ein Browser-Berechtigungsproblem vorliegt und versucht, es zu beheben
 * Hilfreich für Fälle, in denen die Berechtigung anscheinend erteilt wurde,
 * aber der Browser sie trotzdem verweigert
 */
export const attemptPermissionWorkaround = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Detektiere den Browser
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edge") === -1;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isFirefox = userAgent.indexOf("Firefox") > -1;
    const isEdge = userAgent.indexOf("Edg") > -1;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    console.log("Browser-Erkennung:", { isChrome, isSafari, isFirefox, isEdge, isIOS });
    
    // Safari spezifischer Workaround
    if (isSafari) {
      try {
        // Safari hat manchmal Probleme mit dem Cache der Berechtigungen
        // Explizites Löschen des Caches
        localStorage.removeItem('geolocation_permission');
        localStorage.removeItem('geolocation_permission_prompted');
        sessionStorage.removeItem('safari_permission_attempts');
        
        // Zeitstempel des letzten Zugriffs löschen
        localStorage.removeItem('geolocation_last_access');
        
        console.log("Safari: Cache und Berechtigungsstatus zurückgesetzt");
        
        // Safari benötigt oft einen zweiten, verzögerten Versuch
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(
            () => {
              console.log("Safari: Verzögerter Workaround erfolgreich");
              resolve(true);
            },
            () => {
              console.log("Safari: Verzögerter Workaround fehlgeschlagen");
              resolve(false);
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
          );
        }, 300);
      } catch (e) {
        console.warn("Safari Workaround Fehler:", e);
      }
    }
    
    // iOS spezifischer Workaround (besonders Safari)
    if (isIOS) {
      console.log("iOS-spezifischer Workaround aktiviert");
      // iOS benötigt manchmal einen speziellen Workaround
      setTimeout(() => {
        // Verzögerte Anfrage für iOS
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
        );
      }, 500);
      
      // Sicherheits-Timeout für iOS-spezifischen Workaround
      setTimeout(() => resolve(false), 4000);
      return;
    }
    
    // Allgemeine Strategie für alle Browser - simple, direkte Anfrage
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Workaround erfolgreich");
        resolve(true);
      },
      (error) => {
        console.warn("Workaround fehlgeschlagen:", error);
        
        // Bei Timeout nicht als Berechtigungsproblem werten
        if (error.code === 3) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
    
    // Sicherheits-Timeout
    setTimeout(() => {
      resolve(false);
    }, 6000);
  });
};

/**
 * Gibt Hinweise für Benutzer, wie sie Standortberechtigungen aktivieren können
 * basierend auf Browser und Betriebssystem
 */
export const getLocationPermissionHelp = (): string => {
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edge") === -1;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isFirefox = userAgent.indexOf("Firefox") > -1;
  const isEdge = userAgent.indexOf("Edg") > -1;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  if (isIOS && isSafari) {
    return "Um den Standortzugriff in Safari auf iOS zu erlauben: Gehen Sie zu Einstellungen > Safari > Standortzugriff > und setzen Sie diese App auf 'Erlauben'.";
  } else if (isIOS) {
    return "Um den Standortzugriff auf iOS zu erlauben: Gehen Sie zu Einstellungen > Datenschutz > Ortungsdienste > aktivieren Sie die Ortungsdienste und erlauben Sie dem Browser den Zugriff.";
  } else if (isAndroid && isChrome) {
    return "Um den Standortzugriff in Chrome auf Android zu erlauben: Tippen Sie auf die drei Punkte > Einstellungen > Websiteeinstellungen > Standort > aktivieren Sie den Standortzugriff.";
  } else if (isChrome) {
    return "Um den Standortzugriff in Chrome zu erlauben: Klicken Sie auf das Schlosssymbol in der Adressleiste > Standort > und wählen Sie 'Zulassen'.";
  } else if (isFirefox) {
    return "Um den Standortzugriff in Firefox zu erlauben: Klicken Sie auf das Schlosssymbol in der Adressleiste > Berechtigungen > und erlauben Sie den Standortzugriff.";
  } else if (isEdge) {
    return "Um den Standortzugriff in Edge zu erlauben: Klicken Sie auf das Schlosssymbol in der Adressleiste > Berechtigungen > Standort > und wählen Sie 'Zulassen'.";
  } else if (isSafari) {
    return "Um den Standortzugriff in Safari zu erlauben: Gehen Sie zu Safari > Einstellungen > Websites > Standort > und erlauben Sie den Zugriff für diese Website.";
  }
  
  return "Um den Standortzugriff zu erlauben, überprüfen Sie die Einstellungen Ihres Browsers und stellen Sie sicher, dass der Standortzugriff für diese Website aktiviert ist.";
};
