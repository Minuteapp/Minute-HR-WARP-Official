import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { SettingsRole, CONTAINER_VISIBILITY } from '@/types/unified-settings';

interface SettingsPermissionGuardProps {
  userRole: SettingsRole;
  requiredRole?: SettingsRole;
  children: React.ReactNode;
  showFallback?: boolean;
}

const ROLE_HIERARCHY: Record<SettingsRole, number> = {
  employee: 0,
  team_leader: 1,
  hr_admin: 2,
  superadmin: 3
};

const ROLE_LABELS: Record<SettingsRole, string> = {
  employee: 'Mitarbeiter',
  team_leader: 'Teamleiter',
  hr_admin: 'HR-Administrator',
  superadmin: 'Super-Administrator'
};

export function SettingsPermissionGuard({
  userRole,
  requiredRole = 'team_leader',
  children,
  showFallback = true
}: SettingsPermissionGuardProps) {
  const hasAccess = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];

  if (!hasAccess) {
    if (!showFallback) {
      return null;
    }

    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-muted mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Zugriff eingeschränkt</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Diese Einstellungen erfordern mindestens die Rolle "{ROLE_LABELS[requiredRole]}".
            Ihre aktuelle Rolle: {ROLE_LABELS[userRole]}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Hook to check role access
export function useSettingsPermission(userRole: SettingsRole) {
  const hasRole = (requiredRole: SettingsRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  };

  const getVisibleContainerTypes = () => {
    return CONTAINER_VISIBILITY[userRole];
  };

  const canAccessContainer = (containerType: string): boolean => {
    return CONTAINER_VISIBILITY[userRole].includes(containerType as any);
  };

  return {
    hasRole,
    getVisibleContainerTypes,
    canAccessContainer,
    isEmployee: userRole === 'employee',
    isTeamLeader: userRole === 'team_leader',
    isHRAdmin: userRole === 'hr_admin',
    isSuperAdmin: userRole === 'superadmin'
  };
}
