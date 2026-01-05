
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, User } from 'lucide-react';
import { CompanyAdmin } from '../types';

interface AdminListItemProps {
  admin: CompanyAdmin;
  onResendInvitation: (email: string) => void;
}

export const AdminListItem: React.FC<AdminListItemProps> = ({ admin, onResendInvitation }) => {
  // Use full_name if available, otherwise fallback to name, or email as last resort
  const displayName = admin.full_name || admin.name || admin.email;
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-md mb-2">
      <div className="flex items-center">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium">{displayName}</h4>
          <p className="text-sm text-muted-foreground flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            {admin.email}
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onResendInvitation(admin.email)}
      >
        Einladung erneut senden
      </Button>
    </div>
  );
};
