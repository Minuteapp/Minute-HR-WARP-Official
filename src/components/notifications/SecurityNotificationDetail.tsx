import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, AlertTriangle, MapPin, Monitor, Clock, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginAttempt {
  id: string;
  status: 'success' | 'failed';
  location: string;
  device: string;
  ipAddress: string;
  timestamp: string;
  suspicious?: boolean;
}

interface SecurityNotificationDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: {
    id: string;
    title: string;
    message: string;
    category: string;
    timestamp: Date | string;
    priority?: string;
  };
}

export function SecurityNotificationDetail({ 
  open, 
  onOpenChange, 
  notification 
}: SecurityNotificationDetailProps) {
  
  // Daten aus notification.metadata extrahieren (keine Mock-Daten mehr)
  const metadata = (notification as any)?.metadata || {};
  const threatLevel = metadata.threat_level || metadata.severity || "Unbekannt";
  const timeWindow = metadata.time_window || "Nicht verfügbar";
  const failedAttempts = metadata.failed_attempts || "Keine Daten";
  const suspiciousLocation = metadata.suspicious_location || "Unbekannt";
  
  // Login-Verlauf aus metadata extrahieren
  const loginAttempts: LoginAttempt[] = (metadata.login_history || []).map((login: any, index: number) => ({
    id: String(index + 1),
    status: login.success ? 'success' : 'failed',
    location: login.location || 'Unbekannt',
    device: login.device || 'Unbekanntes Gerät',
    ipAddress: login.ip_address || login.ip || 'Unbekannt',
    timestamp: login.timestamp ? new Date(login.timestamp).toLocaleString('de-DE') : 'Unbekannt',
    suspicious: login.suspicious || false
  }));

  const recommendedActions = metadata.recommended_actions || [
    "Passwort sofort ändern",
    "Zwei-Faktor-Authentifizierung aktivieren",
    "Aktive Sitzungen überprüfen und verdächtige beenden",
    "Sicherheitsfragen aktualisieren"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">Sicherheitswarnung</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive" className="bg-red-600">
                  Kritische Sicherheitswarnung
                </Badge>
                <Badge variant="outline">Sicherheit</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Alert Box */}
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="font-semibold text-red-900 mb-1">
                Verdächtige Anmeldeaktivität erkannt
              </div>
              <div className="text-sm text-red-800">
                Unser System hat 2 fehlgeschlagene Anmeldeversuche von einem unbekannten Standort (Moskau, Russland) innerhalb von 3 Minuten erkannt. 
                Dies könnte auf einen unbefugten Zugriffsversuch hinweisen.
              </div>
            </AlertDescription>
          </Alert>

          {/* Bedrohungsdetails */}
          <div>
            <h3 className="font-semibold mb-4">Bedrohungsdetails</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Bedrohungsstufe</span>
                </div>
                <div className="font-medium">{threatLevel}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Zeitfenster</span>
                </div>
                <div className="font-medium">{timeWindow}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span>Fehlversuche</span>
                </div>
                <div className="font-medium">{failedAttempts}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span>Verdächtiger Standort</span>
                </div>
                <div className="font-medium">{suspiciousLocation}</div>
              </div>
            </div>
          </div>

          {/* Anmeldeverlauf */}
          <div>
            <h3 className="font-semibold mb-4">Anmeldeverlauf</h3>
            <div className="space-y-3">
              {loginAttempts.map((attempt) => (
                <div 
                  key={attempt.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    attempt.suspicious 
                      ? "bg-red-50 border-red-200" 
                      : "bg-green-50 border-green-200"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "mt-1",
                      attempt.status === 'success' ? "text-green-600" : "text-red-600"
                    )}>
                      {attempt.status === 'success' ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                          <span className="text-sm font-medium">Erfolgreich</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-600" />
                          <span className="text-sm font-medium">Fehlgeschlagen</span>
                          {attempt.suspicious && (
                            <Badge variant="destructive" className="text-xs">
                              Verdächtig
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attempt.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attempt.device}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-[10px]">IP</span>
                        </div>
                        <span className="text-sm">{attempt.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground ml-4">
                    {attempt.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empfohlene Sicherheitsmaßnahmen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Empfohlene Sicherheitsmaßnahmen
                </h4>
                <ul className="space-y-2">
                  {recommendedActions.map((action, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Alle Sitzungen beenden
            </Button>
            <Button variant="outline">
              IP blockieren
            </Button>
            <Button variant="default" className="bg-[#3B44F6] hover:bg-[#3B44F6]/90">
              Passwort ändern
            </Button>
            <Button variant="destructive">
              Konto sperren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
