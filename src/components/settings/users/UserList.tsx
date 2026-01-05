
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { User } from './types';
import { Badge } from '@/components/ui/badge';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  error,
  onEditUser,
  onDeleteUser
}) => {
  // Funktion zum Formatieren des Datums
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: de
      });
    } catch (e) {
      console.error('Fehler beim Formatieren des Datums:', e);
      return 'Ungültiges Datum';
    }
  };

  // Funktion zum Ermitteln des Badge-Stils basierend auf der Rolle
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'warning';
      case 'employee':
        return 'secondary';
      case 'superadmin':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Funktion zum Übersetzen der Rollenbezeichnung
  const translateRole = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      case 'employee':
        return 'Mitarbeiter';
      case 'superadmin':
        return 'Superadmin';
      default:
        return 'Benutzer';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">Benutzer werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h3 className="mt-2 text-lg font-medium">Fehler beim Laden der Benutzer</h3>
        <p className="mt-1 text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Keine Benutzer gefunden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Letzte Anmeldung</TableHead>
            <TableHead>Erstellt</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || 'Kein Name'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {translateRole(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
