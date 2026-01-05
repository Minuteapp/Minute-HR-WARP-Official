import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, Lock, Unlock, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const roleLabels: Record<UserRole, string> = {
  superadmin: 'SuperAdmin',
  admin: 'Administrator',
  hr_admin: 'HR-Admin',
  team_lead: 'Teamleiter',
  employee: 'Mitarbeiter',
};

const roleColors: Record<UserRole, string> = {
  superadmin: 'bg-red-100 text-red-700 border-red-200',
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  hr_admin: 'bg-blue-100 text-blue-700 border-blue-200',
  team_lead: 'bg-green-100 text-green-700 border-green-200',
  employee: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const PermissionDebugPanel: React.FC = () => {
  const { roles, isLoading: rolesLoading } = useUserRole();
  const { isSuperAdmin } = useRolePermissions();
  const companyId = roles[0]?.company_id || null;

  // Lade alle Berechtigungen für die aktuelle Rolle
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['debug-permissions', roles],
    queryFn: async () => {
      if (!roles.length) return [];
      
      const roleValues = roles.map(r => r.role);
      
      const { data, error } = await supabase
        .from('role_permission_matrix')
        .select('*')
        .in('role', roleValues)
        .order('module_name');

      if (error) {
        console.error('Fehler beim Laden der Berechtigungen:', error);
        return [];
      }

      return data || [];
    },
    enabled: roles.length > 0,
  });

  // Nur für Admins sichtbar
  if (!isSuperAdmin && !roles.some(r => r.role === 'admin')) {
    return null;
  }

  if (rolesLoading || permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Lade Berechtigungen...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Gruppiere Berechtigungen nach Modul
  type PermissionRow = NonNullable<typeof permissions>[number];
  const permissionsByModule: Record<string, PermissionRow[]> = {};
  
  if (permissions) {
    permissions.forEach((perm) => {
      const module = perm.module_name || 'Unbekannt';
      if (!permissionsByModule[module]) {
        permissionsByModule[module] = [];
      }
      permissionsByModule[module].push(perm);
    });
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-amber-600" />
            Berechtigungs-Debug
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
            <Eye className="h-3 w-3 mr-1" />
            Nur für Admins
          </Badge>
        </div>
        <CardDescription>
          Übersicht über alle aktiven Berechtigungen des aktuellen Benutzers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Aktuelle Rollen */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Aktive Rollen
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((roleData, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={roleColors[roleData.role as UserRole] || 'bg-gray-100'}
                >
                  {roleLabels[roleData.role as UserRole] || roleData.role}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="bg-gray-100">
                Keine Rolle zugewiesen (Standard: Mitarbeiter)
              </Badge>
            )}
          </div>
        </div>

        {/* Firma */}
        {companyId && (
          <div className="text-xs text-muted-foreground">
            Firma-ID: <code className="bg-muted px-1 rounded">{companyId}</code>
          </div>
        )}

        {/* Berechtigungen nach Modul */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Modul-Berechtigungen
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {Object.entries(permissionsByModule).map(([module, perms]) => (
                <div
                  key={module}
                  className="p-2 rounded-md bg-white border border-amber-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{module.replace(/_/g, ' ')}</span>
                    {perms?.[0]?.is_visible ? (
                      <Unlock className="h-3 w-3 text-green-500" />
                    ) : (
                      <Lock className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {perms?.map((perm, idx) => {
                      const rawActions = perm.allowed_actions;
                      const actions: string[] = Array.isArray(rawActions) 
                        ? (rawActions as string[])
                        : typeof rawActions === 'string'
                          ? [rawActions]
                          : [];
                      return (
                        <React.Fragment key={idx}>
                          {actions.map((action: string, actionIdx: number) => (
                            <Badge
                              key={`${idx}-${actionIdx}`}
                              variant="secondary"
                              className="text-xs py-0"
                            >
                              {action}
                            </Badge>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(permissionsByModule).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Keine spezifischen Berechtigungen gefunden
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Hinweis */}
        <div className="text-xs text-amber-700 bg-amber-100/50 p-2 rounded border border-amber-200">
          ℹ️ Diese Ansicht ist nur für Administratoren sichtbar und zeigt die effektiven
          Berechtigungen basierend auf der Rollen-Berechtigungsmatrix.
        </div>
      </CardContent>
    </Card>
  );
};
