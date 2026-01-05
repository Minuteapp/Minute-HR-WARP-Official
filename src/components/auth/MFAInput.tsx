import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Key } from 'lucide-react';

interface MFAInputProps {
  onVerify: (code: string) => Promise<boolean>;
  onUseBackupCode: (code: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
}

export const MFAInput: React.FC<MFAInputProps> = ({
  onVerify,
  onUseBackupCode,
  isLoading = false,
  error
}) => {
  const [code, setCode] = useState<string>('');
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!code.trim()) {
      setLocalError('Bitte geben Sie einen Code ein.');
      return;
    }

    try {
      let success: boolean;
      
      if (useBackupCode) {
        success = await onUseBackupCode(code.trim().toUpperCase());
      } else {
        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
          setLocalError('Der Code muss genau 6 Ziffern enthalten.');
          return;
        }
        success = await onVerify(code);
      }

      if (!success) {
        setLocalError(useBackupCode ? 'Ungültiger Backup-Code.' : 'Ungültiger Authenticator-Code.');
        setCode('');
      }
    } catch (err) {
      setLocalError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (useBackupCode) {
      // Backup codes: letters and numbers, max 8 characters
      setCode(value.toUpperCase().slice(0, 8));
    } else {
      // TOTP codes: only numbers, max 6 digits
      setCode(value.replace(/\D/g, '').slice(0, 6));
    }
    
    if (localError) setLocalError('');
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Zwei-Faktor-Authentifizierung</h3>
        <p className="text-sm text-gray-600">
          {useBackupCode 
            ? 'Geben Sie einen Ihrer Backup-Codes ein:'
            : 'Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder={useBackupCode ? "ABC123DEF" : "123456"}
              className="text-center text-2xl font-mono pl-10"
              disabled={isLoading}
              autoComplete="one-time-code"
              autoFocus
            />
            {useBackupCode ? (
              <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            ) : (
              <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {(localError || error) && (
            <p className="text-sm text-red-600">{localError || error}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? 'Überprüfe...' : 'Code verifizieren'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setLocalError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
            disabled={isLoading}
          >
            {useBackupCode 
              ? 'Authenticator-Code verwenden' 
              : 'Backup-Code verwenden'
            }
          </button>
        </div>
      </form>
    </div>
  );
};