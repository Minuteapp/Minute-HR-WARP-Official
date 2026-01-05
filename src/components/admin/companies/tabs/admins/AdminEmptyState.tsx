
import React from 'react';
import { Button } from '@/components/ui/button';

interface AdminEmptyStateProps {
  onAddAdmin: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({ onAddAdmin }) => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-md border border-primary/20">
      <p className="text-gray-500">Keine Administratoren gefunden</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddAdmin}
        className="mt-2"
      >
        Admin hinzufügen
      </Button>
    </div>
  );
};
