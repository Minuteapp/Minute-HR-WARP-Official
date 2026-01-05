import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodeData {
  locationId: string;
  locationName: string;
  companyId?: string;
  timestamp: string;
  type: 'location' | 'generic';
}

interface QRCodeGeneratorProps {
  locations?: Array<{
    id: string;
    name: string;
    address?: string;
  }>;
  companyId?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  locations = [],
  companyId
}) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocationName, setCustomLocationName] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrCodeText, setQrCodeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!selectedLocation && !customLocationName.trim()) {
      toast({
        title: "Eingabe erforderlich",
        description: "Bitte wählen Sie einen Standort oder geben Sie einen Namen ein.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      let qrData: QRCodeData;

      if (selectedLocation) {
        const location = locations.find(l => l.id === selectedLocation);
        qrData = {
          locationId: selectedLocation,
          locationName: location?.name || 'Unbekannter Standort',
          companyId,
          timestamp: new Date().toISOString(),
          type: 'location'
        };
      } else {
        qrData = {
          locationId: `custom_${Date.now()}`,
          locationName: customLocationName.trim(),
          companyId,
          timestamp: new Date().toISOString(),
          type: 'generic'
        };
      }

      const qrText = JSON.stringify(qrData);
      setQrCodeText(qrText);

      // QR-Code generieren
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(dataUrl);

      toast({
        title: "QR-Code generiert",
        description: `QR-Code für "${qrData.locationName}" wurde erfolgreich erstellt.`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('QR-Code Generierung fehlgeschlagen:', error);
      toast({
        title: "Generierung fehlgeschlagen",
        description: "Der QR-Code konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${selectedLocation || customLocationName.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    link.click();

    toast({
      title: "QR-Code heruntergeladen",
      description: "Der QR-Code wurde als PNG-Datei gespeichert.",
      variant: "default"
    });
  };

  const copyQRCodeText = async () => {
    if (!qrCodeText) return;

    try {
      await navigator.clipboard.writeText(qrCodeText);
      toast({
        title: "In Zwischenablage kopiert",
        description: "QR-Code Daten wurden kopiert.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Kopieren fehlgeschlagen",
        description: "Die Daten konnten nicht kopiert werden.",
        variant: "destructive"
      });
    }
  };

  const previewQRData = () => {
    if (!qrCodeText) return null;

    try {
      const data = JSON.parse(qrCodeText) as QRCodeData;
      return data;
    } catch {
      return null;
    }
  };

  const qrData = previewQRData();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR-Code Generator für Zeiterfassung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eingabebereich */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="location-select">Standort auswählen</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Standort wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Benutzerdefiniert</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.address && (
                      <span className="text-muted-foreground ml-2">
                        - {location.address}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedLocation && (
            <div>
              <Label htmlFor="custom-location">Standortname eingeben</Label>
              <Input
                id="custom-location"
                value={customLocationName}
                onChange={(e) => setCustomLocationName(e.target.value)}
                placeholder="z.B. Büro Hauptstandort, Baustelle A, Home Office..."
              />
            </div>
          )}

          <Button 
            onClick={generateQRCode}
            disabled={isGenerating || (!selectedLocation && !customLocationName.trim())}
            className="w-full"
          >
            {isGenerating ? 'Generiere QR-Code...' : 'QR-Code generieren'}
          </Button>
        </div>

        {/* QR-Code Anzeige */}
        {qrCodeDataUrl && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-dashed">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Generated QR Code" 
                  className="w-64 h-64"
                />
              </div>
              
              {qrData && (
                <div className="text-center space-y-2">
                  <h4 className="font-medium">{qrData.locationName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Erstellt: {new Date(qrData.timestamp).toLocaleString('de-DE')}
                  </p>
                  {qrData.companyId && (
                    <p className="text-xs text-muted-foreground">
                      Firma-ID: {qrData.companyId}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Herunterladen
              </Button>
              
              <Button 
                onClick={copyQRCodeText}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Daten kopieren
              </Button>
            </div>
          </div>
        )}

        {/* Informationen */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Verwendung des QR-Codes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Drucken Sie den QR-Code aus und befestigen Sie ihn am Arbeitsplatz</li>
            <li>• Mitarbeiter können mit der App den Code scannen zum Ein-/Ausstempeln</li>
            <li>• Der QR-Code enthält Standort- und Zeitinformationen</li>
            <li>• Jeder Code ist einzigartig und zeitgestempelt</li>
          </ul>
        </div>

        {/* QR-Code Daten (für Debugging) */}
        {qrCodeText && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              QR-Code Daten anzeigen (für Entwickler)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(qrData, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};