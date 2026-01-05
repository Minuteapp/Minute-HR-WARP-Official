
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, RefreshCw, MapPin, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MapWithToken from "@/components/time-tracking/MapWithToken";

interface MapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocation?: [number, number] | null;
  onLocationConfirm?: (coords: { lat: number; lng: number; address?: string }) => void;
}

// Entfernt: Hardcodierter Token aus Sicherheitsgründen

const MapDialog = ({ 
  open, 
  onOpenChange, 
  initialLocation,
  onLocationConfirm
}: MapDialogProps) => {
  const { toast } = useToast();
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>("");

  // Browser-Informationen erfassen
  useEffect(() => {
    if (open) {
      const browserName = 
        navigator.userAgent.indexOf("Chrome") > -1 ? "Chrome" : 
        navigator.userAgent.indexOf("Safari") > -1 ? "Safari" : 
        navigator.userAgent.indexOf("Firefox") > -1 ? "Firefox" : 
        navigator.userAgent.indexOf("Edge") > -1 ? "Edge" : 
        "Unbekannter Browser";
      
      setBrowserInfo(browserName);
    }
  }, [open]);
  
  // Überprüfe Standortberechtigungen beim Öffnen des Dialogs
  useEffect(() => {
    if (open) {
      setMapError(null);
      setPermissionDenied(false);
      
      const checkPermission = async () => {
        if (navigator.permissions) {
          try {
            console.log("MapDialog: Prüfe Standortberechtigung...");
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            console.log("MapDialog: Berechtigungsstatus:", permissionStatus.state);
            
            if (permissionStatus.state === 'denied') {
              console.log("MapDialog: Zugriff verweigert");
              setPermissionDenied(true);
            } else if (permissionStatus.state === 'granted') {
              console.log("MapDialog: Zugriff gewährt");
              setPermissionDenied(false);
            } else {
              console.log("MapDialog: Zugriff unbestimmt (anfragen)");
              setPermissionDenied(false);
            }
            
            // Bei Statusänderung neu laden
            permissionStatus.addEventListener('change', () => {
              console.log("MapDialog: Berechtigungsstatus geändert zu:", permissionStatus.state);
              if (permissionStatus.state === 'granted') {
                setRetryCount(prev => prev + 1);
                setPermissionDenied(false);
                setMapError(null);
              }
            });
          } catch (err) {
            console.error("MapDialog: Fehler beim Prüfen der Berechtigungen:", err);
          }
        }
      };
      
      checkPermission();
    }
  }, [open]);

  const handleConfirmLocation = useCallback(() => {
    if (selectedLocation) {
      toast({
        title: "Standort bestätigt",
        description: "Ihr Standort wurde erfolgreich erfasst.",
      });
      
      if (onLocationConfirm) {
        onLocationConfirm(selectedLocation);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Kein Standort ausgewählt",
        description: "Bitte wählen Sie einen Standort auf der Karte aus.",
      });
      return;
    }
    
    onOpenChange(false);
  }, [selectedLocation, onLocationConfirm, onOpenChange, toast]);

  const handleMapError = useCallback((error: string) => {
    console.error("MapDialog Fehler:", error);
    setMapError(error);
    
    if (error.includes("verweigert") || error.includes("nicht erteilt") || error.includes("denied")) {
      setPermissionDenied(true);
    }
  }, []);

  const handleLocationUpdate = useCallback((coords: { lat: number; lng: number }) => {
    console.log("MapDialog: Standort aktualisiert:", coords);
    setSelectedLocation(coords);
    setMapError(null);
    
    // Wenn der Standort aktualisiert werden konnte, ist die Berechtigung offensichtlich vorhanden
    setPermissionDenied(false);
  }, []);

  const handleRetryLocation = useCallback(() => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setMapError(null);
    
    // Kurz warten, um dem Benutzer visuelles Feedback zu geben
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
    
    toast({
      title: "Standortermittlung",
      description: "Versuche erneut den Standort zu ermitteln...",
    });
  }, [toast]);

  // Erzwinge einen Standortanfragedialog im Browser
  const forceLocationPrompt = useCallback(() => {
    if (navigator.geolocation) {
      toast({
        title: "Standortanfrage",
        description: "Bitte erlauben Sie den Standortzugriff, wenn Ihr Browser danach fragt.",
      });
      
      // Neuen Versuch starten
      setRetryCount(prev => prev + 1);
      
      // Direkten Aufruf versuchen als Backup
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Standort erfolgreich durch direkte Anfrage ermittelt");
          setPermissionDenied(false);
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Direkte Standortanfrage fehlgeschlagen:", error);
          if (error.code === 1) { // PERMISSION_DENIED
            setPermissionDenied(true);
            toast({
              variant: "destructive",
              title: "Standortzugriff verweigert",
              description: "Es liegt möglicherweise ein Problem mit den Berechtigungen in Ihrem Browser vor.",
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [toast]);

  // Hilfreiche Anweisungen je nach Browser anzeigen
  const getBrowserSpecificInstructions = useCallback(() => {
    switch (browserInfo) {
      case "Chrome":
        return (
          <>
            <p className="font-medium mb-1">Chrome-Anleitung:</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Klicken Sie auf das Schlosssymbol links in der Adressleiste</li>
              <li>Wählen Sie "Standort" und ändern Sie auf "Zulassen"</li>
              <li>Laden Sie die Seite neu</li>
            </ol>
          </>
        );
      case "Firefox":
        return (
          <>
            <p className="font-medium mb-1">Firefox-Anleitung:</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Klicken Sie auf das Schlosssymbol links in der Adressleiste</li>
              <li>Entfernen Sie das Häkchen bei "Standortdaten blockieren"</li>
              <li>Laden Sie die Seite neu</li>
            </ol>
          </>
        );
      case "Safari":
        return (
          <>
            <p className="font-medium mb-1">Safari-Anleitung:</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Öffnen Sie die Safari-Einstellungen (Safari &gt; Einstellungen)</li>
              <li>Gehen Sie zu "Websites" &gt; "Standort"</li>
              <li>Suchen Sie diese Website und stellen Sie auf "Erlauben"</li>
              <li>Laden Sie die Seite neu</li>
            </ol>
          </>
        );
      case "Edge":
        return (
          <>
            <p className="font-medium mb-1">Edge-Anleitung:</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Klicken Sie auf das Schlosssymbol links in der Adressleiste</li>
              <li>Klicken Sie auf "Standort" und ändern Sie auf "Zulassen"</li>
              <li>Laden Sie die Seite neu</li>
            </ol>
          </>
        );
      default:
        return (
          <>
            <p className="font-medium mb-1">Allgemeine Anleitung:</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Suchen Sie in Ihren Browsereinstellungen nach "Standort" oder "Berechtigungen"</li>
              <li>Stellen Sie sicher, dass für diese Website der Standortzugriff erlaubt ist</li>
              <li>Laden Sie die Seite neu</li>
            </ol>
          </>
        );
    }
  }, [browserInfo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Standort erfassen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen Standort auf der Karte, oder lassen Sie Ihren aktuellen Standort ermitteln.
          </DialogDescription>
        </DialogHeader>
        
        {mapError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mapError}
            </AlertDescription>
          </Alert>
        ) : null}
        
        {permissionDenied && (
          <Alert variant="warning" className="bg-amber-50 border-amber-300 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex flex-col gap-2">
              <p className="font-semibold">Standortzugriff blockiert</p>
              <p>Obwohl Sie den Standortzugriff aktiviert haben, scheint es ein Problem mit Ihrem Browser zu geben.</p>
              
              <div className="mt-2 p-2 bg-white/50 rounded-md border border-amber-200">
                {getBrowserSpecificInstructions()}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex gap-2 items-center"
                  onClick={forceLocationPrompt}
                >
                  <MapPin className="h-3 w-3" />
                  Berechtigung neu anfordern
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex gap-2 items-center"
                  onClick={handleRetryLocation}
                  disabled={isRetrying}
                >
                  <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  Erneut versuchen
                </Button>
              </div>
              
              <div className="mt-2 text-xs flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                <p>
                  <strong>Alternative:</strong> Sie können auch einen Standort direkt auf der Karte auswählen, 
                  indem Sie einfach an der gewünschten Position klicken.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="h-[400px] w-full relative">
          <MapWithToken 
            initialLocation={initialLocation}
            onLocationUpdate={handleLocationUpdate}
            onError={handleMapError}
            retryCount={retryCount}
          />
        </div>

        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={handleRetryLocation}
            className="flex gap-2 items-center"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            Standort neu ermitteln
          </Button>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className="bg-primary hover:bg-primary/90"
            >
              Standort bestätigen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapDialog;
