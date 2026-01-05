import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { logSecurityEvent } from '@/utils/security/audit-logger';
import { supabase } from '@/integrations/supabase/client';

interface NFCManagerProps {
  onNFCRead?: (data: any) => void;
  onNFCWrite?: (data: any) => void;
}

export const NFCManager: React.FC<NFCManagerProps> = ({ onNFCRead, onNFCWrite }) => {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [lastReadData, setLastReadData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // NFC-Unterstützung prüfen
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }
  }, []);

  const startNFCRead = async () => {
    if (!isNFCSupported) {
      setError('NFC wird von diesem Gerät nicht unterstützt');
      return;
    }

    try {
      setIsReading(true);
      setError(null);

      // @ts-ignore - NDEFReader ist experimentell
      const ndef = new NDEFReader();
      
      await ndef.scan();

      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        console.log('NFC-Daten gelesen:', { message, serialNumber });
        
        const data = {
          serialNumber,
          records: message.records.map((record: any) => ({
            recordType: record.recordType,
            data: new TextDecoder().decode(record.data)
          })),
          timestamp: new Date().toISOString()
        };

        setLastReadData(data);
        
        // Audit-Log
        logSecurityEvent({
          action: 'nfc_read_success',
          resourceType: 'nfc',
          success: true,
          details: { serialNumber, recordCount: message.records.length }
        });

        if (onNFCRead) {
          onNFCRead(data);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setError('Fehler beim Lesen der NFC-Karte');
        setIsReading(false);
        
        logSecurityEvent({
          action: 'nfc_read_error',
          resourceType: 'nfc',
          success: false,
          details: { error: 'Reading error' }
        });
      });

    } catch (error) {
      console.error('NFC-Fehler:', error);
      setError('NFC-Berechtigung verweigert oder Fehler aufgetreten');
      setIsReading(false);
      
      logSecurityEvent({
        action: 'nfc_permission_denied',
        resourceType: 'nfc',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  const writeNFCData = async (data: string) => {
    if (!isNFCSupported) {
      setError('NFC wird von diesem Gerät nicht unterstützt');
      return;
    }

    try {
      setIsWriting(true);
      setError(null);

      // @ts-ignore - NDEFReader ist experimentell
      const ndef = new NDEFReader();
      
      await ndef.write({
        records: [{ recordType: "text", data }]
      });

      console.log('NFC-Daten geschrieben:', data);
      
      logSecurityEvent({
        action: 'nfc_write_success',
        resourceType: 'nfc',
        success: true,
        details: { dataLength: data.length }
      });

      if (onNFCWrite) {
        onNFCWrite({ data, timestamp: new Date().toISOString() });
      }

    } catch (error) {
      console.error('NFC-Schreibfehler:', error);
      setError('Fehler beim Schreiben der NFC-Karte');
      
      logSecurityEvent({
        action: 'nfc_write_error',
        resourceType: 'nfc',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          NFC-Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* NFC-Status */}
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          <span className="text-sm">NFC-Unterstützung:</span>
          <Badge variant={isNFCSupported ? "default" : "destructive"}>
            {isNFCSupported ? "✅ Verfügbar" : "❌ Nicht verfügbar"}
          </Badge>
        </div>

        {/* Sicherheitshinweis */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <div>🔒 Sichere NFC-Kommunikation</div>
                <div>📊 Alle Aktionen werden protokolliert</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fehler anzeigen */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aktionen */}
        <div className="space-y-2">
          <Button 
            onClick={startNFCRead}
            disabled={!isNFCSupported || isReading}
            className="w-full"
          >
            {isReading ? "📱 Lese NFC..." : "📖 NFC lesen"}
          </Button>

          <Button 
            onClick={() => writeNFCData("Employee-ID:12345")}
            disabled={!isNFCSupported || isWriting}
            variant="outline"
            className="w-full"
          >
            {isWriting ? "📱 Schreibe NFC..." : "✍️ Test-Daten schreiben"}
          </Button>
        </div>

        {/* Letzte Daten */}
        {lastReadData && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-xs text-green-700">
                  <div>✅ NFC gelesen: {lastReadData.serialNumber}</div>
                  <div>📅 {new Date(lastReadData.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};