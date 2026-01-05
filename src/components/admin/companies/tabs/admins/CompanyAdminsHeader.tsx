
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface CompanyAdminsHeaderProps {
  onAddAdmin: () => void;
}

export const CompanyAdminsHeader: React.FC<CompanyAdminsHeaderProps> = ({ onAddAdmin }) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Administratoren</h3>
      <Button onClick={onAddAdmin} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Admin hinzufügen
      </Button>
    </div>
  );
};
