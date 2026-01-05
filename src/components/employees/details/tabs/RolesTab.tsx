import { useEmployeeRolesData } from '@/integrations/supabase/hooks/useEmployeeRoles';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info } from "lucide-react";
import { SystemRoleCard } from './roles/SystemRoleCard';
import { FunctionalRolesCard } from './roles/FunctionalRolesCard';
import { PermissionLegendCard } from './roles/PermissionLegendCard';
import { PermissionMatrixCard } from './roles/PermissionMatrixCard';
import { RoleHierarchyCard } from './roles/RoleHierarchyCard';
import { AccessLogCard } from './roles/AccessLogCard';
import { SecurityNoticesCard } from './roles/SecurityNoticesCard';

interface RolesTabProps {
  employeeId: string;
}

export const RolesTab = ({ employeeId }: RolesTabProps) => {
  const data = useEmployeeRolesData(employeeId);

  // Echte Daten ohne Mock-Fallback
  const rolesData = {
    systemRole: data.systemRole || { role: 'employee', company_id: '' },
    functionalRoles: data.functionalRoles || [],
    permissions: data.permissions || [],
    hierarchy: data.hierarchy || null,
    accessLogs: data.accessLogs || [],
    categories: data.categories || [],
  };

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Rollen-Daten...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Fehler beim Laden der Daten</p>
          <p className="text-sm text-muted-foreground">
            {data.error instanceof Error ? data.error.message : 'Unbekannter Fehler'}
          </p>
        </div>
      </div>
    );
  }

  // Prüfen ob überhaupt Rollen-Daten vorhanden sind
  const hasAnyData = rolesData.functionalRoles.length > 0 || 
                     rolesData.permissions.length > 0 ||
                     rolesData.accessLogs.length > 0;

  if (!hasAnyData && rolesData.systemRole.role === 'employee') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rollen & Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine speziellen Rollen zugewiesen</h3>
            <p className="text-muted-foreground max-w-md">
              Diesem Mitarbeiter wurden noch keine funktionalen Rollen oder besonderen Berechtigungen zugewiesen. 
              Standard-Mitarbeiter-Berechtigungen sind aktiv.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zeile 1: System Role (Full Width) */}
      <SystemRoleCard systemRole={rolesData.systemRole} />

      {/* Zeile 2: Functional Roles (Full Width) */}
      {rolesData.functionalRoles.length > 0 && (
        <FunctionalRolesCard roles={rolesData.functionalRoles} />
      )}

      {/* Zeile 3: Permission Legend (Full Width) */}
      <PermissionLegendCard />

      {/* Zeile 4: Permission Matrix (Full Width, sehr groß) */}
      <PermissionMatrixCard />

      {/* Zeile 5: Role Hierarchy (Full Width) */}
      {rolesData.hierarchy && (
        <RoleHierarchyCard hierarchy={rolesData.hierarchy} />
      )}

      {/* Zeile 6: Access Log + Security Notices (2 Spalten) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccessLogCard logs={rolesData.accessLogs} employeeId={employeeId} />
        <SecurityNoticesCard />
      </div>
    </div>
  );
};
