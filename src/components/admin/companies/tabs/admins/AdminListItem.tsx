
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Mail, Pencil, Trash2 } from 'lucide-react';
import { CompanyAdmin } from '../../types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';

interface AdminListItemProps {
  admin: CompanyAdmin;
  handleSendInvitation: (email: string) => void;
  handleDeleteAdmin: (id: string, email: string) => void;
  onEditAdmin?: (admin: CompanyAdmin) => void;
}

export const AdminListItem: React.FC<AdminListItemProps> = ({
  admin,
  handleSendInvitation,
  handleDeleteAdmin,
  onEditAdmin,
}) => {
  // Use name properties with fallbacks
  const displayName = admin.full_name || admin.name || admin.email;
  // Use role with fallback
  const adminRole = admin.role || 'Administrator';
  
  return (
    <TableRow key={admin.id}>
      <TableCell className="font-medium">{displayName}</TableCell>
      <TableCell>{admin.email}</TableCell>
      <TableCell className="capitalize">{adminRole}</TableCell>
      <TableCell><StatusBadge status={admin.status} /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {admin.status !== 'active' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendInvitation(admin.email)}
            >
              <Mail className="h-4 w-4 mr-1" />
              {admin.status === 'created' ? 'Einladung senden' : 'Einladung erneut senden'}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Menü öffnen</span>
                <span className="h-4 w-4">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEditAdmin && (
                <DropdownMenuItem onClick={() => onEditAdmin(admin)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
