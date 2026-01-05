
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { RegisterParams } from '@/hooks/useRegister';
import { PasswordValidationResult } from '@/utils/validation/passwordValidator';
import { CaptchaVerification } from './CaptchaVerification';

interface RegisterFormProps {
  isLoading: boolean;
  registrationError: string | null;
  isInvitation: boolean;
  companyId: string | null;
  onSubmit: (params: RegisterParams) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  isLoading,
  registrationError,
  isInvitation,
  companyId,
  onSubmit
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordValidation && !passwordValidation.isValid) {
      return;
    }
    
    onSubmit({
      email,
      password,
      confirmPassword,
      isInvitation,
      companyId,
      roleParam: null // Wird in der Hauptkomponente gesetzt
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          E-Mail-Adresse
        </label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="name@firma.com"
            className="pl-10"
            required
          />
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Passwort
        </label>
        <div className="relative">
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onValidationChange={setPasswordValidation}
            showStrengthIndicator
            showValidationErrors
            placeholder="••••••••"
            className="pl-10"
            required
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Passwort bestätigen
        </label>
        <div className="relative">
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10"
            required
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isInvitation && companyId && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Sie erstellen ein Administratorkonto für eine Firma. Nach der Registrierung erhalten Sie vollen Zugriff auf die Firmenverwaltung.
          </p>
        </div>
      )}

      <CaptchaVerification 
        onVerify={setIsCaptchaVerified}
        disabled={isLoading}
      />

      {registrationError && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {registrationError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          isLoading || 
          password !== confirmPassword ||
          (passwordValidation && !passwordValidation.isValid) ||
          !isCaptchaVerified
        }
      >
        {isLoading ? "Konto wird erstellt..." : "Konto erstellen"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Haben Sie bereits ein Konto?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:text-primary/90">
            Anmelden
          </Link>
        </p>
      </div>
    </form>
  );
};
