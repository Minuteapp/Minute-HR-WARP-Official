import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Search,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { 
  OrganizationalRole, 
  OrganizationalUnit, 
  UpdateOrganizationalRoleData 
} from '@/types/organizational-structure';

interface OrganizationalRolesTableProps {
  roles: OrganizationalRole[];
  units: OrganizationalUnit[];
  onUpdateRole: (data: UpdateOrganizationalRoleData) => Promise<boolean>;
  onDeleteRole: (roleId: string) => Promise<boolean>;
}

const getRoleTypeLabel = (roleType: string) => {
  switch (roleType) {
    case 'manager':
      return 'Manager';
    case 'member':
      return 'Mitglied';
    case 'deputy':
      return 'Stellvertreter';
    case 'assistant':
      return 'Assistent';
    case 'viewer':
      return 'Betrachter';
    default:
      return roleType;
  }
};

const getRoleTypeBadgeVariant = (roleType: string) => {
  switch (roleType) {
    case 'manager':
      return 'default';
    case 'deputy':
      return 'secondary';
    case 'assistant':
      return 'outline';
    case 'member':
      return 'secondary';
    case 'viewer':
      return 'outline';
    default:
      return 'outline';
  }
};

export const OrganizationalRolesTable: React.FC<OrganizationalRolesTableProps> = ({
  roles,
  units,
  onUpdateRole,
  onDeleteRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = roles.filter(role => {
    const unit = units.find(u => u.id === role.organizational_unit_id);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      role.user_email?.toLowerCase().includes(searchLower) ||
      role.user_name?.toLowerCase().includes(searchLower) ||
      unit?.name.toLowerCase().includes(searchLower) ||
      getRoleTypeLabel(role.role_type).toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteRole = async (role: OrganizationalRole) => {
    const unit = units.find(u => u.id === role.organizational_unit_id);
    const confirmMessage = `Möchten Sie die Rolle "${getRoleTypeLabel(role.role_type)}" von ${role.user_name || role.user_email} in "${unit?.name}" wirklich entfernen?`;
    
    if (confirm(confirmMessage)) {
      await onDeleteRole(role.id);
    }
  };

  const getPermissionSummary = (permissions: Record<string, any>) => {
    const activePermissions = Object.entries(permissions)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        switch (key) {
          case 'view': return 'Anzeigen';
          case 'edit': return 'Bearbeiten';
          case 'manage': return 'Verwalten';
          case 'assign_roles': return 'Rollen';
          case 'manage_budget': return 'Budget';
          case 'approve_requests': return 'Genehmigen';
          default: return key;
        }
      });
    
    return activePermissions.length > 0 ? activePermissions.join(', ') : 'Keine';
  };

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Noch keine Rollen zugewiesen.</p>
        <p className="text-sm">Weisen Sie Benutzern Rollen in Organisationseinheiten zu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Such- und Filter-Leiste */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Rollen suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredRoles.length} von {roles.length} Rollen
        </div>
      </div>

      {/* Tabelle */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benutzer</TableHead>
              <TableHead>Organisationseinheit</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Berechtigungen</TableHead>
              <TableHead>Gültig bis</TableHead>
              <TableHead>Zugewiesen am</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Keine Rollen gefunden.' : 'Keine Rollen vorhanden.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const unit = units.find(u => u.id === role.organizational_unit_id);
                
                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-muted">
                          <User className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {role.user_name || 'Unbekannt'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {role.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{unit?.name || 'Unbekannt'}</div>
                          {unit?.code && (
                            <div className="text-sm text-muted-foreground">
                              {unit.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getRoleTypeBadgeVariant(role.role_type) as any}>
                        {getRoleTypeLabel(role.role_type)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {getPermissionSummary(role.permissions)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {role.valid_until ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(role.valid_until), 'dd.MM.yyyy', { locale: de })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unbegrenzt</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(role.created_at), 'dd.MM.yyyy', { locale: de })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRole(role)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Entfernen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};