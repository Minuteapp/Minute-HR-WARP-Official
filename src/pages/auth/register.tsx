
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useRegister } from '@/hooks/useRegister';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { RegisterHeader } from '@/components/auth/RegisterHeader';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const { isLoading, registrationError, handleSubmit } = useRegister();

  // Read invitation parameters from URL - validate and sanitize them
  const isInvitation = searchParams.get('invitation') === 'true';
  const companyId = searchParams.get('company');
  const roleParam = searchParams.get('role');
  
  // Validate companyId format if it exists (basic UUID validation)
  const isValidCompanyId = !companyId || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId);

  // Log parameters for debugging
  useEffect(() => {
    console.log('Register page parameters:', { isInvitation, companyId, isValidCompanyId, roleParam });
  }, [isInvitation, companyId, isValidCompanyId, roleParam]);

  const handleRegisterSubmit = (formParams: any) => {
    handleSubmit({
      ...formParams,
      roleParam // Direkt den String-Wert aus der URL übergeben
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white">
        <RegisterHeader 
          isInvitation={isInvitation}
          isValidCompanyId={isValidCompanyId}
        />

        <RegisterForm
          isLoading={isLoading}
          registrationError={registrationError}
          isInvitation={isInvitation}
          companyId={companyId}
          onSubmit={handleRegisterSubmit}
        />
      </Card>
    </div>
  );
};

export default RegisterPage;
