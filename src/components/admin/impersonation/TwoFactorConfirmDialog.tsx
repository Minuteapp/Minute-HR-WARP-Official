import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, AlertTriangle, Loader2, KeyRound } from 'lucide-react';
import { impersonationService } from '@/services/impersonationService';

interface TwoFactorConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  targetUserName: string;
}

export function TwoFactorConfirmDialog({
  open,
  onOpenChange,
  onVerified,
  targetUserName
}: TwoFactorConfirmDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Bitte geben Sie den vollständigen 6-stelligen Code ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await impersonationService.verify2FAForActAs(code, useBackupCode);
      
      if (result.success) {
        onVerified();
        onOpenChange(false);
        setCode('');
      } else {
        setError(result.error || 'Ungültiger Code. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      setError('Fehler bei der Verifizierung. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setUseBackupCode(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            2FA-Bestätigung erforderlich
          </DialogTitle>
          <DialogDescription>
            Für den Act-as Modus ist eine zusätzliche Authentifizierung erforderlich.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Sie sind dabei, als <strong>{targetUserName}</strong> zu agieren. 
              Alle Änderungen werden im Namen dieses Benutzers durchgeführt.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {useBackupCode 
                ? 'Geben Sie einen Ihrer Backup-Codes ein'
                : 'Geben Sie den Code aus Ihrer Authenticator-App ein'}
            </p>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  setError(null);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              variant="link"
              size="sm"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-muted-foreground"
            >
              <KeyRound className="h-3 w-3 mr-1" />
              {useBackupCode ? 'Authenticator-App verwenden' : 'Backup-Code verwenden'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifiziere...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Bestätigen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
