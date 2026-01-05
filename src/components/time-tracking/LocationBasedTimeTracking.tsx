import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin, QrCode, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocationTracking } from '@/hooks/time-tracking/useLocationTracking';
import { useQRCodeScanner } from '@/hooks/time-tracking/useQRCodeScanner';
import { useToast } from '@/hooks/use-toast';

interface LocationBasedTimeTrackingProps {
  onTimeAction: (data: {
    type: 'clock_in' | 'clock_out';
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
      geofence_name?: string;
    };
    verification_method: 'gps' | 'qr_code' | 'employee_id';
    verification_data?: string;
  }) => void;
  isTracking: boolean;
  geofenceLocations?: any[];
  requireLocation?: boolean;
  enableQRCode?: boolean;
  enableEmployeeId?: boolean;
}

export const LocationBasedTimeTracking: React.FC<LocationBasedTimeTrackingProps> = ({
  onTimeAction,
  isTracking,
  geofenceLocations = [],
  requireLocation = false,
  enableQRCode = true,
  enableEmployeeId = true
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'gps' | 'qr_code' | 'employee_id'>('gps');
  const [employeeId, setEmployeeId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  const {
    locationState,
    currentGeofence,
    isInAllowedArea,
    getCurrentLocation,
    refresh: refreshLocation
  } = useLocationTracking({
    enableHighAccuracy: true,
    timeout: 10000,
    geofenceLocations
  });

  const {
    isScanning,
    lastScanResult,
    startScan,
    validateEmployeeId,
    parseQRCodeData
  } = useQRCodeScanner();

  useEffect(() => {
    // Lade initialen Standort wenn GPS-Methode gewählt ist
    if (selectedMethod === 'gps') {
      getCurrentLocation();
    }
  }, [selectedMethod]);

  const handleClockAction = async (action: 'clock_in' | 'clock_out') => {
    setIsProcessing(true);

    try {
      let verificationData: any = {};

      switch (selectedMethod) {
        case 'gps':
          if (requireLocation && !isInAllowedArea) {
            toast({
              title: "Standort nicht erlaubt",
              description: "Sie befinden sich nicht in einem erlaubten Arbeitsbereich.",
              variant: "destructive"
            });
            return;
          }

          const location = await getCurrentLocation();
          if (!location && requireLocation) {
            toast({
              title: "Standort erforderlich",
              description: "Standort konnte nicht ermittelt werden. Bitte versuchen Sie es erneut.",
              variant: "destructive"
            });
            return;
          }

          verificationData = {
            type: action,
            location: location ? {
              latitude: location.latitude,
              longitude: location.longitude,
              address: locationState.address,
              geofence_name: currentGeofence?.name
            } : undefined,
            verification_method: 'gps'
          };
          break;

        case 'qr_code':
          const qrResult = await startScan();
          if (!qrResult) {
            toast({
              title: "QR-Code erforderlich",
              description: "Kein gültiger QR-Code gescannt.",
              variant: "destructive"
            });
            return;
          }

          const qrData = parseQRCodeData(qrResult.text);
          verificationData = {
            type: action,
            verification_method: 'qr_code',
            verification_data: qrResult.text,
            location: qrData.type === 'structured' ? {
              address: `QR-Code Standort: ${qrData.locationId || 'Unbekannt'}`
            } : undefined
          };
          break;

        case 'employee_id':
          if (!employeeId || !validateEmployeeId(employeeId)) {
            toast({
              title: "Ungültige Mitarbeiter-ID",
              description: "Bitte geben Sie eine gültige Mitarbeiter-ID ein (3-10 Zeichen, alphanumerisch).",
              variant: "destructive"
            });
            return;
          }

          verificationData = {
            type: action,
            verification_method: 'employee_id',
            verification_data: employeeId
          };
          break;
      }

      await onTimeAction(verificationData);

      toast({
        title: action === 'clock_in' ? "Erfolgreich eingestempelt" : "Erfolgreich ausgestempelt",
        description: `${action === 'clock_in' ? 'Arbeitsbeginn' : 'Arbeitsende'} mit ${
          selectedMethod === 'gps' ? 'GPS' : 
          selectedMethod === 'qr_code' ? 'QR-Code' : 'Mitarbeiter-ID'
        } erfasst.`,
        variant: "default"
      });

    } catch (error: any) {
      toast({
        title: "Fehler beim Stempeln",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getLocationStatus = () => {
    if (locationState.loading) return { color: 'secondary', text: 'Ermittlung...' };
    if (locationState.error) return { color: 'destructive', text: 'Fehler' };
    if (isInAllowedArea) return { color: 'default', text: 'Erlaubter Bereich' };
    if (locationState.latitude && !isInAllowedArea) return { color: 'secondary', text: 'Außerhalb Bereich' };
    return { color: 'outline', text: 'Unbekannt' };
  };

  const status = getLocationStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Standortbasierte Zeiterfassung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Methoden-Auswahl */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Erfassungsmethode wählen:</Label>
          
          <div className="grid grid-cols-1 gap-3">
            {/* GPS Option */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={selectedMethod === 'gps'}
                  onCheckedChange={(checked) => checked && setSelectedMethod('gps')}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">GPS Standort</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatische Standorterfassung
                  </p>
                </div>
              </div>
              <Badge variant={status.color as any}>{status.text}</Badge>
            </div>

            {/* QR Code Option */}
            {enableQRCode && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={selectedMethod === 'qr_code'}
                    onCheckedChange={(checked) => checked && setSelectedMethod('qr_code')}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium">QR-Code Scanner</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      QR-Code am Arbeitsplatz scannen
                    </p>
                  </div>
                </div>
                {isScanning && <Badge variant="secondary">Scannt...</Badge>}
              </div>
            )}

            {/* Employee ID Option */}
            {enableEmployeeId && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={selectedMethod === 'employee_id'}
                    onCheckedChange={(checked) => checked && setSelectedMethod('employee_id')}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Mitarbeiter-ID</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ID-Nummer eingeben
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Methoden-spezifische Inhalte */}
        {selectedMethod === 'gps' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktueller Standort:</span>
              <Button variant="outline" size="sm" onClick={refreshLocation}>
                Aktualisieren
              </Button>
            </div>
            
            {locationState.address && (
              <p className="text-sm bg-muted p-2 rounded">
                {locationState.address}
              </p>
            )}

            {currentGeofence && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Arbeitsbereich: {currentGeofence.name}
              </div>
            )}

            {locationState.latitude && !isInAllowedArea && requireLocation && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Sie befinden sich außerhalb der erlaubten Arbeitsbereiche
              </div>
            )}

            {locationState.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {locationState.error}
              </div>
            )}
          </div>
        )}

        {selectedMethod === 'employee_id' && (
          <div className="space-y-3">
            <Label htmlFor="employee-id">Mitarbeiter-ID eingeben:</Label>
            <Input
              id="employee-id"
              placeholder="z.B. EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              maxLength={10}
            />
            {employeeId && !validateEmployeeId(employeeId) && (
              <p className="text-xs text-destructive">
                ID muss 3-10 alphanumerische Zeichen enthalten
              </p>
            )}
          </div>
        )}

        {selectedMethod === 'qr_code' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Klicken Sie auf "Scannen", um den QR-Code am Arbeitsplatz zu erfassen.
            </p>
            
            {lastScanResult && (
              <div className="text-sm bg-muted p-2 rounded">
                Letzter Scan: {lastScanResult.text}
              </div>
            )}
          </div>
        )}

        {/* Aktions-Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            onClick={() => handleClockAction('clock_in')}
            disabled={isProcessing || isTracking || 
              (selectedMethod === 'gps' && requireLocation && !isInAllowedArea) ||
              (selectedMethod === 'employee_id' && !validateEmployeeId(employeeId))
            }
            className="w-full"
          >
            {isProcessing ? 'Verarbeitung...' : 'Einstempeln'}
          </Button>
          
          <Button
            onClick={() => handleClockAction('clock_out')}
            disabled={isProcessing || !isTracking ||
              (selectedMethod === 'employee_id' && !validateEmployeeId(employeeId))
            }
            variant="outline"
            className="w-full"
          >
            {isProcessing ? 'Verarbeitung...' : 'Ausstempeln'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};