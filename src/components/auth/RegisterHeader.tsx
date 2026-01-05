
import React from 'react';

interface RegisterHeaderProps {
  isInvitation: boolean;
  isValidCompanyId: boolean;
}

export const RegisterHeader: React.FC<RegisterHeaderProps> = ({ 
  isInvitation,
  isValidCompanyId
}) => {
  return (
    <div className="text-center">
      <img src="/lovable-uploads/bef503cb-bb90-4755-b33e-e6aa8f556d00.png" alt="Logo" className="h-12 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">Konto erstellen</h2>
      <p className="mt-2 text-sm text-gray-600">
        {isInvitation 
          ? "Erstellen Sie Ihr Administratorkonto" 
          : "Erstellen Sie ein Konto, um fortzufahren"}
      </p>
      {!isValidCompanyId && (
        <p className="mt-2 text-sm text-red-600">
          Warnung: Die Firmen-ID in der URL scheint ungültig zu sein.
        </p>
      )}
    </div>
  );
};
