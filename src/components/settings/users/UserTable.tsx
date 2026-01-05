
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash,
  Check,
  Ban
} from 'lucide-react';
import { User } from '@/types/user.types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable = ({ 
  users, 
  isLoading, 
  error, 
  onEditUser, 
  onDeleteUser 
}: UserTableProps) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive border border-destructive/20 rounded-md">
        <p>Fehler beim Laden der Benutzerdaten: {error.message}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Keine Benutzer gefunden. Fügen Sie neue Benutzer hinzu.</p>
      </div>
    );
  }

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

  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Letzter Login</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              className={expandedUser === user.id ? 'bg-muted/50' : ''}
              onClick={() => toggleExpand(user.id)}
            >
              <TableCell className="font-medium">{user.name || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || 'Benutzer'}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.active ? "outline" : "destructive"}
                  className={user.active ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                >
                  {user.active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.lastLogin)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menü öffnen</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditUser(user);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUser(user.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
