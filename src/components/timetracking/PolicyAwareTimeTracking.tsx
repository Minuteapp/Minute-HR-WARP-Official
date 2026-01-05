import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  QrCode, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Smartphone 
} from 'lucide-react';
import PolicyAwareComponent from '@/components/system/PolicyAwareComponent';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';

interface TimeTrackingContextProps {
  userId?: string;
  location?: { lat: number; lng: number };
  qrCodeScanned?: boolean;
  deviceId?: string;
}

const PolicyAwareTimeTracking = ({ 
  userId, 
  location, 
  qrCodeScanned = false, 
  deviceId 
}: TimeTrackingContextProps) => {
  const { guards } = usePolicyEnforcement();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [policyViolations, setPolicyViolations] = useState<string[]>([]);

  // Erstelle Policy-Context für Zeiterfassung
  const policyContext = {
    qr_scanned: qrCodeScanned,
    location_verified: !!location,
    device_id: deviceId,
    mfa_verified: true, // Würde normalerweise aus auth state kommen
    current_time: new Date().toISOString()
  };

  const handleCheckIn = async () => {
    const violations: string[] = [];

    // Prüfe QR-Code-Policy
    const canCheckInQR = await guards.canCheckIn(policyContext);
    if (!canCheckInQR && !qrCodeScanned) {
      violations.push('QR-Code-Scan erforderlich');
    }

    // Prüfe Standort-Policy
    if (!location) {
      violations.push('Standortverifikation erforderlich');
    }

    setPolicyViolations(violations);

    if (violations.length === 0) {
      setIsCheckedIn(true);
      setLastCheckIn(new Date());
      console.log('Check-in erfolgreich mit Policy-Kontext:', policyContext);
    }
  };

  const handleCheckOut = async () => {
    const canCheckOut = await guards.canCheckOut(policyContext);
    if (canCheckOut) {
      setIsCheckedIn(false);
      setLastCheckIn(null);
      setPolicyViolations([]);
    }
  };

  return (
    <PolicyAwareComponent 
      moduleName="timetracking" 
      requiredActions={['access']}
      context={policyContext}
      showStatus={true}
      showRefresh={true}
    >
      <div className="space-y-6">
        {/* Aktueller Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Zeiterfassung
              {isCheckedIn && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Eingecheckt
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Policy-Verletzungen anzeigen */}
              {policyViolations.length > 0 && (
                <Alert className="border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sicherheitsrichtlinien nicht erfüllt</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {policyViolations.map((violation, index) => (
                        <li key={index} className="text-sm">{violation}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Status-Indikatoren */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm">QR-Code:</span>
                  <Badge variant={qrCodeScanned ? 'default' : 'secondary'}>
                    {qrCodeScanned ? 'Gescannt' : 'Nicht gescannt'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Standort:</span>
                  <Badge variant={location ? 'default' : 'secondary'}>
                    {location ? 'Verifiziert' : 'Nicht verifiziert'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Gerät:</span>
                  <Badge variant={deviceId ? 'default' : 'secondary'}>
                    {deviceId ? 'Registriert' : 'Unbekannt'}
                  </Badge>
                </div>
              </div>

              {/* Check-In/Out Buttons */}
              <div className="flex gap-4">
                {!isCheckedIn ? (
                  <Button 
                    onClick={handleCheckIn} 
                    className="flex-1"
                    disabled={policyViolations.length > 0}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Einchecken
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCheckOut} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Auschecken
                  </Button>
                )}
              </div>

              {/* Letzte Aktivität */}
              {lastCheckIn && (
                <div className="text-sm text-muted-foreground">
                  Letzte Aktivität: {lastCheckIn.toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy-Anforderungen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Aktive Sicherheitsrichtlinien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm font-medium">QR-Code-Scan verpflichtend</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Standortverifikation erforderlich</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Deutsche Arbeitszeitgesetze (ArbZG)</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Überwacht</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PolicyAwareComponent>
  );
};

export default PolicyAwareTimeTracking;