import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Info } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { useEmployeeOrgContext } from "@/hooks/useEmployeeOrgContext";

interface HierarchyTeamSectionProps {
  employee: Employee | null;
  isEditing?: boolean;
  onFieldChange?: (tab: string, field: string, value: string) => void;
}

export const HierarchyTeamSection = ({ employee, isEditing = false, onFieldChange }: HierarchyTeamSectionProps) => {
  const { data: orgContext, isLoading } = useEmployeeOrgContext(employee?.id || '');

  const currentEmployee = {
    name: employee?.name || `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || '-',
    role: orgContext?.role?.role_type || employee?.position || '-'
  };

  const manager = orgContext?.manager;
  const teamMembers = orgContext?.teamMembers || [];

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Hierarchie & Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Kein Org-Context vorhanden
  if (!orgContext?.role && !orgContext?.unit) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Hierarchie & Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Keine Organisationszuordnung vorhanden.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bitte im Modul Organisationsdesign zuweisen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Hierarchie & Team
          {orgContext?.unit && (
            <span className="text-xs font-normal text-muted-foreground ml-2">
              ({orgContext.unit.name})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manager */}
        {manager ? (
          <div className="flex justify-center">
            <div className="text-center bg-gray-50 rounded-lg p-4 w-full max-w-xs">
              <p className="text-xs text-muted-foreground mb-1">Vorgesetzter</p>
              <p className="font-semibold">{manager.first_name} {manager.last_name}</p>
              <p className="text-xs text-muted-foreground">{manager.position || '-'}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-center bg-gray-50 rounded-lg p-4 w-full max-w-xs">
              <p className="text-xs text-muted-foreground mb-1">Vorgesetzter</p>
              <p className="text-sm text-muted-foreground italic">Nicht zugewiesen</p>
            </div>
          </div>
        )}

        {/* Connection line */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-300"></div>
        </div>

        {/* Current Employee */}
        <div className="flex justify-center">
          <div className="text-center bg-primary/10 border-2 border-primary rounded-lg p-4 w-full max-w-xs">
            <p className="font-bold text-primary">{currentEmployee.name}</p>
            <p className="text-xs text-muted-foreground">{currentEmployee.role}</p>
          </div>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <>
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-gray-300"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {teamMembers.slice(0, 6).map((member) => (
                <div key={member.id} className="text-center bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium">{member.first_name} {member.last_name}</p>
                  <p className="text-xs text-muted-foreground">{member.role_type}</p>
                </div>
              ))}
            </div>
            {teamMembers.length > 6 && (
              <p className="text-xs text-center text-muted-foreground">
                + {teamMembers.length - 6} weitere Teammitglieder
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
