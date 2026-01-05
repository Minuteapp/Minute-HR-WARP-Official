import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [totpUri, setTotpUri] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && step === 'setup') {
      enrollMFA();
    }
  }, [isOpen, step]);

  const enrollMFA = async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase Auth native MFA enrollment
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'HR-App Authenticator'
      });

      if (error) throw error;

      if (data) {
        setTotpUri(data.totp.uri);
        setTotpSecret(data.totp.secret);
        setFactorId(data.id);
        
        // Generate backup codes (store these securely in production)
        const codes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim MFA-Setup",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Ungültiger Code",
        description: "Bitte geben Sie einen 6-stelligen Code ein."
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create a challenge for the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (challengeError) throw challengeError;

      // Verify the TOTP code using Supabase Auth MFA
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Ungültiger Verifikationscode",
          description: "Der eingegebene Code ist nicht korrekt. Bitte versuchen Sie es erneut."
        });
        return;
      }

      // Optionally save backup codes to user_mfa_settings for recovery
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase
          .from('user_mfa_settings')
          .upsert({
            user_id: user.id,
            mfa_enabled: true,
            backup_codes: backupCodes,
            last_used_at: new Date().toISOString()
          });
      }

      setStep('complete');
      toast({
        title: "MFA erfolgreich aktiviert",
        description: "Zwei-Faktor-Authentifizierung ist jetzt für Ihr Konto aktiviert."
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Aktivieren von MFA",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "In Zwischenablage kopiert",
      description: "Der Text wurde in die Zwischenablage kopiert."
    });
  };

  const handleComplete = () => {
    setStep('setup');
    setVerificationCode('');
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <CardTitle>Zwei-Faktor-Authentifizierung einrichten</CardTitle>
          </div>
          <CardDescription>
            Erhöhen Sie die Sicherheit Ihres Kontos mit MFA
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'setup' && (
            <>
              <div className="text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Schritt 1: QR-Code scannen</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scannen Sie diesen QR-Code mit Ihrer Authenticator-App (z.B. Google Authenticator, Authy)
                  </p>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : totpUri ? (
                    <div className="flex justify-center">
                      <QRCodeSVG value={totpUri} size={200} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">QR-Code wird generiert...</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Alternativ: Manuell eingeben</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={totpSecret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(totpSecret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button onClick={() => setStep('verify')}>
                  Weiter zur Verifizierung
                </Button>
              </div>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Schritt 2: Code verifizieren</h3>
                  <p className="text-sm text-gray-600">
                    Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Input
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl font-mono"
                  />
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Backup-Codes</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Speichern Sie diese Backup-Codes sicher. Sie können sie verwenden, falls Sie keinen Zugriff auf Ihr Authenticator-Gerät haben:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-2 rounded border font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  >
                    Alle kopieren
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('setup')}>
                  Zurück
                </Button>
                <Button 
                  onClick={verifyAndEnableMFA}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'Aktiviere MFA...' : 'MFA aktivieren'}
                </Button>
              </div>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  MFA erfolgreich aktiviert!
                </h3>
                <p className="text-gray-600">
                  Ihr Konto ist jetzt mit Zwei-Faktor-Authentifizierung geschützt.
                  Bei der nächsten Anmeldung werden Sie nach einem Code aus Ihrer Authenticator-App gefragt.
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-4 h-4 mr-1" />
                  Sicherheit aktiviert
                </Badge>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={handleComplete}>
                  Fertig
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};