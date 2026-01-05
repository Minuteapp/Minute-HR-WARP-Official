import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  OctagonAlert, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SecurityDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
  onEndAllSessions?: () => void;
  onBlockIP?: (ip: string) => void;
  onChangePassword?: () => void;
  onLockAccount?: () => void;
}

export function SecurityDetailView({ 
  open, 
  onOpenChange, 
  notification,
  onEndAllSessions,
  onBlockIP,
  onChangePassword,
  onLockAccount
}: SecurityDetailViewProps) {
  // Daten aus notification extrahieren (keine Mock-Daten mehr)
  const metadata = notification?.metadata || {};
  const securityData = {
    title: notification?.title || metadata.title || "",
    severity: metadata.severity || metadata.threat_level || "",
    timeframe: metadata.timeframe || metadata.time_window || "",
    failedAttempts: metadata.failed_attempts || "",
    suspiciousLocation: metadata.suspicious_location || "",
    suspiciousIP: metadata.suspicious_ip || "",
    loginHistory: (metadata.login_history || []).map((login: any, index: number) => ({
      id: index,
      success: login.success,
      location: login.location || 'Unbekannt',
      device: login.device || 'Unbekanntes Gerät',
      ip: login.ip_address || login.ip || 'Unbekannt',
      timestamp: login.timestamp ? new Date(login.timestamp).toLocaleString('de-DE') : 'Unbekannt',
      suspicious: login.suspicious || false
    }))
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <ScrollArea className="max-h-[85vh] pr-4">
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <OctagonAlert size={24} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-[20px] font-semibold mb-1">
                    {securityData.title || notification?.title || 'Sicherheitswarnung'}
                  </DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive">Kritische Sicherheitswarnung</Badge>
                    <span className="text-[13px] text-muted-foreground">Sicherheit</span>
                    <span className="text-[13px] text-muted-foreground">•</span>
                    <span className="text-[13px] text-muted-foreground">
                      {notification?.timestamp ? new Date(notification.timestamp).toLocaleString('de-DE') : 'Unbekannt'}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Hauptwarnung */}
            {(securityData.title || notification?.message) && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[14px] font-semibold text-red-900 mb-1">
                      {securityData.title || 'Sicherheitswarnung'}
                    </h4>
                    <AlertDescription className="text-[13px] text-red-800">
                      {notification?.message || 'Keine weiteren Details verfügbar.'}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Bedrohungsdetails */}
            <div className="space-y-3">
              <h3 className="text-[15px] font-medium">Bedrohungsdetails</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">Bedrohungsstufe</p>
                      <p className="text-[13px] text-red-600 font-semibold">{securityData.severity || 'Unbekannt'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">Fehlversuche</p>
                      <p className="text-[13px] text-muted-foreground">{securityData.failedAttempts || 'Keine Daten'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">Zeitfenster</p>
                      <p className="text-[13px] text-muted-foreground">{securityData.timeframe || 'Nicht verfügbar'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">Verdächtiger Standort</p>
                      <p className="text-[13px] text-muted-foreground">{securityData.suspiciousLocation || 'Unbekannt'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anmeldeverlauf */}
            <div className="space-y-3">
              <h3 className="text-[15px] font-medium">Anmeldeverlauf</h3>
              
              <div className="space-y-3">
                {securityData.loginHistory.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground p-4 bg-muted rounded-lg">Kein Anmeldeverlauf verfügbar.</p>
                ) : securityData.loginHistory.map((login: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${login.suspicious ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}
                  >
                    <div className="flex items-start gap-3">
                      {login.success ? (
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-[13px] font-medium ${login.suspicious ? 'text-red-900' : ''}`}>
                            {login.success ? 'Erfolgreiche Anmeldung' : 'Fehlgeschlagene Anmeldung'}
                          </p>
                          {login.suspicious && (
                            <Badge variant="destructive" className="text-[11px] py-0">Verdächtig</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className={`text-[12px] ${login.suspicious ? 'text-red-800' : 'text-muted-foreground'}`}>
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {login.location}
                          </p>
                          <p className={`text-[12px] ${login.suspicious ? 'text-red-800' : 'text-muted-foreground'}`}>
                            {login.device}
                          </p>
                          <p className={`text-[12px] ${login.suspicious ? 'text-red-800' : 'text-muted-foreground'}`}>
                            IP: {login.ip}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-[12px] ${login.suspicious ? 'text-red-700' : 'text-muted-foreground'} whitespace-nowrap`}>
                        {login.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empfohlene Sicherheitsmaßnahmen */}
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-5 w-5 text-blue-600" />
              <div className="ml-2">
                <h4 className="text-[14px] font-semibold text-blue-900 mb-2">
                  Empfohlene Sicherheitsmaßnahmen
                </h4>
                <ul className="space-y-2 text-[13px] text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Passwort sofort ändern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Zwei-Faktor-Authentifizierung aktivieren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Aktive Sitzungen überprüfen und verdächtige beenden</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Sicherheitsfragen aktualisieren</span>
                  </li>
                </ul>
              </div>
            </Alert>

            {/* Footer Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  onEndAllSessions?.();
                }}
              >
                Alle Sitzungen beenden
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onBlockIP?.(securityData.suspiciousIP);
                }}
              >
                IP blockieren
              </Button>
              <Button
                onClick={() => {
                  onChangePassword?.();
                }}
              >
                Passwort ändern
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onLockAccount?.();
                }}
              >
                Konto sperren
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
